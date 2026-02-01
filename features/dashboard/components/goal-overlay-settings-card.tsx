"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useUpdateAlertSettings } from "../hooks/use-update-alert-settings";
import { Target, Play, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { SketchPicker } from "react-color";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

interface GoalOverlaySettingsCardProps {
  creatorId: string;
  initialSettings: any;
}

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
}

function ColorPicker({ label, color, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal px-3 space-x-2 h-10 hover:bg-muted/50"
          >
            <div
              className="w-4 h-4 rounded-full border shadow-sm shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-sm truncate">{color}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 bg-white dark:bg-zinc-950 border rounded-xl shadow-2xl">
          <SketchPicker
            color={color}
            onChange={(c) => onChange(c.hex)}
            disableAlpha={false}
            presetColors={['#4CAF50', '#ffffff', '#020617', '#F0F9FF', '#E2E8F0']}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function GoalOverlaySettingsCard({ creatorId, initialSettings }: GoalOverlaySettingsCardProps) {
  const defaults = {
    backgroundColor: "#FFFFFF",
    textColor: "#020617",
    progressBarColor: "#4CAF50",
    borderColor: "#E2E8F0",
    borderRadius: 32,
  };

  const saved = initialSettings?.goalOverlaySettings || {};

  const [backgroundColor, setBackgroundColor] = useState(saved.backgroundColor || defaults.backgroundColor);
  const [textColor, setTextColor] = useState(saved.textColor || defaults.textColor);
  const [progressBarColor, setProgressBarColor] = useState(saved.progressBarColor || defaults.progressBarColor);
  const [borderColor, setBorderColor] = useState(saved.borderColor || defaults.borderColor);
  const [borderRadius, setBorderRadius] = useState(saved.borderRadius ?? defaults.borderRadius);
  const [key, setKey] = useState(0);

  const updateSettings = useUpdateAlertSettings();

  const handleSave = () => {
    updateSettings.mutate({
      creatorId,
      goalOverlaySettings: {
        backgroundColor,
        textColor,
        progressBarColor,
        borderColor,
        borderRadius,
      }
    });
    toast.success("Goal overlay styles updated");
  };

  const triggerPreview = () => {
    setKey(prev => prev + 1);
  };

  const percentage = 65; // Demo percentage

  return (
    <Card className="shadow-sm border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Goal Bar Style</CardTitle>
        </div>
        <CardDescription>
          Customize the appearance of your donation goal widget.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Live Preview */}
        <div className="rounded-xl border bg-muted/50 p-6 flex flex-col items-center justify-center min-h-[220px] gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Settings2 className="h-4 w-4" />
            <span>Live Preview</span>
          </div>

          <div className="relative w-full max-w-md flex flex-col items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full p-5 border overflow-hidden shadow-lg"
                style={{
                  backgroundColor: backgroundColor,
                  borderColor: borderColor,
                  borderWidth: "1px",
                  borderRadius: `${borderRadius}px`,
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${progressBarColor}20` }}>
                      <Target className="w-4 h-4" style={{ color: progressBarColor }} />
                    </div>
                    <div>
                      <h2 className="font-bold text-sm leading-tight" style={{ color: textColor }}>New Microphone</h2>
                      <p className="text-[10px] font-medium uppercase tracking-widest opacity-60" style={{ color: textColor }}>Goal Progress</p>
                    </div>
                  </div>
                  <span className="font-black text-lg" style={{ color: progressBarColor }}>
                    {percentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-4 rounded-full overflow-hidden relative" style={{ backgroundColor: `${progressBarColor}20` }}>
                  <motion.div
                    className="absolute top-0 left-0 h-full"
                    style={{ backgroundColor: progressBarColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 15 }}
                  />
                </div>

                {/* Amounts */}
                <div className="flex justify-between font-mono font-bold text-xs mt-2 opacity-80" style={{ color: textColor }}>
                  <span>Rp 650.000</span>
                  <span className="opacity-60">Rp 1.000.000</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <Button variant="outline" size="sm" onClick={triggerPreview} className="mt-2">
            <Play className="h-3 w-3 mr-2" />
            Replay
          </Button>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Colors */}
          <div className="space-y-4">
            <ColorPicker
              label="Background Color"
              color={backgroundColor}
              onChange={setBackgroundColor}
            />

            <ColorPicker
              label="Text Color"
              color={textColor}
              onChange={setTextColor}
            />

            <ColorPicker
              label="Progress Bar Color"
              color={progressBarColor}
              onChange={setProgressBarColor}
            />

            <ColorPicker
              label="Border Color"
              color={borderColor}
              onChange={setBorderColor}
            />
          </div>

          {/* Slider */}
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Border Radius ({borderRadius}px)</Label>
              <Slider
                value={[borderRadius]}
                onValueChange={([val]) => setBorderRadius(val)}
                min={0}
                max={32}
                step={1}
                className="w-full"
              />
            </div>
          </div>

        </div>

        <div className="flex justify-end pt-4 border-t mt-4">
          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            Save Changes
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}
