import * as z from "zod";

export const createProfileSchema = z.object({
  username: z.string().min(3, "Min 3 chars").max(20, "Max 20 chars").regex(/^[a-zA-Z0-9_]+$/, "Alphanumeric only"),
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
