"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { LeadRead } from "@/client";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { getStalenessRowClass, getStalenessText } from "@/lib/staleness";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  contacted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  quoted: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  converted: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  lost: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
};

interface LeadColumnsProps {
  onConvert: (lead: LeadRead) => void;
}

export const createLeadColumns = ({
  onConvert,
}: LeadColumnsProps): ColumnDef<LeadRead>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company / Name" />
    ),
    cell: ({ row }) => {
      const stalenessClass = getStalenessRowClass(row.original.updated_at);
      return (
        <div className={cn("font-medium", stalenessClass && "px-2 py-1 -mx-2 -my-1 rounded")}>
          {row.getValue("name")}
        </div>
      );
    },
  },
  {
    accessorKey: "contact_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact" />
    ),
    cell: ({ row }) => row.getValue("contact_name") || "—",
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const email = row.getValue("email") as string | null;
      if (!email) return "—";
      return (
        <a
          href={`mailto:${email}`}
          className="text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {email}
        </a>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant="outline" className={cn("capitalize", statusColors[status])}>
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Updated" />
    ),
    cell: ({ row }) => {
      const updatedAt = row.getValue("updated_at") as string;
      return (
        <div className="text-muted-foreground text-sm">
          {getStalenessText(updatedAt)}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const lead = row.original;
      const isConverted = lead.status === "converted";

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {!isConverted && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onConvert(lead);
                }}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Convert to Client
              </DropdownMenuItem>
            )}
            {isConverted && lead.converted_client_id && (
              <DropdownMenuItem asChild>
                <a href={`/app/clients/${lead.converted_client_id}`}>
                  View Client
                </a>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
