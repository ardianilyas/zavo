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
  };
}

export function AlertSettingsCard({ creatorId, initialSettings }: AlertSettingsCardProps) {
  const [isTtsEnabled, setIsTtsEnabled] = useState(initialSettings.isTtsEnabled);
  const [ttsMinAmount, setTtsMinAmount] = useState(initialSettings.ttsMinAmount);
  // Separate state for draft amount to handle generic input behavior correctly
  const [amountDraft, setAmountDraft] = useState(initialSettings.ttsMinAmount.toString());

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
    setIsTtsEnabled(checked);
    updateSettings.mutate({
      creatorId,
      isTtsEnabled: checked,
    });
    toast.success(checked ? "Text-to-Speech enabled" : "Text-to-Speech disabled");
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
      </CardContent>
    </Card>
  );
}

// Importing toast here to avoid scope issues in case not auto-imported
import { toast } from "sonner";
