import { Table } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const PAGE_SIZE_SMALL = 10
const PAGE_SIZE_MEDIUM = 20
const PAGE_SIZE_LARGE = 30
const PAGE_SIZE_XL = 40
const PAGE_SIZE_XXL = 50
const PAGE_SIZE_OPTIONS = [PAGE_SIZE_SMALL, PAGE_SIZE_MEDIUM, PAGE_SIZE_LARGE, PAGE_SIZE_XL, PAGE_SIZE_XXL]

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

function PageSizeSelector<TData>({ table }: { table: Table<TData> }) {
  return (
    <div className="flex items-center space-x-2">
      <p className="text-sm font-medium">Rows per page</p>
      <Select value={`${table.getState().pagination.pageSize}`} onValueChange={(value) => table.setPageSize(Number(value))}>
        <SelectTrigger className="h-8 w-[70px]"><SelectValue placeholder={table.getState().pagination.pageSize} /></SelectTrigger>
        <SelectContent side="top">
          {PAGE_SIZE_OPTIONS.map((pageSize) => <SelectItem key={pageSize} value={`${pageSize}`}>{pageSize}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

function PageNavButtons<TData>({ table }: { table: Table<TData> }) {
  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
        <span className="sr-only">Go to first page</span><ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
        <span className="sr-only">Go to previous page</span><ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
        <span className="sr-only">Go to next page</span><ChevronRight className="h-4 w-4" />
      </Button>
      <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
        <span className="sr-only">Go to last page</span><ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">{table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.</div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <PageSizeSelector table={table} />
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</div>
        <PageNavButtons table={table} />
      </div>
    </div>
  )
}
