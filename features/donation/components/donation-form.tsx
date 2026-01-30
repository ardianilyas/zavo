"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
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
  mediaSettings: {
    isEnabled: boolean;
    costPerSecond: number;
    maxDuration: number;
  };
}

export function DonationForm({ recipientUsername, recipientName, mediaSettings }: DonationFormProps) {
  const [step, setStep] = useState<"form" | "payment">("form");
  const [paymentData, setPaymentData] = useState<{
    donationId: string;
    paymentUrl: string;
    isDev: boolean;
  } | null>(null);

  const { data: session } = authClient.useSession();

  const form = useForm<DonationInput>({
    resolver: zodResolver(donationSchema) as any,
    defaultValues: {
      amount: 10000,
      donorName: "",
      message: "",
      donorEmail: "",
      mediaUrl: "",
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
    let finalValues = { ...values };

    // Calculate final duration if media URL is present
    if (mediaSettings.isEnabled && values.mediaUrl) {
      const calculatedDuration = Math.min(
        Math.floor(values.amount / mediaSettings.costPerSecond),
        mediaSettings.maxDuration
      );
      finalValues.mediaDuration = calculatedDuration;
    }

    createDonation({
      recipientUsername,
      ...finalValues,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Support Amount</FormLabel>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[10000, 20000, 50000, 100000].map((amt) => (
                  <Button
                    key={amt}
                    type="button"
                    variant={field.value === amt ? "default" : "outline"}
                    className={cn(
                      "h-12 text-base font-medium transition-all duration-200",
                      field.value === amt
                        ? "bg-primary text-primary-foreground shadow-md scale-105"
                        : "hover:bg-primary/5 hover:border-primary/50 text-muted-foreground"
                    )}
                    onClick={() => field.onChange(amt)}
                  >
                    {amt / 1000}k
                  </Button>
                ))}
              </div>
              <FormControl>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold group-focus-within:text-primary transition-colors">
                    Rp
                  </div>
                  <Input
                    type="number"
                    {...field}
                    className="h-14 pl-12 text-xl font-bold bg-background/50 border-muted focus:border-primary transition-all rounded-xl"
                    placeholder="0"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="donorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Your Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    {...field}
                    className="h-12 bg-background/50 border-muted rounded-xl focus:ring-1 focus:ring-primary/20 transition-all"
                  />
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
                <FormLabel className="font-medium text-muted-foreground uppercase text-[10px] tracking-wider">Support Message (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Keep up the great work! ✨"
                    className="resize-none h-28 bg-background/50 border-muted rounded-xl focus:ring-1 focus:ring-primary/20 transition-all p-4"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {mediaSettings.isEnabled && (
          <FormField
            control={form.control}
            name="mediaUrl"
            render={({ field }) => {
              const amount = form.watch("amount") || 0;
              const duration = Math.min(
                Math.floor(amount / mediaSettings.costPerSecond),
                mediaSettings.maxDuration
              );

              // Only set duration if URL is present (handled in onSubmit typically, but we can set form value here if needed)
              // Better to calculate on submit or just display here.

              return (
                <FormItem className="animate-in slide-in-from-top-2 fade-in duration-500">
                  <FormLabel className="font-medium text-muted-foreground uppercase text-[10px] tracking-wider flex items-center gap-2">
                    <Youtube className="w-3 h-3 text-red-500" />
                    Media Share (Optional)
                  </FormLabel>
                  <div className="bg-muted/30 p-3 rounded-xl border border-dashed border-red-200 dark:border-red-900/30 space-y-3">
                    <FormControl>
                      <Input
                        placeholder="Paste YouTube Link (e.g. youtu.be/...)"
                        {...field}
                        className="h-10 text-sm bg-background border-muted rounded-lg focus:ring-1 focus:ring-red-500/20 transition-all"
                      />
                    </FormControl>

                    {field.value && (
                      <div className="flex items-center justify-between text-xs px-1">
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Est. Duration</span>
                          <span className="font-bold text-foreground">{duration} seconds</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-muted-foreground">Cost</span>
                          <span className="font-bold text-foreground">Rp {mediaSettings.costPerSecond}/sec</span>
                        </div>
                      </div>
                    )}
                    {field.value && duration <= 0 && (
                      <p className="text-xs text-red-500 font-medium">Increase amount to play video (Min Rp {mediaSettings.costPerSecond})</p>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        )}

        <Button
          type="submit"
          className="w-full h-14 text-lg font-bold rounded-xl shadow-[0_4px_14px_0_rgba(76,175,80,0.39)] hover:shadow-[0_6px_20px_rgba(76,175,80,0.23)] hover:bg-[#43a047] transition-all transform hover:-translate-y-0.5"
          disabled={isCreating}
        >
          {isCreating ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <span className="flex items-center">
              Send Support
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-sm font-medium">
                Rp {form.watch("amount")?.toLocaleString() || "0"}
              </span>
            </span>
          )}
        </Button>

        <p className="text-center text-[10px] text-muted-foreground">
          By donating, you agree to the Terms of Service. All tips are final and non-refundable.
        </p>
      </form>
    </Form>
  );
}
