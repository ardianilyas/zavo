"use client";

import { SetStateAction, useState } from "react";
import { api as trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Copy, RefreshCw, Check } from "lucide-react";
import { toast } from "sonner";

interface StreamKeyCardProps {
  streamToken: string | null;
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function StreamKeyCard({ streamToken }: StreamKeyCardProps) {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [key, setKey] = useState(streamToken || "");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const regenerateMutation = trpc.user.regenerateStreamToken.useMutation({
    onSuccess: (data: { streamToken: SetStateAction<string>; }) => {
      setKey(data.streamToken);
      setIsDialogOpen(false);
      toast.success("Stream key regenerated!");
    },
    onError: (err: any) => {
      toast.error("Failed to regenerate key");
    }
  });

  const overlayUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/stream/overlay/${key}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(overlayUrl);
    setCopied(true);
    toast.success("Overlay URL copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateConfirm = () => {
    regenerateMutation.mutate();
  };

  return (
    <Card className="backdrop-blur-md bg-card/50 border-primary/10">
      <CardHeader>
        <CardTitle>Stream Overlay Setup</CardTitle>
        <CardDescription>
          Configure your OBS Browser Source. Keep this URL secret!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Overlay URL</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showKey ? "text" : "password"}
                value={overlayUrl}
                readOnly
                className="pr-10 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Copy this URL and add it as a <strong>Browser Source</strong> in OBS.
          </p>
        </div>

        <div className="pt-4 border-t border-border/50">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate Stream Key
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
      </CardContent>
    </Card>
  );
}
