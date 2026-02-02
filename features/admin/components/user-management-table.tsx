"use client";

import { useState } from "react";
import { api } from "@/trpc/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  MoreVertical,
  Search,
  Ban,
  CheckCircle,
  Loader2,
  User as UserIcon,
  ShieldAlert,
  Clock,
  Unlock,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export function UserManagementTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended" | "banned">("all");

  // Dialog State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [moderationType, setModerationType] = useState<"BAN" | "SUSPEND" | "UNBAN" | null>(null);
  const [banReason, setBanReason] = useState("");
  const [suspendDuration, setSuspendDuration] = useState<string>("7");

  // Debounce Search effect
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    const handler = setTimeout(() => {
      setDebouncedSearch(e.target.value);
      setPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(handler);
  };

  const { data, isLoading, refetch } = api.admin.getUsers.useQuery({
    page,
    limit: 10,
    search: debouncedSearch,
    status: statusFilter
  });

  const toggleBanMutation = api.admin.toggleBan.useMutation({
    onSuccess: () => {
      toast.success("User status updated successfully.");
      refetch();
      closeDialog();
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const closeDialog = () => {
    setModerationType(null);
    setBanReason("");
    setSuspendDuration("7");
    setSelectedUser(null);
  };

  const handleModeration = () => {
    if (!selectedUser || !moderationType) return;

    toggleBanMutation.mutate({
      userId: selectedUser.id,
      action: moderationType === "UNBAN" ? "UNBAN" : "BAN",
      reason: moderationType === "UNBAN" ? undefined : banReason,
      duration: moderationType === "SUSPEND" ? parseInt(suspendDuration) : undefined
    });
  };

  const isSuspended = (user: any) => {
    if (!user || !user.suspendedUntil) return false;
    return new Date(user.suspendedUntil) > new Date();
  };

  const getStatusBadge = (user: any) => {
    if (user.banned) return <Badge variant="destructive" className="gap-1.5 px-2.5 py-0.5 rounded-full"><ShieldAlert className="w-3.5 h-3.5" /> Banned</Badge>;
    if (isSuspended(user)) return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 gap-1.5 px-2.5 py-0.5 rounded-full"><Clock className="w-3.5 h-3.5" /> Suspended</Badge>;
    return <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 gap-1.5 px-2.5 py-0.5 rounded-full"><CheckCircle className="w-3.5 h-3.5" /> Active</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between bg-background p-1 rounded-lg">
        <Tabs value={statusFilter} onValueChange={(v: any) => { setStatusFilter(v); setPage(1); }} className="w-full sm:w-auto">
          <TabsList className="bg-muted/50 p-1 h-11">
            <TabsTrigger value="all" className="px-5 data-[state=active]:bg-background data-[state=active]:shadow-sm">All</TabsTrigger>
            <TabsTrigger value="active" className="px-5 data-[state=active]:bg-background data-[state=active]:shadow-sm">Active</TabsTrigger>
            <TabsTrigger value="suspended" className="px-5 data-[state=active]:bg-background data-[state=active]:shadow-sm">Suspended</TabsTrigger>
            <TabsTrigger value="banned" className="px-5 data-[state=active]:bg-background data-[state=active]:shadow-sm">Banned</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
          <Input
            placeholder="Search name or email..."
            className="pl-10 h-11 border-border/60 bg-muted/20 focus-visible:ring-primary/30 focus-visible:border-primary transition-all rounded-xl"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-border/40">
              <TableHead className="w-[320px] py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">User Information</TableHead>
              <TableHead className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Status</TableHead>
              <TableHead className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Creators</TableHead>
              <TableHead className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Joined</TableHead>
              <TableHead className="py-4 px-6 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-9 w-9 animate-spin text-primary/70" />
                    <span className="text-sm text-muted-foreground animate-pulse font-medium">Fetching secure data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-3 opacity-60">
                    <div className="p-4 bg-muted rounded-full">
                      <Filter className="h-10 w-10 text-muted-foreground/40" />
                    </div>
                    <p className="font-medium text-base">No matches found</p>
                    <p className="text-xs">Try adjusting your filters or search terms.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.users.map((user: any) => (
                <TableRow key={user.id} className="group hover:bg-primary/5 transition-all border-border/30">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-11 w-11 border-2 border-background shadow-md group-hover:scale-105 transition-transform">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-bold">
                          {user.name?.charAt(0) || <UserIcon className="h-5 w-5" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-sm tracking-tight text-foreground/90">{user.name}</span>
                        <span className="text-[11px] font-medium text-muted-foreground/80 flex items-center gap-1">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    {getStatusBadge(user)}
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    {user.creator ? (
                      <div className="inline-flex items-center gap-2 py-1 px-2 rounded-lg bg-blue-50 border border-blue-100/50">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        <span className="text-xs font-bold text-blue-600/90 tracking-tight">@{user.creator.username}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest pl-2">None</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-4 text-xs font-medium text-muted-foreground/80">
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-colors">
                          <MoreVertical className="h-4.5 w-4.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {user.banned || isSuspended(user) ? (
                          <DropdownMenuItem
                            onClick={() => { setSelectedUser(user); setModerationType("UNBAN"); }}
                            className="text-green-600 cursor-pointer"
                          >
                            <Unlock className="w-4 h-4 mr-2" />
                            Restore Access
                          </DropdownMenuItem>
                        ) : (
                          <>
                            <DropdownMenuItem
                              onClick={() => { setSelectedUser(user); setModerationType("SUSPEND"); }}
                              className="cursor-pointer"
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => { setSelectedUser(user); setModerationType("BAN"); }}
                              className="text-destructive focus:text-destructive cursor-pointer"
                            >
                              <Ban className="w-4 h-4 mr-2" />
                              Ban User
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between py-2 px-1">
          <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider">
            Records: <span className="text-foreground/80">{data.users.length}</span> of <span className="text-foreground/80">{data.total}</span>
          </span>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-xl border-border/50 hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-30"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              Previous
            </Button>
            <div className="flex items-center px-4 text-xs font-bold bg-muted/50 h-9 rounded-xl border border-border/50 min-w-[4rem] justify-center tracking-tighter">
              {page} <span className="mx-1 text-muted-foreground/40">/</span> {data.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-xl border-border/50 hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-30"
              onClick={() => setPage((p) => Math.min(data.totalPages || 1, p + 1))}
              disabled={page === (data.totalPages || 1) || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Moderation Dialog */}
      <Dialog open={!!moderationType} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="rounded-3xl border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-2 shadow-inner ${moderationType === "UNBAN" ? "bg-emerald-50 text-emerald-600" :
              moderationType === "SUSPEND" ? "bg-amber-50 text-amber-600" :
                "bg-rose-50 text-rose-600"
              }`}>
              {moderationType === "UNBAN" && <Unlock className="w-8 h-8" />}
              {moderationType === "SUSPEND" && <Clock className="w-8 h-8" />}
              {moderationType === "BAN" && <Ban className="w-8 h-8" />}
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-center">
              {moderationType === "UNBAN" ? "Restore Access" : moderationType === "SUSPEND" ? "Suspend User" : "Permanent Ban"}
            </DialogTitle>
            <DialogDescription className="text-center text-sm font-medium px-4 leading-relaxed">
              {moderationType === "UNBAN"
                ? `Ready to welcome back ${selectedUser?.name}? This will clear all restrictions instantly.`
                : moderationType === "SUSPEND"
                  ? `Temporarily restrict ${selectedUser?.name}. They won't be able to access their account until the timer expires.`
                  : `This is a permanent action for ${selectedUser?.name}. Use this only for severe violations.`}
            </DialogDescription>
          </DialogHeader>

          {moderationType !== "UNBAN" && (
            <div className="grid gap-6 py-4">
              {moderationType === "SUSPEND" && (
                <div className="grid gap-2.5">
                  <Label htmlFor="duration" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Timeframe</Label>
                  <Select value={suspendDuration} onValueChange={setSuspendDuration}>
                    <SelectTrigger className="h-12 rounded-xl border-border/60 bg-muted/20 focus:ring-primary/20">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-xl border-border/40">
                      <SelectItem value="3">3 Days (Minor)</SelectItem>
                      <SelectItem value="7">7 Days (Warning)</SelectItem>
                      <SelectItem value="14">14 Days (Standard)</SelectItem>
                      <SelectItem value="30">30 Days (Major)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid gap-2.5">
                <Label htmlFor="reason" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Incident Report / Reason</Label>
                <Input
                  id="reason"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="e.g. Terms of Service violation Section 4.2"
                  autoFocus
                  className="h-12 rounded-xl border-border/60 bg-muted/20 focus-visible:ring-primary/20 shadow-sm transition-all"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-3 sm:gap-0 mt-6 sm:flex-row flex-col-reverse">
            <Button variant="ghost" onClick={closeDialog} className="flex-1 sm:flex-none h-12 rounded-xl font-bold hover:bg-muted">Cancel</Button>
            <Button
              variant={moderationType === "UNBAN" ? "default" : moderationType === "SUSPEND" ? "secondary" : "destructive"}
              onClick={handleModeration}
              disabled={moderationType !== "UNBAN" && !banReason}
              className={`flex-1 sm:flex-none h-12 rounded-xl font-bold shadow-lg transition-all active:scale-95 ${moderationType === "SUSPEND" ? "bg-amber-600 hover:bg-amber-700 text-white" : ""
                }`}
            >
              {moderationType === "UNBAN" ? "Restore Access" : moderationType === "SUSPEND" ? "Confirm Suspension" : "Confirm Permanent Ban"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
