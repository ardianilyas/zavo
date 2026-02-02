import { router, protectedProcedure } from "@/trpc/init";
import { AdminService } from "../services/admin.service";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const adminRouter = router({
  getAnalytics: protectedProcedure
    .query(async ({ ctx }) => {
      // Role Check
      const role = (ctx.session.user as any).role;
      if (role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to access admin resources",
        });
      }

      return await AdminService.getAnalytics();
    }),

  getUsers: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      search: z.string().optional(),
      status: z.enum(["all", "active", "suspended", "banned"]).default("all")
    }))
    .query(async ({ input, ctx }) => {
      const role = (ctx.session.user as any).role;
      if (role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return await AdminService.getUsers(input);
    }),

  toggleBan: protectedProcedure
    .input(z.object({
      userId: z.string(),
      action: z.enum(["BAN", "UNBAN"]),
      reason: z.string().optional(), // Required if BAN
      duration: z.number().optional() // Optional, for temporary suspension
    }))
    .mutation(async ({ input, ctx }) => {
      const role = (ctx.session.user as any).role;
      if (role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      if (input.action === "BAN") {
        if (!input.reason) throw new TRPCError({ code: "BAD_REQUEST", message: "Reason required for banning" });
        await AdminService.banUser(input.userId, input.reason, input.duration);
      } else {
        await AdminService.unbanUser(input.userId);
      }

      return { success: true };
    })
});
