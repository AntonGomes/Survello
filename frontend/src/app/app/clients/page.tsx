"use client";

import { useMemo, useState } from "react";
import { FeatureHeader } from "@/components/feature-header";
import { useQuery } from "@tanstack/react-query";
import { readClientsOptions } from "@/client/@tanstack/react-query.gen";
import { CreateClientDialog } from "@/components/create-client-dialog";
import { ClientCard } from "@/components/client-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Loader2, ArrowUpDown } from "lucide-react";
import type { ClientRead } from "@/client";

type SortOption = "name-asc" | "name-desc" | "created-asc" | "created-desc" | "updated-asc" | "updated-desc";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "created-desc", label: "Created (Newest)" },
  { value: "created-asc", label: "Created (Oldest)" },
  { value: "updated-desc", label: "Updated (Newest)" },
  { value: "updated-asc", label: "Updated (Oldest)" },
];

function ClientsToolbar({ searchQuery, setSearchQuery, sortBy, setSortBy }: {
  searchQuery: string; setSearchQuery: (v: string) => void; sortBy: SortOption; setSortBy: (v: SortOption) => void
}) {
  const currentSortLabel = sortOptions.find(o => o.value === sortBy)?.label || "Sort";
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search clients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 border-dashed"><ArrowUpDown className="mr-2 h-4 w-4" />{currentSortLabel}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            {sortOptions.map((option) => <DropdownMenuRadioItem key={option.value} value={option.value}>{option.label}</DropdownMenuRadioItem>)}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex-1" />
      <CreateClientDialog />
    </div>
  );
}

function useFilteredClients({ clients, searchQuery, sortBy }: { clients: Array<{ name: string; address?: string | null; contacts?: Array<{ name: string }> | null; created_at: string; updated_at: string }> | undefined; searchQuery: string; sortBy: SortOption }) {
  return useMemo(() => {
    if (!clients) return [];
    let result = [...clients];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(query) || c.address?.toLowerCase().includes(query) || c.contacts?.some((contact) => contact.name.toLowerCase().includes(query)));
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc": return a.name.localeCompare(b.name);
        case "name-desc": return b.name.localeCompare(a.name);
        case "created-asc": return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "created-desc": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "updated-asc": return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        case "updated-desc": return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        default: return 0;
      }
    });
    return result;
  }, [clients, searchQuery, sortBy]);
}

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const { data: clients, isLoading, isError } = useQuery({ ...readClientsOptions() });
  const filteredClients = useFilteredClients({ clients, searchQuery, sortBy });

  return (
    <div className="space-y-6 h-full flex flex-col">
      <FeatureHeader title="Clients" badge={null} />
      <div className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : isError ? (
          <div className="text-center py-12 text-destructive border rounded-lg border-dashed border-destructive/50 bg-destructive/10">Failed to load clients. Please try again later.</div>
        ) : (
          <>
            <ClientsToolbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} sortBy={sortBy} setSortBy={setSortBy} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => <ClientCard key={(client as unknown as { id: number }).id} client={client as unknown as ClientRead & { jobs?: { id: number; status?: string }[] }} />)}
              {filteredClients.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">{searchQuery ? "No clients match your search" : "No clients yet"}</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
