"use client";

import { useState } from "react";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Plus, Users } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const createCommunitySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  slug: z.string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
});

type CreateCommunityValues = z.infer<typeof createCommunitySchema>;

export function CommunityView() {
  const { data: myCommunities, isLoading, refetch } = api.community.getMyCommunities.useQuery();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<CreateCommunityValues>({
    resolver: zodResolver(createCommunitySchema),
    defaultValues: {
      name: "",
      description: "",
      slug: "",
    },
  });

  const createMutation = api.community.create.useMutation({
    onSuccess: () => {
      toast.success("Community created successfully!");
      setIsOpen(false);
      form.reset();
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const onSubmit = (data: CreateCommunityValues) => {
    createMutation.mutate(data);
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Communities</h2>
          <p className="text-muted-foreground">Manage your circle or join others.</p>
        </div>
        {!myCommunities?.owned && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Community
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a Community</DialogTitle>
                <DialogDescription>
                  Create an exclusive circle for creators. You can only own one community.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Awesome Community" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug (URL)</FormLabel>
                        <FormControl>
                          <Input placeholder="my-awesome-community" {...field} />
                        </FormControl>
                        <FormDescription>
                          Unique identifier for your community URL. Lowercase, numbers, and dashes only.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your community..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6">
        {myCommunities?.owned && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {myCommunities.owned.name} (Owner)
              </CardTitle>
              <CardDescription>{myCommunities.owned.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Slug: {myCommunities.owned.slug}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Manage Members</Button>
            </CardFooter>
          </Card>
        )}

        {myCommunities?.joined?.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myCommunities.joined.map((c: any) => (
              <Card key={c.id}>
                <CardHeader>
                  <CardTitle>{c.name}</CardTitle>
                  <CardDescription>{c.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          !myCommunities?.owned && <div className="text-center p-10 text-muted-foreground">You haven't joined any communities yet.</div>
        )}
      </div>
    </div>
  );
}
