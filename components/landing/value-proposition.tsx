"use client";

import { motion } from "framer-motion";

export default function ValueProposition() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Full-width horizontal lines at top and bottom */}
      <div className="absolute top-0 left-0 right-0 h-px bg-border" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />

      {/* Dot Matrix Pattern - Top Left */}
      <div
        className="absolute top-0 left-0 w-72 h-72 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(circle, #FF5722 1.5px, transparent 1.5px)`,
          backgroundSize: '12px 12px',
          maskImage: 'radial-gradient(ellipse 100% 100% at 0% 0%, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at 0% 0%, black 30%, transparent 70%)',
        }}
      />

      {/* Dot Matrix Pattern - Bottom Right */}
      <div
        className="absolute bottom-0 right-0 w-72 h-72 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(circle, #FF5722 1.5px, transparent 1.5px)`,
          backgroundSize: '12px 12px',
          maskImage: 'radial-gradient(ellipse 100% 100% at 100% 100%, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at 100% 100%, black 30%, transparent 70%)',
        }}
      />

      <div className="container mx-auto max-w-4xl text-center relative z-10">
        {/* Section Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <span className="section-badge">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            02 — Zero Configuration
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-4xl font-bold tracking-tight md:text-6xl text-foreground mb-6"
          style={{ letterSpacing: '-0.02em' }}
        >
          We handle the{" "}
          <span className="text-primary">hard stuff</span>
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Payment processing, fraud protection, tax compliance, multi-currency support, and more — all handled for you.
        </motion.p>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          {[
            "Payment Gateway",
            "Fraud Detection",
            "Tax Reports",
            "Multi-Currency",
            "Instant Payouts",
            "24/7 Support",
          ].map((item) => (
            <span
              key={item}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-background hover:border-primary/30 transition-colors"
            >
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
