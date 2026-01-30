"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useState } from "react";
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


  // Mutation
  const updateSettings = useUpdateAlertSettings({
    onError: () => {
      // Revert on error
      setIsTtsEnabled(initialSettings.isTtsEnabled);
      setTtsMinAmount(initialSettings.ttsMinAmount);
      setAmountDraft(initialSettings.ttsMinAmount.toString());
    },
  });

  // Debounce for amount update (or save on blur)
  const saveAmount = () => {
    const val = parseInt(amountDraft);
    if (isNaN(val) || val < 0) {
      toast.error("Please enter a valid amount");
      setAmountDraft(ttsMinAmount.toString());
      return;
    }

    if (val === ttsMinAmount) return; // No change

    setTtsMinAmount(val);
    updateSettings.mutate({
      creatorId,
      ttsMinAmount: val,
    });
    toast.success("Minimum amount updated");
  };

  const handleToggle = (checked: boolean) => {
    updateSettings.mutate({
      creatorId,
      isTtsEnabled: checked,
    });
    toast.success(checked ? "Text-to-Speech enabled" : "Text-to-Speech disabled");
  };

  const handleMediaShareToggle = (checked: boolean) => {
    setIsMediaShareEnabled(checked);
    updateSettings.mutate({
      creatorId,
      isMediaShareEnabled: checked,
    });
    toast.success(checked ? "Media Share enabled" : "Media Share disabled");
  };

  const saveMediaShareSettings = () => {
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

    if (cost === mediaShareCostPerSecond && duration === mediaShareMaxDuration) return;

    setMediaShareCostPerSecond(cost);
    setMediaShareMaxDuration(duration);

    updateSettings.mutate({
      creatorId,
      mediaShareCostPerSecond: cost,
      mediaShareMaxDuration: duration,
    });
    toast.success("Media Share settings updated");
  };

  return (
    <Card className="shadow-none border-border/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-indigo-500" />
          <CardTitle className="text-lg">Alert Settings</CardTitle>
        </div>
        <CardDescription>
          Configure how donation alerts behave on your stream.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable TTS Switch */}
        <div className="flex items-center justify-between space-x-2">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="tts-mode" className="font-medium">Text-to-Speech (TTS)</Label>
            <span className="text-sm text-muted-foreground">
              Read out the donor's message automatically.
            </span>
          </div>
          <Switch
            id="tts-mode"
            checked={isTtsEnabled}
            onCheckedChange={handleToggle}
            disabled={updateSettings.isPending}
          />
        </div>

        {/* Min Amount Input - Only show if TTS is enabled */}
        {isTtsEnabled && (
          <div className="flex flex-col space-y-2 pt-2 animate-in slide-in-from-top-2 fade-in duration-300">
            <Label htmlFor="min-amount" className="text-sm font-medium">
              Minimum Amount for TTS (IDR)
            </Label>
            <div className="flex gap-2">
              <Input
                id="min-amount"
                type="number"
                value={amountDraft}
                onChange={(e) => setAmountDraft(e.target.value)}
                onBlur={saveAmount}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                className="max-w-[180px]"
                disabled={updateSettings.isPending}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={saveAmount}
                disabled={parseInt(amountDraft) === ttsMinAmount || updateSettings.isPending}
              >
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Donations below this amount will still appear but won't be read out loud.
            </p>
          </div>
        )}

        <div className="h-px bg-border" />

        {/* Media Share Switch */}
        <div className="flex items-center justify-between space-x-2">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="media-share-mode" className="font-medium">Media Share</Label>
            <span className="text-sm text-muted-foreground">
              Allow viewers to play YouTube videos on stream.
            </span>
          </div>
          <Switch
            id="media-share-mode"
            checked={isMediaShareEnabled}
            onCheckedChange={handleMediaShareToggle}
            disabled={updateSettings.isPending}
          />
        </div>

        {/* Media Share Settings */}
        {isMediaShareEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 animate-in slide-in-from-top-2 fade-in duration-300">
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
                onBlur={saveMediaShareSettings}
                className="max-w-[180px]"
                disabled={updateSettings.isPending}
              />
              <p className="text-xs text-muted-foreground">Min. Rp 1.000</p>
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
                onBlur={saveMediaShareSettings}
                className="max-w-[180px]"
                disabled={updateSettings.isPending}
              />
              <p className="text-xs text-muted-foreground">Max. 180 seconds</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Importing toast here to avoid scope issues in case not auto-imported
import { toast } from "sonner";
import { Youtube } from "lucide-react";
