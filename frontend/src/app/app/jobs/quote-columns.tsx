"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowRight, FileText } from "lucide-react";

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
import { QuoteRead } from "@/client";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { getStalenessText } from "@/lib/staleness";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  accepted: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  declined: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

interface QuoteColumnsProps {
  onConvert: (quote: QuoteRead) => void;
}

export const createQuoteColumns = ({
  onConvert,
}: QuoteColumnsProps): ColumnDef<QuoteRead>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quote Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="font-medium flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          {row.getValue("name")}
        </div>
      );
    },
  },
  {
    id: "client_or_lead",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client / Lead" />
    ),
    cell: ({ row }) => {
      const quote = row.original;
      if (quote.client) {
        return (
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">Client</Badge>
            <span>{quote.client.name}</span>
          </div>
        );
      }
      if (quote.lead) {
        return (
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs bg-amber-50">Lead</Badge>
            <span>{quote.lead.name}</span>
          </div>
        );
      }
      return <span className="text-muted-foreground">—</span>;
    },
  },
  {
    accessorKey: "estimated_fee",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Est. Fee" />
    ),
    cell: ({ row }) => {
      const fee = row.getValue("estimated_fee") as number | null;
      if (!fee) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="font-medium">
          £{fee.toLocaleString()}
        </div>
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
    id: "lines_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Projects" />
    ),
    cell: ({ row }) => {
      const linesCount = row.original.lines?.length || 0;
      return (
        <span className="text-muted-foreground">
          {linesCount} project{linesCount !== 1 ? "s" : ""}
        </span>
      );
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
      const quote = row.original;
      const isAccepted = quote.status === "accepted";
      const isConverted = !!quote.converted_job_id;

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
            {!isConverted && isAccepted && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onConvert(quote);
                }}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Convert to Job
              </DropdownMenuItem>
            )}
            {isConverted && quote.converted_job_id && (
              <DropdownMenuItem asChild>
                <a href={`/app/jobs/${quote.converted_job_id}`}>
                  View Job
                </a>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
