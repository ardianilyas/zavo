"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const pricingTiers = [
  {
    name: "Free",
    description: "For creators just getting started",
    price: "Rp0",
    period: "/month",
    fee: "5% platform fee",
    features: [
      "Unlimited donations",
      "Basic analytics",
      "Email support",
      "Payment link",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Starter",
    description: "For growing creators",
    price: "Rp99K",
    period: "/month",
    fee: "3% platform fee",
    features: [
      "Everything in Free",
      "Custom donation page",
      "Advanced analytics",
      "Priority support",
      "Discord webhook",
    ],
    cta: "Subscribe",
    popular: false,
  },
  {
    name: "Pro",
    description: "For professional creators",
    price: "Rp299K",
    period: "/month",
    fee: "2% platform fee",
    features: [
      "Everything in Starter",
      "Custom branding",
      "API access",
      "Multiple payout accounts",
      "Goal tracking",
      "Overlay widgets",
    ],
    cta: "Subscribe",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For teams and agencies",
    price: "Custom",
    period: "",
    fee: "Volume discounts",
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "SSO / SAML",
      "Invoice billing",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section className="relative py-24 px-6" id="pricing">
      {/* Border Lines */}
      <div className="border-line-h bottom-0" />
      <div className="absolute bottom-0 left-6 grid-marker -translate-y-1/2">+</div>
      <div className="absolute bottom-0 right-6 grid-marker -translate-y-1/2">+</div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="section-badge mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            03 — Pricing
          </span>
          <h2
            className="text-3xl font-bold tracking-tight md:text-5xl text-foreground mt-6"
            style={{ letterSpacing: '-0.01em' }}
          >
            Simple, <span className="text-primary">transparent</span> pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </motion.div>

        {/* Pricing Grid - Border Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-l border-border">
          {pricingTiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className={cn(
                "relative p-6 border-r border-b border-border bg-background",
                "transition-all duration-200 hover:-translate-y-1",
                tier.popular && "bg-primary/[0.02]"
              )}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-px left-0 right-0 h-1 bg-primary rounded-t" />
              )}

              {tier.popular && (
                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary text-white mb-4">
                  Most Popular
                </span>
              )}

              {/* Tier Name */}
              <h3 className="text-xl font-bold text-foreground mb-1">
                {tier.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {tier.description}
              </p>

              {/* Price */}
              <div className="mb-2">
                <span className="text-4xl font-bold text-foreground">
                  {tier.price}
                </span>
                <span className="text-muted-foreground">
                  {tier.period}
                </span>
              </div>
              <p className="text-sm text-primary font-medium mb-6">
                {tier.fee}
              </p>

              {/* CTA */}
              <Button
                className={cn(
                  "w-full h-12 rounded-lg font-medium mb-6",
                  tier.popular
                    ? "bg-primary hover:bg-primary/90 text-white"
                    : "bg-muted hover:bg-muted/80 text-foreground border border-border"
                )}
              >
                {tier.cta}
              </Button>

              {/* Features */}
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
