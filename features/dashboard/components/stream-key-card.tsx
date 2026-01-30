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

  const overlayUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/stream/overlay/${key}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(overlayUrl);
    setCopied(true);
    toast.success("Overlay URL copied to clipboard");
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


  return (
    <Card className="shadow-sm border-border bg-gradient-to-br from-card to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Stream connection
        </CardTitle>
        <CardDescription>
          Your unique overlay URL for OBS/Streamlabs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">Browser Source URL</Label>
          <div className="flex items-center gap-2 p-1 pl-3 bg-muted/50 border rounded-xl focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <div className="flex-1 min-w-0">
              <input
                type={showKey ? "text" : "password"}
                value={overlayUrl}
                readOnly
                className="w-full bg-transparent border-none focus:outline-none text-sm font-mono text-foreground h-9"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              className="h-9 rounded-lg mr-1 bg-background shadow-sm hover:bg-background/80"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
          <p className="text-[12px] text-muted-foreground">
            Add this as a <strong>Browser Source</strong> (1920x1080) in your streaming software.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 h-auto py-2"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-2" />
              Reset Stream Key
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
      </CardContent>
    </Card>
  );
}
