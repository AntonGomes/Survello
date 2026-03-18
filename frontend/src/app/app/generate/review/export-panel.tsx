"use client"

import { Download, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

type ExportPanelProps = {
  totalItems: number
  totalCost: number
}

function formatCurrency(value: number): string {
  return `\u00A3${value.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`
}

export function ExportPanel({ totalItems, totalCost }: ExportPanelProps) {
  const router = useRouter()

  return (
    <div className="border-t bg-muted/30 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Items</p>
            <p className="text-lg font-semibold">{totalItems}</p>
          </div>
          <Separator orientation="vertical" className="h-10" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Cost</p>
            <p className="text-lg font-semibold">{formatCurrency(totalCost)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push("/app/generate")}>
            <Plus className="h-4 w-4 mr-1" />
            Start New
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-1" />
            Export to XLSX
          </Button>
        </div>
      </div>
    </div>
  )
}
