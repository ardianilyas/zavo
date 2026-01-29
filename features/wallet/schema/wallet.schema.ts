import { INDONESIAN_BANKS } from "@/lib/banks";
import * as z from "zod";

const bankCodes = INDONESIAN_BANKS.map((b) => b.code) as [string, ...string[]];

export const createWithdrawalSchema = z.object({
  amount: z.number().min(50000, "Minimum withdrawal is Rp 50.000"),
  bankCode: z.enum(bankCodes),
  accountNumber: z.string().min(5, "Account number is required"),
  accountName: z.string().min(2, "Account holder name is required"),
  notes: z.string().optional(),
});

export type CreateWithdrawalInput = z.infer<typeof createWithdrawalSchema>;
