
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { api } from "@/trpc/client";
import { toast } from "sonner";
import { Target, Flag, CircleDollarSign } from "lucide-react";
import Pusher from "pusher-js";

interface GoalSettingsCardProps {
  creatorId: string;
}

export function GoalSettingsCard({ creatorId }: GoalSettingsCardProps) {
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");

  const utils = api.useUtils();
  const { data: activeGoal, isLoading } = api.goal.getActive.useQuery({ creatorId });

  const createGoal = api.goal.create.useMutation({
    onSuccess: () => {
      toast.success("Goal started!");
      utils.goal.getActive.invalidate();
      setTitle("");
      setTargetAmount("");
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const stopGoal = api.goal.stop.useMutation({
    onSuccess: () => {
      toast.success("Goal ended.");
      utils.goal.getActive.invalidate();
    }
  });

  const handleCreate = () => {
    const amount = parseInt(targetAmount.replace(/\D/g, ""));
    if (!title || !amount) {
      toast.error("Please fill in all fields");
      return;
    }
    createGoal.mutate({ creatorId, title, targetAmount: amount });
  };

  const handleStop = (reason: "COMPLETED" | "CANCELLED") => {
    stopGoal.mutate({ creatorId, reason });
  };

  const percentage = activeGoal
    ? Math.min(100, (activeGoal.currentAmount / activeGoal.targetAmount) * 100)
    : 0;

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-xl transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Target className="w-5 h-5" />
          </div>
          <CardTitle className="text-lg">Donation Goal</CardTitle>
        </div>
        <CardDescription>
          Set a financial target for your stream.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {activeGoal ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{activeGoal.title}</span>
              <span className="text-muted-foreground">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(activeGoal.currentAmount)}
                {" / "}
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(activeGoal.targetAmount)}
              </span>
            </div>

            <Progress value={percentage} className="h-3" />

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-primary/20 hover:bg-primary/5 hover:text-primary"
                onClick={() => handleStop("COMPLETED")}
                disabled={stopGoal.isPending}
              >
                <Flag className="w-4 h-4 mr-2" />
                Complete Goal
              </Button>
              <Button
                variant="destructive"
                className="flex-1 opacity-80 hover:opacity-100"
                onClick={() => handleStop("CANCELLED")}
                disabled={stopGoal.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Goal Title</Label>
              <Input
                placeholder="e.g. New Microphone"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Target Amount (IDR)</Label>
              <div className="relative">
                <CircleDollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="500.000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  type="number"
                />
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleCreate}
              disabled={createGoal.isPending}
            >
              Start Goal
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
