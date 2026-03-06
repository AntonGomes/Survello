"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { format } from "date-fns"

import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { JobRead } from "@/client"
import { DataTableColumnHeader } from "@/components/data-table-column-header"

export const columns: ColumnDef<JobRead>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Job Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <Link 
            href={`/app/jobs/${row.original.id}`}
            className="max-w-[500px] truncate font-medium hover:underline"
          >
            {row.getValue("name")}
          </Link>
        </div>
      )
    },
  },
  {
    accessorKey: "client.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.original.client.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      
      return (
        <Badge variant={
          status === "active" ? "default" : 
          status === "completed" ? "secondary" : 
          status === "planned" ? "outline" : "destructive"
        } className="capitalize">
          {status}
        </Badge>
      )
    },
    filterFn: (...[row, id, value]) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground">
          {format(new Date(row.getValue("created_at")), "MMM d, yyyy")}
        </div>
      )
    },
  },
]
