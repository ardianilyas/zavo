
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      username: {
        type: "string",
      },
      bio: {
        type: "string",
      },
      streamToken: {
        type: "string",
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false, // Don't allow user to set this
      },
      banned: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      suspendedUntil: {
        type: "date",
        required: false,
        input: false,
      },
    }
  }
});
