"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useUpdateAlertSettings } from "../hooks/use-update-alert-settings";
import { Palette, Play, Type, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { SketchPicker } from "react-color";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface OverlaySettingsCardProps {
  creatorId: string;
  initialSettings: any; // loosely typed for json column
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
            presetColors={['#fae8ff', '#701a75', '#f5d0fe', '#18181b', '#ffffff']}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function OverlaySettingsCard({ creatorId, initialSettings }: OverlaySettingsCardProps) {
  const defaults = {
    backgroundColor: "#fae8ff", // default from One Trakteer (purple-ish)
    textColor: "#701a75",
    borderColor: "#f5d0fe",
    animationType: "fade",
  };

  const saved = initialSettings?.overlaySettings || {};

  const [backgroundColor, setBackgroundColor] = useState(saved.backgroundColor || defaults.backgroundColor);
  const [textColor, setTextColor] = useState(saved.textColor || defaults.textColor);
  const [borderColor, setBorderColor] = useState(saved.borderColor || defaults.borderColor);
  const [animationType, setAnimationType] = useState(saved.animationType || defaults.animationType);
  const [key, setKey] = useState(0); // to force replay animation

  const updateSettings = useUpdateAlertSettings();

  const handleSave = () => {
    updateSettings.mutate({
      creatorId,
      overlaySettings: {
        backgroundColor,
        textColor,
        borderColor,
        animationType,
      }
    });
    toast.success("Overlay styles updated");
  };

  // Debounced auto-save or simple save button? 
  // User asked for preview, so auto-save might spam. 
  // Let's use a "Save Changes" button or save on blur. 
  // Given color pickers can trigger many events, specific Save button is safer, 
  // OR save on blur of the entire section/specific controls.
  // Let's do simple onBlur for text/hex inputs, and onChangeEnd for color pickers?
  // Native color input `onChange` fires rapidly. `onBlur` is better.

  const triggerPreview = () => {
    setKey(prev => prev + 1);
  };

  return (
    <Card className="shadow-sm border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-pink-500" />
          <CardTitle className="text-lg">Overlay Style</CardTitle>
        </div>
        <CardDescription>
          Customize the colors and animation of your donation alerts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Live Preview */}
        <div className="rounded-xl border bg-muted/50 p-6 flex flex-col items-center justify-center min-h-[300px] gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Settings2 className="h-4 w-4" />
            <span>Live Preview</span>
          </div>

          <div className="relative w-full max-w-sm flex flex-col items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={key}
                initial={
                  animationType === "slide" ? { x: -50, opacity: 0 } :
                    animationType === "bounce" ? { scale: 0.8, opacity: 0 } :
                      { opacity: 0 } // fade
                }
                animate={
                  animationType === "slide" ? { x: 0, opacity: 1 } :
                    animationType === "bounce" ? { scale: 1, opacity: 1 } :
                      { opacity: 1 }
                }
                exit={{ opacity: 0 }}
                className="w-full p-6 rounded-2xl shadow-xl text-center border overflow-hidden"
                style={{
                  backgroundColor: backgroundColor,
                  borderColor: borderColor,
                  borderWidth: "1px",
                }}
              >
                <div className="font-bold text-lg mb-1" style={{ color: textColor }}>
                  Alice donated Rp 50.000
                </div>
                <div className="text-sm font-medium opacity-90" style={{ color: textColor }}>
                  Keep up the great work! this is a test message.
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <Button variant="outline" size="sm" onClick={triggerPreview} className="mt-4">
            <Play className="h-3 w-3 mr-2" />
            Replay Animation
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
              label="Border Color"
              color={borderColor}
              onChange={setBorderColor}
            />
          </div>

          {/* Animation & Others */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Animation Style</Label>
              <Select
                value={animationType}
                onValueChange={(val) => {
                  const typedVal = val as "fade" | "slide" | "bounce";
                  setAnimationType(typedVal);
                  triggerPreview();
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fade">Fade In</SelectItem>
                  <SelectItem value="slide">Slide Up</SelectItem>
                  <SelectItem value="bounce">Bounce/Pop</SelectItem>
                </SelectContent>
              </Select>
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
