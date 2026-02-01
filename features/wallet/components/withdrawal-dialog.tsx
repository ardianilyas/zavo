"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Landmark } from "lucide-react";
import { createWithdrawalSchema, CreateWithdrawalInput } from "../schema/wallet.schema";
import { useWithdraw } from "../hooks/use-wallet";
import { INDONESIAN_BANKS } from "@/lib/banks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/client";

interface WithdrawalDialogProps {
  children: React.ReactNode;
  creatorId: string;
  currentBalance: number;
  onSuccess?: () => void;
}

export function WithdrawalDialog({ children, creatorId, currentBalance, onSuccess }: WithdrawalDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: profiles } = api.creator.myProfiles.useQuery();
  const currentProfile = profiles?.find(p => p.id === creatorId);

  const form = useForm<CreateWithdrawalInput>({
    resolver: zodResolver(createWithdrawalSchema) as any,
    defaultValues: {
      amount: 50000,
      bankCode: "BCA",
      accountNumber: "",
      accountName: "",
      notes: "",
      saveDetails: false,
    },
  });

  // Prefill form if profile has saved details
  useEffect(() => {
    if (currentProfile?.bankCode) {
      // Only set if user hasn't typed anything (or on initial load)
      // Check if values are still default/empty to avoid overwriting user input
      const values = form.getValues();
      if (!values.accountNumber && !values.accountName) {
        form.reset({
          amount: values.amount,
          // @ts-ignore
          bankCode: currentProfile.bankCode,
          accountNumber: currentProfile.accountNumber || "",
          accountName: currentProfile.accountName || "",
          notes: values.notes,
          saveDetails: true // Auto-check if we found details? Or maybe keep unchecked. Let's keep it unchecked or true if they want to update? 
          // Actually, if they already saved, maybe they want to keep it saved.
          // But strict logic: if found, prefill.
        });
        // Ensure bankCode is set correctly even if not in default generic list (though it should be)
        form.setValue("bankCode", currentProfile.bankCode as any);
      }
    }
  }, [currentProfile, form]);

  const { mutate, isPending } = useWithdraw(() => {
    setOpen(false);
    form.reset();
    onSuccess?.();
  });

  const amount = form.watch("amount");
  const adminFee = 5000;
  const platformFee = Math.floor(amount * 0.05);
  const netReceived = amount - adminFee - platformFee;

  const onSubmit = (values: CreateWithdrawalInput) => {
    if (values.amount > currentBalance) {
      form.setError("amount", { message: "Insufficient balance" });
      return;
    }

    const netReceivedOnSubmit = values.amount - 5000 - Math.floor(values.amount * 0.05);

    if (netReceivedOnSubmit <= 0) {
      form.setError("amount", { message: "Amount too low (must cover fees)" });
      return;
    }

    mutate({ ...values, creatorId });
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" />
            Withdraw Funds
          </DialogTitle>
          <DialogDescription>
            Submit a withdrawal request. Funds will be processed within 1-3 business days.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (Minimum Rp 50.000)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">Rp</span>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                        className="pl-9"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                  <FormMessage />

                  <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Requested Amount</span>
                      <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount || 0)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Admin Fee</span>
                      <span className="text-red-500">-{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(adminFee)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Platform Fee (5%)</span>
                      <span className="text-red-500">-{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(platformFee)}</span>
                    </div>
                    <div className="h-px bg-border my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Est. Received</span>
                      <span className={netReceived > 0 ? "text-green-600" : "text-destructive"}>
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(netReceived > 0 ? netReceived : 0)}
                      </span>
                    </div>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bankCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank / E-Wallet</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Bank" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INDONESIAN_BANKS.map((bank) => (
                        <SelectItem key={bank.code} value={bank.code}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="12345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Holder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="saveDetails"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Save details
                    </FormLabel>
                    <FormDescription>
                      Save these bank details for future withdrawals.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Request Withdrawal
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
