"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api as trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";

const onboardingSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  bio: z.string().max(160).optional(),
});

export function OnboardingForm() {
  const router = useRouter();
  const mutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated!");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: "",
      bio: "",
    },
  });

  function onSubmit(values: z.infer<typeof onboardingSchema>) {
    mutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <span className="bg-muted px-3 py-2 border border-r-0 rounded-l-md text-muted-foreground">
                    zavo.app/@
                  </span>
                  <Input
                    placeholder="username"
                    {...field}
                    className="rounded-l-none"
                  />
                </div>
              </FormControl>
              <FormDescription>
                This is your public display name. It can be your real name or a pseudonym.
              </FormDescription>
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
                <Input placeholder="Tell us a little bit about yourself" {...field} />
              </FormControl>
              <FormDescription>
                You can @mention other users and organizations to link to them.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-4">
          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Creator Profile
          </Button>
        </div>
      </form>
    </Form>
  );
}
