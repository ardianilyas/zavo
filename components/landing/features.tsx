"use client";

import { motion } from "framer-motion";
import { Heart, TrendingUp, Zap, DollarSign, Shield, Globe } from "lucide-react";

const features = [
  {
    title: "Send Donations",
    description: "Support your favorite creators with instant, secure donations. Simple checkout, multiple payment methods.",
    icon: Heart,
  },
  {
    title: "Low Platform Fee",
    description: "Transparent pricing at just 5% per transaction. No hidden fees, no surprises.",
    icon: DollarSign,
  },
  {
    title: "Instant Payouts",
    description: "Get your money when you need it. Withdraw to your bank account instantly, 24/7.",
    icon: Zap,
  },
  {
    title: "Secure & Trusted",
    description: "Bank-level security with encrypted payments. Your donations are always protected.",
    icon: Shield,
  },
  {
    title: "IDR Support",
    description: "Accept donations in Indonesian Rupiah with seamless local payment methods.",
    icon: Globe,
  },
  {
    title: "Analytics",
    description: "Track your donations, see where your supporters come from, and grow your community.",
    icon: TrendingUp,
  },
];

export default function Features() {
  return (
    <section className="relative py-24" id="features">
      {/* Full-width horizontal lines at top and bottom */}
      <div className="absolute top-0 left-0 right-0 h-px bg-border" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />

      {/* Dot Matrix Pattern - Top Right */}
      <div
        className="absolute top-0 right-0 w-64 h-64 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle, #FF5722 1.5px, transparent 1.5px)`,
          backgroundSize: '12px 12px',
          maskImage: 'radial-gradient(ellipse 100% 100% at 100% 0%, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at 100% 0%, black 30%, transparent 70%)',
        }}
      />

      {/* Section Header - inside padded container */}
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="section-badge mb-4">
            01 — Creator First
          </span>
          <h2
            className="text-3xl font-bold tracking-tight md:text-5xl text-foreground mt-6"
            style={{ letterSpacing: '-0.01em' }}
          >
            Everything you <span className="text-primary">need</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            To support creators and build meaningful connections.
          </p>
        </motion.div>
      </div>

      {/* Feature Grid - uses same container as page vertical lines */}
      <div className="container mx-auto">
        <div className="relative border-l border-r border-t border-border">
          {/* Inner Vertical Lines */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 bottom-0 left-1/3 w-px bg-border hidden lg:block" />
            <div className="absolute top-0 bottom-0 left-2/3 w-px bg-border hidden lg:block" />
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-border md:block lg:hidden hidden" />
          </div>

          {/* Horizontal divider between rows */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-border hidden lg:block" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-6 bg-background transition-all duration-200 hover:bg-orange-100/30 dark:hover:bg-orange-900/30 border-b border-border"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* SDK Pills */}
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-wrap items-center justify-center gap-3"
        >
          <span className="text-sm text-muted-foreground mr-2">Integrations:</span>
          {["Discord", "Streamlabs", "OBS", "Twitch", "YouTube"].map((platform) => (
            <span
              key={platform}
              className="px-4 py-2 text-sm font-medium rounded-full bg-muted border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-default"
            >
              {platform}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
