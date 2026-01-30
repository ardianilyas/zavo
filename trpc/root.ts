import { router, publicProcedure } from "./init";
import { userRouter } from "@/features/user/route/router";
import { creatorRouter } from "@/features/creator/route/router";
import { donationRouter } from "@/features/donation/route/router";
import { payoutRouter } from "@/features/wallet/route/router";

export const appRouter = router({
  hello: publicProcedure.query(() => {
    return "Hello World";
  }),
  user: userRouter,
  donation: donationRouter,
  creator: creatorRouter,
  payout: payoutRouter,
});

export type AppRouter = typeof appRouter;
