
import { useState } from "react";
import { api } from "@/trpc/client";

interface UseUsersParams {
  limit?: number;
}

export function useUsers({ limit = 10 }: UseUsersParams = {}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended" | "banned">("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "creator">("all");

  const { data, isLoading, refetch } = api.admin.getUsers.useQuery({
    page,
    limit,
    search: debouncedSearch,
    status: statusFilter,
    role: roleFilter,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    // Simple debounce implementation inside the hook or just expose setters
    // Ideally we expose the raw setter and let the UI handle debounce or do it here.
    // Given the previous UI had debounce logic, let's keep it simple here and expose the setters.
    // But to match previous behavior, I will replicate the debounce setter here or just expose debouncedSearch setter.
  };

  // To avoid complexity, I'll expose the state setters directly for now
  // and let the component handle the debounce effect OR implement a simple internal one.
  // The component had a specific debounce handling. Let's try to keep the hook focused on state data.

  return {
    users: data?.users || [],
    total: data?.total || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    refetch,
    page,
    setPage,
    search,
    setSearch: (value: string) => {
      setSearch(value);
      // We will assume the component handles the debouncing or we can add a useEffect here if we want to be fully encapsulated.
      // For this refactor, let's expose debouncedSearch setter if needed or just handle it here.
    },
    debouncedSearch,
    setDebouncedSearch,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter
  };
}
