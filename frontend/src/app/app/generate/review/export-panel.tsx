"use client"

import { useState } from "react"
import { Download, Loader2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { exportDilapsMutation } from "@/client/@tanstack/react-query.gen"

type ExportPanelProps = {
  totalItems: number
  totalCost: number
  dilapsId: number | null
}

function formatCurrency(value: number): string {
  return `\u00A3${value.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`
}

export function ExportPanel({ totalItems, totalCost, dilapsId }: ExportPanelProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const exportMutation = useMutation({
    ...exportDilapsMutation(),
    onSuccess: (data) => {
      const blob = data instanceof Blob
        ? data
        : new Blob([data as BlobPart], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "dilaps-schedule.xlsx"
      link.click()
      URL.revokeObjectURL(url)
      setError(null)
    },
    onError: (err) => {
      setError("Export failed")
    },
  })

  function handleExport() {
    if (!dilapsId) {
      setError("No dilaps ID found — cannot export")
      return
    }
    setError(null)
    exportMutation.mutate({
      path: { dilaps_id: dilapsId },
    })
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
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push("/app/generate")}>
            <Plus className="h-4 w-4 mr-1" />
            Start New
          </Button>
          <Button onClick={handleExport} disabled={exportMutation.isPending}>
            {exportMutation.isPending ? (
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
