"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center px-6 overflow-hidden">
      {/* Dot Matrix Pattern - Top Right */}
      <div
        className="absolute top-0 right-0 w-80 h-80 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(circle, #FF5722 1.5px, transparent 1.5px)`,
          backgroundSize: '12px 12px',
          maskImage: 'radial-gradient(ellipse 100% 100% at 100% 0%, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at 100% 0%, black 30%, transparent 70%)',
        }}
      />

      {/* Dot Matrix Pattern - Bottom Left */}
      <div
        className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle, #FF5722 1.5px, transparent 1.5px)`,
          backgroundSize: '12px 12px',
          maskImage: 'radial-gradient(ellipse 100% 100% at 0% 100%, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at 0% 100%, black 30%, transparent 70%)',
        }}
      />

      {/* Bottom Border Line */}
      <div className="border-line-h bottom-0" />
      <div className="absolute bottom-0 left-6 grid-marker -translate-y-1/2">+</div>
      <div className="absolute bottom-0 right-6 grid-marker -translate-y-1/2">+</div>

      <div className="container mx-auto max-w-4xl text-center relative z-10 mt-12">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex justify-center"
        >
          <Link href="/register">
            <span className="section-badge">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Welcome to Zavo Beta
              <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-foreground"
          style={{ letterSpacing: '-0.02em' }}
        >
          Support your favorite{" "}
          <span className="text-primary">Creators</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl"
          style={{ lineHeight: 1.6 }}
        >
          A powerful content monetization platform. Send donations to creators you love, seamlessly and instantly. It&apos;s also open source.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link href="/register">
            <Button
              size="lg"
              className="h-14 px-8 rounded-lg bg-primary hover:bg-primary/90 text-white text-base font-medium transition-all hover:scale-[1.02] hover:shadow-lg"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="#features">
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 rounded-lg border-primary/30 text-foreground hover:bg-primary/5 hover:border-primary/50 text-base font-medium"
            >
              Learn More
            </Button>
          </Link>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 pt-8 relative"
        >
          {/* Full width border line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-screen h-px bg-border" />

          <p className="text-sm text-muted-foreground mb-6">
            Trusted by <span className="text-foreground font-medium">1,000+</span> creators and growing
          </p>
          <div className="flex items-center justify-center gap-8 opacity-40">
            {["Creator", "Studio", "Artist", "Streamer", "Developer"].map((name, i) => (
              <span key={i} className="text-sm font-medium text-muted-foreground">
                @{name.toLowerCase()}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
