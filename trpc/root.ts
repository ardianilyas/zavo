import { router, publicProcedure } from "./init";
import { userRouter } from "@/features/user/route/router";
import { creatorRouter } from "@/features/creator/route/router";
import { donationRouter } from "@/features/donation/route/router";
import { payoutRouter } from "@/features/wallet/route/router";
import { goalRouter } from "@/features/goal/route/router";
import { adminRouter } from "@/features/admin/route/router";

export const appRouter = router({
  user: userRouter,
  creator: creatorRouter,
  donation: donationRouter,
  payout: payoutRouter,
  goal: goalRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
