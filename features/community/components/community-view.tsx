"use client";

import { useState } from "react";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Plus, Users, LogOut, LogIn, Crown } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const { data: myCommunities, isLoading: myLoading, refetch: refetchMy } = api.community.getMyCommunities.useQuery();
  const { data: allCommunities, isLoading: allLoading, refetch: refetchAll } = api.community.getAll.useQuery();
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
      refetchMy();
      refetchAll();
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const joinMutation = api.community.join.useMutation({
    onSuccess: () => {
      toast.success("Joined community!");
      refetchMy();
      refetchAll();
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const leaveMutation = api.community.leave.useMutation({
    onSuccess: () => {
      toast.success("Left community");
      refetchMy();
      refetchAll();
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const onSubmit = (data: CreateCommunityValues) => {
    createMutation.mutate(data);
  };

  const isLoading = myLoading || allLoading;

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

      <Tabs defaultValue="browse" className="w-full">
        <TabsList>
          <TabsTrigger value="browse">Browse Communities</TabsTrigger>
          <TabsTrigger value="my">My Communities</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-6">
          {allCommunities?.length ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allCommunities.map((c: any) => (
                <Card key={c.id} className="group hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {c.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">{c.description || "No description"}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={c.owner?.image} />
                        <AvatarFallback>{c.owner?.name?.charAt(0) || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-medium flex items-center gap-1">
                          <Crown className="h-3 w-3 text-amber-500" />
                          {c.owner?.name || "Unknown"}
                        </p>
                        <p className="text-muted-foreground text-xs">@{c.owner?.username}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Users className="h-3 w-3" />
                        {c.memberCount} members
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {c.isJoined ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => leaveMutation.mutate({ communityId: c.id })}
                        disabled={leaveMutation.isPending}
                        className="w-full"
                      >
                        {leaveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                        Leave
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => joinMutation.mutate({ communityId: c.id })}
                        disabled={joinMutation.isPending}
                        className="w-full"
                      >
                        {joinMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                        Join
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-10 text-muted-foreground">No communities available yet. Be the first to create one!</div>
          )}
        </TabsContent>

        <TabsContent value="my" className="mt-6">
          <div className="grid gap-6">
            {myCommunities?.owned && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-500" />
                    {myCommunities.owned.name}
                    <Badge variant="default" className="ml-2">Owner</Badge>
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
                {myCommunities.joined.filter((c: any) => c?.id !== myCommunities?.owned?.id).map((c: any) => (
                  <Card key={c.id}>
                    <CardHeader>
                      <CardTitle>{c.name}</CardTitle>
                      <CardDescription>{c.description}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => leaveMutation.mutate({ communityId: c.id })}
                        disabled={leaveMutation.isPending}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Leave
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              !myCommunities?.owned && <div className="text-center p-10 text-muted-foreground">You haven't joined any communities yet.</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

