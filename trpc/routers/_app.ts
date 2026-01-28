import { router, publicProcedure } from "../init";
import { userRouter } from "./user";
import { creatorRouter } from "./creator";
import { donationRouter } from "./donation";

export const appRouter = router({
  hello: publicProcedure.query(() => {
    return "Hello World";
  }),
  user: userRouter,
  donation: donationRouter,
  creator: creatorRouter,
});

export type AppRouter = typeof appRouter;
