import { z } from "zod";
import { router, publicProcedure } from "../init";
import { userRouter } from "./user";
import { donationRouter } from "./donation";

export const appRouter = router({
  hello: publicProcedure.query(() => {
    return "Hello World";
  }),
  user: userRouter,
  donation: donationRouter,
});

export type AppRouter = typeof appRouter;
