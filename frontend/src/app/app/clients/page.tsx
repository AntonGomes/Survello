"use client";

import { FeatureHeader } from "@/components/feature-header";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { useQuery } from "@tanstack/react-query";
import { readClientsOptions } from "@/client/@tanstack/react-query.gen";
import { CreateClientDialog } from "@/components/create-client-dialog";

export default function ClientsPage() {
  const { data: clients } = useQuery({
    ...readClientsOptions()
  });

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <FeatureHeader 
          title="Clients" 
          description="Manage your clients and their contacts."
        />
        <CreateClientDialog />
      </div>

      <div className="flex-1 overflow-hidden rounded-md border bg-card">
        <DataTable 
          columns={columns} 
          data={clients || []} 
        />
      </div>
    </div>
  );
}

