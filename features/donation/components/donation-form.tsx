"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import { donationSchema, DonationInput } from "../schema/donation.schema";
import { useDonate, useSimulatePayment } from "../hooks/use-donate";

interface DonationFormProps {
  recipientUsername: string;
  recipientName: string;
}

export function DonationForm({ recipientUsername, recipientName }: DonationFormProps) {
  const [step, setStep] = useState<"form" | "payment">("form");
  const [paymentData, setPaymentData] = useState<{
    donationId: string;
    paymentUrl: string;
    isDev: boolean;
  } | null>(null);

  const { data: session } = authClient.useSession();

  const form = useForm<DonationInput>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      amount: 10000,
      donorName: "",
      message: "",
      donorEmail: ""
    },
  });

  // Auto-fill donor name
  useEffect(() => {
    if (session?.user?.name && !form.getValues("donorName")) {
      form.setValue("donorName", session.user.name);
    }
  }, [session, form]);

  const { mutate: createDonation, isPending: isCreating } = useDonate((data) => {
    setPaymentData({
      donationId: data.donationId,
      paymentUrl: data.paymentUrl,
      isDev: data.isDev
    });
    setStep("payment");
  });

  const { mutate: simulatePayment, isPending: isSimulating } = useSimulatePayment(() => {
    setStep("form");
    form.reset();
  });

  function onSubmit(values: DonationInput) {
    createDonation({
      recipientUsername,
      ...values,
    });
  }

  if (step === "payment" && paymentData) {
    return (
      <div className="flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-lg">Scan QRIS to Pay</h3>
          <p className="text-sm text-muted-foreground">Amount: Rp {form.getValues("amount").toLocaleString()}</p>
        </div>

        <div className="border p-4 rounded-lg bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={paymentData.paymentUrl}
            alt="QRIS Code"
            className="w-64 h-64 object-contain"
          />
        </div>

        {paymentData.isDev && (
          <Button
            variant="outline"
            className="w-full border-dashed border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
            onClick={() => {
              simulatePayment({ donationId: paymentData.donationId });
            }}
            disabled={isSimulating}
          >
            {isSimulating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            DEV MODE: Simulate Success
          </Button>
        )}

        <Button variant="ghost" size="sm" onClick={() => setStep("form")}>
          Cancel / Back
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (IDR)</FormLabel>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {[10000, 20000, 50000, 100000].map((amt) => (
                  <Button
                    key={amt}
                    type="button"
                    variant={field.value === amt ? "default" : "outline"}
                    size="sm"
                    onClick={() => field.onChange(amt)}
                  >
                    {amt / 1000}k
                  </Button>
                ))}
              </div>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">Rp</span>
                  <Input type="number" {...field} className="pl-9" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="donorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Great content!" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isCreating}>
          {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Donate Rp {form.watch("amount")?.toLocaleString() || "0"}
        </Button>
      </form>
    </Form>
  );
}
