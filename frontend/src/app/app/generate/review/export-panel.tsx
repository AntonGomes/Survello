"use client"

import { useState } from "react"
import { Download, Loader2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

type ExportPanelProps = {
  dilapsId: number
  totalItems: number
  totalCost: number
}

function formatCurrency(value: number): string {
  return `\u00A3${value.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`
}

async function downloadExport(dilapsId: number) {
  const response = await fetch(`/py-api/dilaps/${dilapsId}/export`, {
    method: "POST",
    credentials: "include",
  })
  if (!response.ok) {
    throw new Error(`Export failed: ${response.status} ${response.statusText}`)
  }
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `dilaps_${dilapsId}.xlsx`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function ExportPanel({ dilapsId, totalItems, totalCost }: ExportPanelProps) {
  const router = useRouter()
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    setIsExporting(true)
    try {
      await downloadExport(dilapsId)
    } finally {
      setIsExporting(false)
    }
  }

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
          <Button onClick={handleExport} disabled={isExporting || !dilapsId}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-1" />
            )}
            Export to XLSX
          </Button>
        </div>
      </div>
    </div>
  )
}
