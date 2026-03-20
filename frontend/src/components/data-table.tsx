"use client"

import * as React from "react"
import { ColumnDef, ColumnFiltersState, SortingState, VisibilityState, flexRender, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTablePagination } from "@/components/data-table-pagination"
import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Search } from "lucide-react"

interface FacetedFilter {
  columnId: string
  title: string
  options: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[]
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  facetedFilters?: FacetedFilter[]
  toolbarAction?: React.ReactNode
  onRowClick?: (row: TData) => void
  getRowClassName?: (row: TData) => string | undefined
}

function useDataTable<TData, TValue>(columns: ColumnDef<TData, TValue>[], data: TData[]) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState<string>("")

  const table = useReactTable({
    data, columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters, globalFilter },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection, onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters, onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(), getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(), getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return { table, globalFilter, setGlobalFilter }
}

function DataTableToolbar<TData>({ table, searchKey, globalFilter, setGlobalFilter, facetedFilters, toolbarAction }: {
  table: ReturnType<typeof useReactTable<TData>>; searchKey?: string; globalFilter: string; setGlobalFilter: (v: string) => void
  facetedFilters?: FacetedFilter[]; toolbarAction?: React.ReactNode
}) {
  const isFiltered = table.getState().columnFilters.length > 0
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {searchKey && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9" />
          </div>
        )}
        {facetedFilters?.map((filter) => table.getColumn(filter.columnId) && (
          <DataTableFacetedFilter key={filter.columnId} column={table.getColumn(filter.columnId)} title={filter.title} options={filter.options} />
        ))}
        {isFiltered && <Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-8 px-2 lg:px-3">Reset<X className="ml-2 h-4 w-4" /></Button>}
      </div>
      {toolbarAction}
    </div>
  )
}

export function DataTable<TData, TValue>({ columns, data, searchKey, facetedFilters, toolbarAction, onRowClick, getRowClassName }: DataTableProps<TData, TValue>) {
  const { table, globalFilter, setGlobalFilter } = useDataTable(columns, data)

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} searchKey={searchKey} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} facetedFilters={facetedFilters} toolbarAction={toolbarAction} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}
                  onClick={(e) => { const t = e.target as HTMLElement; if (t.closest("button") || t.closest("a") || t.closest("[role='checkbox']")) return; onRowClick?.(row.original) }}
                  className={`${onRowClick ? "cursor-pointer hover:bg-muted/50" : ""} ${getRowClassName?.(row.original) || ""}`.trim() || undefined}>
                  {row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
