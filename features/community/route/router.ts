
import { router, protectedProcedure, publicProcedure } from "@/trpc/init";
import { CommunityService } from "../services/community.service";
import { z } from "zod";

export const communityRouter = router({
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(3),
      description: z.string().optional(),
      slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes")
    }))
    .mutation(async ({ input, ctx }) => {
      return await CommunityService.createCommunity(ctx.session.user.id, input);
    }),

  join: protectedProcedure
    .input(z.object({
      communityId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      return await CommunityService.joinCommunity(ctx.session.user.id, input.communityId);
    }),

  getAll: publicProcedure
    .query(async () => {
      return await CommunityService.getCommunities();
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return await CommunityService.getCommunityBySlug(input.slug);
    }),

  getMyCommunities: protectedProcedure
    .query(async ({ ctx }) => {
      return await CommunityService.getMyCommunity(ctx.session.user.id);
    })
});
