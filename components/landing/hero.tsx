"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const words = ["Streamers", "Creators", "Developers", "Communities"];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden pt-24 pb-12 md:pt-40 md:pb-32 px-6">
      <div className="container mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex justify-center"
        >
          <span className="inline-flex items-center rounded-full border border-border/50 bg-secondary/50 px-3 py-1 text-xs sm:text-sm font-medium text-secondary-foreground backdrop-blur-sm">
            Please welcome, Zavo Beta
            <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </span>
        </motion.div>

        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          Empower your
          <br className="block" />{" "}
          <span className="relative flex w-full justify-center overflow-hidden pb-2 sm:pb-4 md:pb-10 h-[1.2em]">
            <motion.span
              key={index}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.5, ease: "circOut" }}
              className="absolute bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400"
            >
              {words[index]}
            </motion.span>
            <span className="invisible">{words[0]}</span> {/* Spacer */}
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl px-4"
        >
          A powerful content monetization platform designed to help you build,
          grow, and sustain your creative business. Receive donations, manage
          memberships, and more.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row w-full sm:w-auto px-4"
        >
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="h-12 w-full sm:w-auto rounded-full px-8 text-base">
              Start for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="h-12 w-full sm:w-auto rounded-full px-8 text-base"
          >
            View Documentation
          </Button>
        </motion.div>
      </div>

      {/* Background Gradient */}
      <div className="absolute top-0 left-1/2 -z-10 h-[800px] w-[800px] sm:h-[1000px] sm:w-[1000px] -translate-x-1/2 -translate-y-1/2 opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-indigo-500/40 to-transparent blur-3xl rounded-full" />
      </div>
    </section>
  );
}
