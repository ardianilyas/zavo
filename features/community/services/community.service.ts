import { db } from "@/db";
import { community, communityMember, creator, user } from "@/db/schema";
import { eq, and, desc, count, sql } from "drizzle-orm";
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

  static async leaveCommunity(userId: string, communityId: string) {
    const memberCreator = await db.query.creator.findFirst({
      where: eq(creator.userId, userId)
    });

    if (!memberCreator) throw new TRPCError({ code: "BAD_REQUEST", message: "Not a creator" });

    // Check if is owner - cannot leave own community
    const comm = await db.query.community.findFirst({
      where: eq(community.id, communityId)
    });

    if (comm?.ownerId === memberCreator.id) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot leave your own community. Delete it instead." });
    }

    await db.delete(communityMember)
      .where(and(
        eq(communityMember.communityId, communityId),
        eq(communityMember.creatorId, memberCreator.id)
      ));

    return { success: true };
  }

  static async getCommunities(userId?: string) {
    // Get all communities with owner info
    const communities = await db.select({
      id: community.id,
      name: community.name,
      description: community.description,
      slug: community.slug,
      createdAt: community.createdAt,
      owner: {
        id: creator.id,
        name: creator.name,
        username: creator.username,
        image: creator.image
      }
    })
      .from(community)
      .leftJoin(creator, eq(community.ownerId, creator.id))
      .orderBy(desc(community.createdAt));

    // Get member counts for each community
    const memberCounts = await db.select({
      communityId: communityMember.communityId,
      count: count()
    })
      .from(communityMember)
      .groupBy(communityMember.communityId);

    const countMap = new Map(memberCounts.map(c => [c.communityId, c.count]));

    // Check which communities the current user has joined (if userId provided)
    let joinedCommunityIds: Set<string> = new Set();
    if (userId) {
      const userCreator = await db.query.creator.findFirst({
        where: eq(creator.userId, userId)
      });

      if (userCreator) {
        const memberships = await db.select({ communityId: communityMember.communityId })
          .from(communityMember)
          .where(eq(communityMember.creatorId, userCreator.id));

        joinedCommunityIds = new Set(memberships.map(m => m.communityId));
      }
    }

    return communities.map(c => ({
      ...c,
      memberCount: countMap.get(c.id) || 0,
      isJoined: joinedCommunityIds.has(c.id)
    }));
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
