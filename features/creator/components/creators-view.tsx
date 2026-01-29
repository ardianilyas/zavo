"use client";

import { Plus, Loader2, Wallet, ExternalLink, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateProfileDialog } from "./create-profile-dialog";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCreatorProfiles } from "../hooks/use-creators";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function CreatorsView() {
  const { data: profiles, isLoading, refetch } = useCreatorProfiles();

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const canCreate = (profiles?.length || 0) < 2;

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2 border-b pb-8">
        <h1 className="text-4xl font-medium tracking-tight text-primary w-fit">
          Creator Profiles
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your personas. Each profile has its own wallet, stream key, and community.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {/* Existing Profiles */}
        {profiles?.map((profile) => (
          <motion.div key={profile.id} variants={item}>
            <Card className="group overflow-hidden border-muted-foreground/10 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 relative bg-gradient-to-br from-card to-background">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <CardHeader className="pb-4 relative z-10 flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
                  <AvatarImage src={profile.image || ""} />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {profile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-xl">{profile.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-primary font-medium">
                    @{profile.username}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 relative z-10">
                <div className="p-3 bg-background/50 backdrop-blur rounded-lg border border-border/50 flex justify-between items-center group-hover:border-primary/20 transition-colors">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Balance
                  </span>
                  <span className="font-bold text-green-500">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(profile.balance)}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="grid grid-cols-2 gap-3 relative z-10">
                <Button variant="outline" className="w-full hover:bg-primary/10 hover:text-primary transition-colors" asChild>
                  <Link href={`/dashboard?profileId=${profile.id}`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Manage
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full hover:bg-secondary transition-colors" asChild>
                  <Link href={`/u/${profile.username}`} target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}

        {/* Create New Profile Card */}
        {canCreate && (
          <motion.div variants={item} className="h-full">
            <CreateProfileDialog onSuccess={refetch}>
              <button className="h-full w-full min-h-[260px] flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-xl hover:border-primary hover:bg-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group cursor-pointer">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">Create New Profile</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-[200px] text-center px-2">
                  Launch a new persona with a fresh wallet and stream key.
                </p>
              </button>
            </CreateProfileDialog>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
