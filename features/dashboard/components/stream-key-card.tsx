"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Copy, RefreshCw, Check } from "lucide-react";
import { toast } from "sonner";
import { useRegenerateStreamToken } from "../hooks/use-regenerate-stream-token";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface StreamKeyCardProps {
  streamToken: string | null;
}

export function StreamKeyCard({ streamToken }: StreamKeyCardProps) {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [key, setKey] = useState(streamToken || "");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setKey(streamToken || "");
  }, [streamToken]);

  const regenerateMutation = useRegenerateStreamToken();

  const baseUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/stream/overlay/${key}`;
  const alertUrl = `${baseUrl}/alert`;

  const handleCopy = () => {
    navigator.clipboard.writeText(alertUrl);
    setCopied(true);
    toast.success("Alert URL copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateConfirm = () => {
    regenerateMutation.mutate(undefined, {
      onSuccess: (data) => {
        setKey(data.streamToken);
        setIsDialogOpen(false);
      }
    });
  };

  const leaderboardUrl = `${baseUrl}/leaderboard`;
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardCopied, setLeaderboardCopied] = useState(false);

  const handleCopyLeaderboard = () => {
    navigator.clipboard.writeText(leaderboardUrl);
    setLeaderboardCopied(true);
    toast.success("Leaderboard URL copied to clipboard");
    setTimeout(() => setLeaderboardCopied(false), 2000);
  };

  const goalUrl = `${baseUrl}/goal`;
  const [showGoal, setShowGoal] = useState(false);
  const [goalCopied, setGoalCopied] = useState(false);

  const handleCopyGoal = () => {
    navigator.clipboard.writeText(goalUrl);
    setGoalCopied(true);
    toast.success("Goal URL copied to clipboard");
    setTimeout(() => setGoalCopied(false), 2000);
  };

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
              Stream Connection
            </CardTitle>
            <CardDescription className="mt-1.5">
              Your unique overlay URLs for OBS/Streamlabs
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-2" />
                Reset Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Regenerate Stream Key?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. Your old overlay URL will stop working immediately, and you will need to update OBS with the new one.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRegenerateConfirm}
                  disabled={regenerateMutation.isPending}
                >
                  {regenerateMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Yes, Regenerate
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Main Alert Overlay */}
        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-foreground">Alert Overlay URL</Label>
          <div className="group flex items-center gap-2 p-1 pl-4 bg-muted/40 border border-border rounded-lg hover:bg-muted/60 focus-within:ring-2 focus-within:ring-ring focus-within:bg-background transition-all">
            <div className="flex-1 min-w-0">
              <input
                type={showKey ? "text" : "password"}
                value={alertUrl}
                readOnly
                className="w-full bg-transparent border-none focus:outline-none text-sm font-mono text-foreground/90 h-9"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-background/80"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-9 rounded-md hover:bg-background/80"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground pl-0.5">
            For Alerts, TTS, and Media Share. Add as a Browser Source (1920x1080)
          </p>
        </div>

        {/* Goal Overlay */}
        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-foreground">Goal Bar URL</Label>
          <div className="group flex items-center gap-2 p-1 pl-4 bg-muted/40 border border-border rounded-lg hover:bg-muted/60 focus-within:ring-2 focus-within:ring-ring focus-within:bg-background transition-all">
            <div className="flex-1 min-w-0">
              <input
                type={showGoal ? "text" : "password"}
                value={goalUrl}
                readOnly
                className="w-full bg-transparent border-none focus:outline-none text-sm font-mono text-foreground/90 h-9"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowGoal(!showGoal)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-background/80"
            >
              {showGoal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyGoal}
              className="h-9 rounded-md hover:bg-background/80"
            >
              {goalCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground pl-0.5">
            Displays Donation Goal Progress. Add as a separate Browser Source
          </p>
        </div>

        {/* Leaderboard Overlay */}
        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-foreground">Leaderboard URL</Label>
          <div className="group flex items-center gap-2 p-1 pl-4 bg-muted/40 border border-border rounded-lg hover:bg-muted/60 focus-within:ring-2 focus-within:ring-ring focus-within:bg-background transition-all">
            <div className="flex-1 min-w-0">
              <input
                type={showLeaderboard ? "text" : "password"}
                value={leaderboardUrl}
                readOnly
                className="w-full bg-transparent border-none focus:outline-none text-sm font-mono text-foreground/90 h-9"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-background/80"
            >
              {showLeaderboard ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLeaderboard}
              className="h-9 rounded-md hover:bg-background/80"
            >
              {leaderboardCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground pl-0.5">
            Displays Top 10 Donors (Month). Add as a separate Browser Source
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

