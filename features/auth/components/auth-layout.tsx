"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side - Form Container */}
      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-24 xl:px-32 bg-background relative">
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="mx-auto w-full max-w-sm">
          {children}
        </div>
      </div>

      {/* Right Side - Visual/Interactive */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[400px] h-[400px] bg-indigo-500/30 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 p-12 text-white max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="border border-white/10 bg-white/5 backdrop-blur-xl p-8 rounded-3xl shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500" />
              <div>
                <div className="h-2 w-24 bg-white/20 rounded mb-2" />
                <div className="h-2 w-16 bg-white/10 rounded" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-2 w-full bg-white/10 rounded" />
              <div className="h-2 w-full bg-white/10 rounded" />
              <div className="h-2 w-3/4 bg-white/10 rounded" />
            </div>
          </motion.div>
          <h2 className="mt-12 text-3xl font-bold tracking-tight leading-tight">
            &quot;Zavo has completely transformed how I monetize my content. It&apos;s simply fair.&quot;
          </h2>
          <p className="mt-4 text-white/60">
            — Alex Chen, Digital Artist
          </p>
        </div>
      </div>
    </div>
  );
}
