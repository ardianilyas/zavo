"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/trpc/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const createProfileSchema = z.object({
  username: z.string().min(3, "Min 3 chars").max(20, "Max 20 chars").regex(/^[a-zA-Z0-9_]+$/, "Alphanumeric only"),
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
});

interface CreateProfileDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export function CreateProfileDialog({ children, onSuccess }: CreateProfileDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof createProfileSchema>>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: {
      username: "",
      name: "",
      bio: "",
    }
  });

  const { mutate, isPending } = api.creator.create.useMutation({
    onSuccess: () => {
      toast.success("Profile created successfully!");
      setOpen(false);
      form.reset();
      onSuccess?.();
    },
    onError: (err) => {
      toast.error("Failed to create profile", { description: err.message });
    }
  });

  const onSubmit = (values: z.infer<typeof createProfileSchema>) => {
    mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Creator Profile</DialogTitle>
          <DialogDescription>
            Choose a unique username and display name for your new persona.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. zavo_official" {...field} />
                  </FormControl>
                  <FormDescription>Unique handle, used in your URL.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Zavo Official" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us about yourself..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Profile
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
