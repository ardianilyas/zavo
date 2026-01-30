import * as z from "zod";

export const donationSchema = z.object({
  amount: z.coerce.number().min(10000, "Minimum donation is Rp 10.000"),
  donorName: z.string().min(1, "Name is required"),
  donorEmail: z.string().email().optional().or(z.literal("")),
  message: z.string().max(255).optional(),
  mediaUrl: z.string().optional(),
  mediaDuration: z.number().optional(),
});

export type DonationInput = z.infer<typeof donationSchema>;
