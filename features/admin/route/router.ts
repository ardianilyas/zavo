import { router, protectedProcedure } from "@/trpc/init";
import { AdminService } from "../services/admin.service";
import { TRPCError } from "@trpc/server";

export const adminRouter = router({
  getAnalytics: protectedProcedure
    .query(async ({ ctx }) => {
      // Role Check
      // We assume role is available on session.user based on our auth config
      const role = (ctx.session.user as any).role;

      if (role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to access admin resources",
        });
      }

      return await AdminService.getAnalytics();
    }),
});
