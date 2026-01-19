"use client";

import { useMemo } from "react";
import { FeatureHeader } from "@/components/feature-header";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { createLeadColumns } from "./lead-columns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  readClientsOptions,
  readLeadsOptions,
  convertLeadMutation,
} from "@/client/@tanstack/react-query.gen";
import { CreateClientDialog } from "@/components/create-client-dialog";
import { CreateLeadDialog } from "@/components/create-lead-dialog";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadRead } from "@/client";
import { getStalenessRowClass } from "@/lib/staleness";
import { cn } from "@/lib/utils";

export default function ClientsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: clients } = useQuery({
    ...readClientsOptions(),
  });

  const { data: leads } = useQuery({
    ...readLeadsOptions(),
  });

  const { mutate: convertLead } = useMutation({
    ...convertLeadMutation(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: readLeadsOptions().queryKey });
      queryClient.invalidateQueries({ queryKey: readClientsOptions().queryKey });
      // Navigate to the new client
      router.push(`/app/clients/${data.client_id}`);
    },
  });

  const handleConvertLead = (lead: LeadRead) => {
    if (confirm(`Convert "${lead.name}" to a client?`)) {
      convertLead({ path: { lead_id: lead.id } });
    }
  };

  const leadColumns = useMemo(
    () => createLeadColumns({ onConvert: handleConvertLead }),
    []
  );

  // Count active leads (not converted or lost)
  const activeLeadsCount = leads?.filter(
    (l) => l.status !== "converted" && l.status !== "lost"
  ).length;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <FeatureHeader title="Clients" badge={null} />

      <Tabs defaultValue="clients" className="flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="clients">
              Clients
              {clients && clients.length > 0 && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {clients.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="leads">
              Leads
              {activeLeadsCount !== undefined && activeLeadsCount > 0 && (
                <span className="ml-2 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs text-blue-800 dark:text-blue-400">
                  {activeLeadsCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <TabsContent value="clients" className="mt-0">
              <CreateClientDialog />
            </TabsContent>
            <TabsContent value="leads" className="mt-0">
              <CreateLeadDialog />
            </TabsContent>
          </div>
        </div>

        <TabsContent value="clients" className="flex-1 mt-4">
          <DataTable
            columns={columns}
            data={clients || []}
            searchKey="name"
            onRowClick={(row) => router.push(`/app/clients/${row.id}`)}
          />
        </TabsContent>

        <TabsContent value="leads" className="flex-1 mt-4">
          <DataTable
            columns={leadColumns}
            data={leads || []}
            searchKey="name"
            facetedFilters={[
              {
                columnId: "status",
                title: "Status",
                options: [
                  { value: "new", label: "New" },
                  { value: "contacted", label: "Contacted" },
                  { value: "quoted", label: "Quoted" },
                  { value: "converted", label: "Converted" },
                  { value: "lost", label: "Lost" },
                ],
              },
            ]}
            getRowClassName={(row) => getStalenessRowClass(row.updated_at)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}


