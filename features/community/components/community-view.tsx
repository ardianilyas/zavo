"use client";

import { useState } from "react";
import { api } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Plus, Users, LogOut, LogIn, Crown, MoreVertical, Edit, Trash2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const communitySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  slug: z.string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
});

type CommunityValues = z.infer<typeof communitySchema>;

export function CommunityView() {
  const { data: myCommunities, isLoading: myLoading, refetch: refetchMy } = api.community.getMyCommunities.useQuery();
  const { data: allCommunities, isLoading: allLoading, refetch: refetchAll } = api.community.getAll.useQuery();

  // State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);

  // Forms
  const createForm = useForm<CommunityValues>({
    resolver: zodResolver(communitySchema),
    defaultValues: { name: "", description: "", slug: "" },
  });

  const editForm = useForm<CommunityValues>({
    resolver: zodResolver(communitySchema),
    defaultValues: { name: "", description: "", slug: "" },
  });

  // Mutations
  const createMutation = api.community.create.useMutation({
    onSuccess: () => {
      toast.success("Community created successfully!");
      setIsCreateOpen(false);
      createForm.reset();
      refetchMy();
      refetchAll();
    },
    onError: (err) => toast.error(err.message)
  });

  const updateMutation = api.community.update.useMutation({
    onSuccess: () => {
      toast.success("Community updated successfully!");
      setIsEditOpen(false);
      refetchMy();
      refetchAll();
    },
    onError: (err) => toast.error(err.message)
  });

  const deleteMutation = api.community.delete.useMutation({
    onSuccess: () => {
      toast.success("Community deleted successfully");
      setIsDeleteOpen(false);
      refetchMy();
      refetchAll();
    },
    onError: (err) => toast.error(err.message)
  });

  const joinMutation = api.community.join.useMutation({
    onSuccess: () => {
      toast.success("Joined community!");
      refetchMy();
      refetchAll();
    },
    onError: (err) => toast.error(err.message)
  });

  const leaveMutation = api.community.leave.useMutation({
    onSuccess: () => {
      toast.success("Left community");
      refetchMy();
      refetchAll();
    },
    onError: (err) => toast.error(err.message)
  });

  // Handlers
  const onCreateSubmit = (data: CommunityValues) => createMutation.mutate(data);

  const onEditSubmit = (data: CommunityValues) => {
    if (!selectedCommunity) return;
    updateMutation.mutate({ id: selectedCommunity.id, data });
  };

  const openEdit = (community: any) => {
    setSelectedCommunity(community);
    editForm.reset({
      name: community.name,
      description: community.description || "",
      slug: community.slug,
    });
    setIsEditOpen(true);
  };

  const openDelete = (community: any) => {
    setSelectedCommunity(community);
    setIsDeleteOpen(true);
  };

  const isLoading = myLoading || allLoading;

  if (isLoading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Communities
          </h2>
          <p className="text-muted-foreground mt-1 text-base">
            Create your exclusive circle or join others to collaborate.
          </p>
        </div>

        {!myCommunities?.owned && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30">
                <Plus className="mr-2 h-5 w-5" />
                Create Community
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create your Community</DialogTitle>
                <DialogDescription>
                  Build your exclusive space. You can act as a manager and members can join.
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6 py-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Community Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. The Creator Circle" className="h-10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Slug</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <span className="bg-muted px-3 py-2 text-sm text-muted-foreground border border-r-0 rounded-l-md h-10 flex items-center">
                              /c/
                            </span>
                            <Input placeholder="creator-circle" className="h-10 rounded-l-none" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Unique URL identifier. Lowercase, numbers and dashes only.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="What is this community about?" className="min-h-[100px] resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={createMutation.isPending} className="w-full sm:w-auto">
                      {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Community
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="browse" className="rounded-lg px-4">Browse</TabsTrigger>
            <TabsTrigger value="my" className="rounded-lg px-4">My Communities</TabsTrigger>
          </TabsList>
        </div>

        {/* Browse Tab */}
        <TabsContent value="browse" className="mt-0">
          {allCommunities?.length ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {allCommunities.map((c: any) => (
                <Card key={c.id} className="group border transition-all duration-300 hover:border-primary/30 hover:shadow-xl dark:hover:shadow-primary/10 hover:-translate-y-1">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <CardTitle className="text-lg leading-snug">
                          {c.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm">
                          <Avatar className="h-6 w-6 border-2 border-background">
                            <AvatarImage src={c.owner?.image} />
                            <AvatarFallback className="text-xs">{c.owner?.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-muted-foreground">{c.owner?.name}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4 space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-[40px]">
                      {c.description || "No description provided."}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span className="font-medium">{c.memberCount}</span>
                        <span>members</span>
                      </div>
                      {c.isJoined && (
                        <Badge variant="secondary" className="text-primary border-primary/20 bg-primary/5 text-xs">
                          ✓ Joined
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    {c.isJoined ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => leaveMutation.mutate({ communityId: c.id })}
                        disabled={leaveMutation.isPending}
                        className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        {leaveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                        Leave Community
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => joinMutation.mutate({ communityId: c.id })}
                        disabled={joinMutation.isPending}
                        className="w-full"
                      >
                        {joinMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                        Join Community
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center animate-in fade-in-50">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-4">
                <Users className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold">No communities found</h3>
              <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                There are no communities to join yet. Be a pioneer and create the first one!
              </p>
            </div>
          )}
        </TabsContent>

        {/* My Communities Tab */}
        <TabsContent value="my" className="mt-0">
          <div className="grid gap-8">
            {/* Owned Community Section */}
            {myCommunities?.owned && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-semibold">Managed by You</h3>
                </div>
                <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-transparent dark:from-primary/10 relative">
                  <div className="absolute top-4 right-4 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-background/80">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => openEdit(myCommunities.owned)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => openDelete(myCommunities.owned)}
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Community
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between pr-8">
                      <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500">
                          <Crown className="h-7 w-7" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl mb-1">{myCommunities.owned.name}</CardTitle>
                          <CardDescription className="font-mono text-xs">/c/{myCommunities.owned.slug}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">{myCommunities.owned.description || "No description provided."}</p>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Users className="h-4 w-4" />
                          <span className="text-xs font-medium uppercase tracking-wide">Members</span>
                        </div>
                        <div className="text-3xl font-bold">{myCommunities.owned.memberCount || 0}</div>
                      </div>
                      <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Created</div>
                        <div className="text-sm font-semibold text-foreground">
                          {new Date(myCommunities.owned.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/30 pt-4">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Members
                    </Button>
                  </CardFooter>
                </Card>
              </section>
            )}

            {/* Joined Communities Section */}
            {(myCommunities?.joined?.length ?? 0) > (myCommunities?.owned ? 1 : 0) ? ( // Check if there are joined communities other than owned
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <Users className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">Communities You've Joined</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {myCommunities?.joined
                    .filter((c: any) => c.id !== myCommunities?.owned?.id)
                    .map((c: any) => (
                      <Card key={c.id} className="hover:border-border/80 transition-all hover:shadow-md">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base leading-snug">{c.name}</CardTitle>
                          <CardDescription className="line-clamp-2 text-xs leading-relaxed">{c.description || "No description."}</CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-between items-center border-t bg-muted/20 pt-3">
                          <span className="text-xs text-muted-foreground font-mono">/c/{c.slug}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => leaveMutation.mutate({ communityId: c.id })}
                          >
                            <LogOut className="mr-1.5 h-3.5 w-3.5" />
                            Leave
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </section>
            ) : (
              !myCommunities?.owned && (
                <div className="text-center p-12 text-muted-foreground border border-dashed rounded-xl">
                  You haven't joined any communities yet. Check the Browse tab!
                </div>
              )
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Community</DialogTitle>
            <DialogDescription>
              Update your community details.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6 py-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Slug</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently delete your community and remove all members."
        confirmText="Delete Community"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (selectedCommunity) deleteMutation.mutate({ id: selectedCommunity.id });
        }}
      />
    </div>
  );
}

