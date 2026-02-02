"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useUpdateAlertSettings } from "../hooks/use-update-alert-settings";
import { Crown, Play, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { SketchPicker } from "react-color";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

interface LeaderboardOverlaySettingsCardProps {
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
            presetColors={['#FFFFFF', '#020617', '#4CAF50', '#E2E8F0', '#fef08a', '#e2e8f0', '#fed7aa']}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function LeaderboardOverlaySettingsCard({ creatorId, initialSettings }: LeaderboardOverlaySettingsCardProps) {
  const defaults = {
    backgroundColor: "#FFFFFF",
    textColor: "#020617",
    borderColor: "#E2E8F0",
    headerColor: "#F8FAFC",
    goldColor: "#fef08a",
    silverColor: "#e2e8f0",
    bronzeColor: "#fed7aa",
    borderRadius: 32,
    title: "Leaderboard",
  };

  const saved = initialSettings?.leaderboardOverlaySettings || {};

  const [backgroundColor, setBackgroundColor] = useState(saved.backgroundColor || defaults.backgroundColor);
  const [textColor, setTextColor] = useState(saved.textColor || defaults.textColor);
  const [borderColor, setBorderColor] = useState(saved.borderColor || defaults.borderColor);
  const [headerColor, setHeaderColor] = useState(saved.headerColor || defaults.headerColor);
  const [goldColor, setGoldColor] = useState(saved.goldColor || defaults.goldColor);
  const [silverColor, setSilverColor] = useState(saved.silverColor || defaults.silverColor);
  const [bronzeColor, setBronzeColor] = useState(saved.bronzeColor || defaults.bronzeColor);
  const [borderRadius, setBorderRadius] = useState(saved.borderRadius ?? defaults.borderRadius);
  const [title, setTitle] = useState(saved.title || defaults.title);
  const [key, setKey] = useState(0);

  const updateSettings = useUpdateAlertSettings();

  const handleSave = () => {
    updateSettings.mutate({
      creatorId,
      leaderboardOverlaySettings: {
        backgroundColor,
        textColor,
        borderColor,
        headerColor,
        goldColor,
        silverColor,
        bronzeColor,
        borderRadius,
        title,
      }
    });
    toast.success("Leaderboard overlay styles updated");
  };

  const triggerPreview = () => {
    setKey(prev => prev + 1);
  };

  const mockLeaderboard = [
    { rank: 1, name: "Alice", amount: 500000 },
    { rank: 2, name: "Bob", amount: 350000 },
    { rank: 3, name: "Charlie", amount: 200000 },
  ];

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
            <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-xl">Leaderboard Style</CardTitle>
            <CardDescription className="mt-0.5">
              Customize the appearance of your leaderboard widget
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Live Preview */}
        <div className="rounded-lg border bg-gradient-to-br from-muted/30 via-muted/10 to-transparent p-6 backdrop-blur-sm flex flex-col items-center justify-center min-h-[280px] gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Settings2 className="h-4 w-4" />
            <span>Live Preview</span>
          </div>

          <div className="relative w-full max-w-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full border overflow-hidden shadow-lg"
                style={{
                  backgroundColor: backgroundColor,
                  borderColor: borderColor,
                  borderWidth: "1px",
                  borderRadius: `${borderRadius}px`,
                }}
              >
                {/* Header */}
                <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: `${borderColor}40`, backgroundColor: headerColor }}>
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4" style={{ color: textColor, opacity: 0.7 }} />
                    <h2 className="font-bold text-sm" style={{ color: textColor }}>{title}</h2>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" style={{ color: textColor, opacity: 0.5 }} />
                </div>

                {/* Leaderboard Items */}
                <div className="p-3 space-y-2">
                  {mockLeaderboard.map((item, index) => {
                    let rankBg = goldColor;
                    if (index === 1) rankBg = silverColor;
                    if (index === 2) rankBg = bronzeColor;

                    return (
                      <div
                        key={item.rank}
                        className="flex items-center justify-between p-2.5 rounded-xl border"
                        style={{
                          backgroundColor: rankBg,
                          borderColor: `${borderColor}80`,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.3)', color: textColor }}>
                            {item.rank}
                          </div>
                          <span className="font-bold text-xs" style={{ color: textColor }}>{item.name}</span>
                        </div>
                        <span className="font-mono font-bold text-[10px]" style={{ color: textColor, opacity: 0.8 }}>
                          Rp {item.amount.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
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

          {/* Colors Column 1 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Widget Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Leaderboard"
                maxLength={30}
              />
            </div>
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
              label="Border Color"
              color={borderColor}
              onChange={setBorderColor}
            />

            <ColorPicker
              label="Header Color"
              color={headerColor}
              onChange={setHeaderColor}
            />
          </div>

          {/* Colors Column 2 + Slider */}
          <div className="space-y-4">
            <ColorPicker
              label="Gold (1st Place)"
              color={goldColor}
              onChange={setGoldColor}
            />

            <ColorPicker
              label="Silver (2nd Place)"
              color={silverColor}
              onChange={setSilverColor}
            />

            <ColorPicker
              label="Bronze (3rd Place)"
              color={bronzeColor}
              onChange={setBronzeColor}
            />

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

        <div className="flex justify-end pt-3 border-t">
          <Button onClick={handleSave} disabled={updateSettings.isPending} className="min-w-32">
            {updateSettings.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}
