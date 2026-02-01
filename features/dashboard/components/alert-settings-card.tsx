"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useUpdateAlertSettings } from "../hooks/use-update-alert-settings";
import { Megaphone, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlertSettingsCardProps {
  creatorId: string;
  initialSettings: {
    isTtsEnabled: boolean;
    ttsMinAmount: number;
    isMediaShareEnabled: boolean;
    mediaShareCostPerSecond: number;
    mediaShareMaxDuration: number;
  };
}

export function AlertSettingsCard({ creatorId, initialSettings }: AlertSettingsCardProps) {
  const [isTtsEnabled, setIsTtsEnabled] = useState(initialSettings.isTtsEnabled);
  const [ttsMinAmount, setTtsMinAmount] = useState(initialSettings.ttsMinAmount);
  // Separate state for draft amount to handle generic input behavior correctly
  const [amountDraft, setAmountDraft] = useState(initialSettings.ttsMinAmount.toString());

  // Media Share State
  const [isMediaShareEnabled, setIsMediaShareEnabled] = useState(initialSettings.isMediaShareEnabled);
  const [mediaShareCostPerSecond, setMediaShareCostPerSecond] = useState(initialSettings.mediaShareCostPerSecond);
  const [mediaShareMaxDuration, setMediaShareMaxDuration] = useState(initialSettings.mediaShareMaxDuration);

  const [costPerSecondDraft, setCostPerSecondDraft] = useState(initialSettings.mediaShareCostPerSecond.toString());
  const [maxDurationDraft, setMaxDurationDraft] = useState(initialSettings.mediaShareMaxDuration.toString());

  useEffect(() => {
    setIsTtsEnabled(initialSettings.isTtsEnabled);
    setTtsMinAmount(initialSettings.ttsMinAmount);
    setAmountDraft(initialSettings.ttsMinAmount.toString());

    setIsMediaShareEnabled(initialSettings.isMediaShareEnabled);
    setMediaShareCostPerSecond(initialSettings.mediaShareCostPerSecond);
    setMediaShareMaxDuration(initialSettings.mediaShareMaxDuration);
    setCostPerSecondDraft(initialSettings.mediaShareCostPerSecond.toString());
    setMaxDurationDraft(initialSettings.mediaShareMaxDuration.toString());
  }, [initialSettings, creatorId]);


  // Mutation
  const updateSettings = useUpdateAlertSettings({
    onError: () => {
      // Revert on error
      setIsTtsEnabled(initialSettings.isTtsEnabled);
      setTtsMinAmount(initialSettings.ttsMinAmount);
      setAmountDraft(initialSettings.ttsMinAmount.toString());
    },
  });

  // Save handler
  const handleSave = () => {
    updateSettings.mutate({
      creatorId,
      isTtsEnabled,
      ttsMinAmount,
      isMediaShareEnabled,
      mediaShareCostPerSecond,
      mediaShareMaxDuration,
    });
    toast.success("Settings updated successfully");
  };

  // Validators (update state on blur)
  const validateAmount = () => {
    const val = parseInt(amountDraft);
    if (isNaN(val) || val < 0) {
      toast.error("Please enter a valid amount");
      setAmountDraft(ttsMinAmount.toString());
      return;
    }
    setTtsMinAmount(val);
  };

  const validateMediaShareSettings = () => {
    const cost = parseInt(costPerSecondDraft);
    const duration = parseInt(maxDurationDraft);

    if (isNaN(cost) || cost < 1000) {
      toast.error("Min cost is Rp 1.000");
      setCostPerSecondDraft(mediaShareCostPerSecond.toString());
      return;
    }

    if (isNaN(duration) || duration > 180) {
      toast.error("Max duration is 180s");
      setMaxDurationDraft(mediaShareMaxDuration.toString());
      return;
    }

    setMediaShareCostPerSecond(cost);
    setMediaShareMaxDuration(duration);
  };

  const handleToggle = (checked: boolean) => {
    setIsTtsEnabled(checked);
  };

  const handleMediaShareToggle = (checked: boolean) => {
    setIsMediaShareEnabled(checked);
  };

  return (
    <Card className="shadow-sm border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-indigo-500" />
          <CardTitle className="text-lg">Alert Configuration</CardTitle>
        </div>
        <CardDescription>
          Customize how your donation alerts appear and sound.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* TTS Section */}
        <div className="rounded-xl border bg-muted/30 p-4 transition-all hover:border-indigo-200 dark:hover:border-indigo-900/50">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Volume2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex flex-col space-y-0.5">
                <Label htmlFor="tts-mode" className="text-base font-semibold">Text-to-Speech</Label>
                <span className="text-sm text-muted-foreground">
                  Read donor messages out loud
                </span>
              </div>
            </div>
            <Switch
              id="tts-mode"
              checked={isTtsEnabled}
              onCheckedChange={handleToggle}
              disabled={updateSettings.isPending}
            />
          </div>

          {isTtsEnabled && (
            <div className="mt-4 pl-[52px] animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="flex flex-col gap-2 max-w-sm">
                <Label htmlFor="min-amount" className="text-sm text-muted-foreground">
                  Min. Amount (IDR)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="min-amount"
                    type="number"
                    value={amountDraft}
                    onChange={(e) => setAmountDraft(e.target.value)}
                    onBlur={validateAmount}
                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                    className="h-9"
                    disabled={updateSettings.isPending}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Media Share Section */}
        <div className="rounded-xl border bg-muted/30 p-4 transition-all hover:border-pink-200 dark:hover:border-pink-900/50">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                <Youtube className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="flex flex-col space-y-0.5">
                <Label htmlFor="media-share-mode" className="text-base font-semibold">Media Share</Label>
                <span className="text-sm text-muted-foreground">
                  Let viewers request YouTube videos
                </span>
              </div>
            </div>
            <Switch
              id="media-share-mode"
              checked={isMediaShareEnabled}
              onCheckedChange={handleMediaShareToggle}
              disabled={updateSettings.isPending}
            />
          </div>

          {isMediaShareEnabled && (
            <div className="mt-6 border-t pt-4 animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="cost-per-second" className="text-sm font-medium">
                    Cost per Second (IDR)
                  </Label>
                  <Input
                    id="cost-per-second"
                    type="number"
                    min={1000}
                    value={costPerSecondDraft}
                    onChange={(e) => setCostPerSecondDraft(e.target.value)}
                    onBlur={validateMediaShareSettings}
                    disabled={updateSettings.isPending}
                  />
                  <p className="text-[10px] text-muted-foreground">Min. Rp 1.000</p>
                </div>

                <div className="flex flex-col space-y-2">
                  <Label htmlFor="max-duration" className="text-sm font-medium">
                    Max Duration (Seconds)
                  </Label>
                  <Input
                    id="max-duration"
                    type="number"
                    max={180}
                    value={maxDurationDraft}
                    onChange={(e) => setMaxDurationDraft(e.target.value)}
                    onBlur={validateMediaShareSettings}
                    disabled={updateSettings.isPending}
                  />
                  <p className="text-[10px] text-muted-foreground">Max. 180s</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            Save Changes
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}

// Importing toast here to avoid scope issues in case not auto-imported
import { toast } from "sonner";
import { Youtube } from "lucide-react";
