import { db } from "@/db";
import { community, communityMember, creator, user } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export class CommunityService {

  static async createCommunity(ownerUserId: string, data: { name: string; description?: string; slug: string }) {
    // 1. Get Creator ID
    const owner = await db.query.creator.findFirst({
      where: eq(creator.userId, ownerUserId)
    });

    if (!owner) throw new TRPCError({ code: "BAD_REQUEST", message: "Not a creator" });
    if (!owner.canCreateCommunity) throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to create community" });

    // 2. Check if already has community
    const existing = await db.query.community.findFirst({
      where: eq(community.ownerId, owner.id)
    });
    if (existing) throw new TRPCError({ code: "CONFLICT", message: "You already have a community" });

    // 3. Create
    const [newCommunity] = await db.insert(community).values({
      ownerId: owner.id,
      name: data.name,
      description: data.description,
      slug: data.slug
    }).returning();

    // 4. Add owner as member? (Optional, but usually yes)
    await db.insert(communityMember).values({
      communityId: newCommunity.id,
      creatorId: owner.id
    });

    return newCommunity;
  }

  static async joinCommunity(userId: string, communityId: string) {
    const memberCreator = await db.query.creator.findFirst({
      where: eq(creator.userId, userId)
    });

    if (!memberCreator) throw new TRPCError({ code: "BAD_REQUEST", message: "Only creators can join communities" });

    // Check if already member
    const existing = await db.query.communityMember.findFirst({
      where: and(
        eq(communityMember.communityId, communityId),
        eq(communityMember.creatorId, memberCreator.id)
      )
    });

    if (existing) throw new TRPCError({ code: "CONFLICT", message: "Already a member" });

    await db.insert(communityMember).values({
      communityId: communityId,
      creatorId: memberCreator.id
    });

    return { success: true };
  }

  static async getCommunities() {
    // List all communities
    return await db.query.community.findMany({
      with: {
        // We can fetch owner details if relation defined in schema (drizzle relations)
        // For now simplified
      },
      orderBy: [desc(community.createdAt)]
    });
  }

  static async getCommunityBySlug(slug: string) {
    const comm = await db.query.community.findFirst({
      where: eq(community.slug, slug)
    });
    if (!comm) throw new TRPCError({ code: "NOT_FOUND" });

    // Fetch members
    // Real app would paginate members
    const members = await db.select({
      id: communityMember.id,
      creator: {
        name: creator.name,
        username: creator.username,
        image: creator.image
      },
      joinedAt: communityMember.joinedAt
    })
      .from(communityMember)
      .leftJoin(creator, eq(communityMember.creatorId, creator.id))
      .where(eq(communityMember.communityId, comm.id));

    return {
      ...comm,
      members: members.map(m => ({
        ...m.creator,
        role: m.creator?.username // simplified
      }))
    };
  }

  static async getMyCommunity(userId: string) {
    const c = await db.query.creator.findFirst({ where: eq(creator.userId, userId) });
    if (!c) return null;

    // Community I own
    const owned = await db.query.community.findFirst({ where: eq(community.ownerId, c.id) });

    // Communities I joined
    const joined = await db.select({
      community: community
    })
      .from(communityMember)
      .leftJoin(community, eq(communityMember.communityId, community.id))
      .where(eq(communityMember.creatorId, c.id));

    return {
      owned,
      joined: joined.map(j => j.community).filter(Boolean)
    };
  }
}
