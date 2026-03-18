"use client"

import { useMemo } from "react"
import { Label, Pie, PieChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const PIE_LABEL_Y_OFFSET = 14

const statusChartConfig = {
  count: { label: "Instructions" },
  planned: { label: "Planned", color: "hsl(215 16% 47%)" },
  active: { label: "Active", color: "hsl(217 91% 60%)" },
  completed: { label: "Completed", color: "hsl(142 71% 45%)" },
  archived: { label: "Archived", color: "hsl(220 9% 46%)" },
} satisfies ChartConfig

export { statusChartConfig }

function PieLabelContent({ viewBox, total }: {
  viewBox?: { cx?: number; cy?: number }
  total: number
}) {
  if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null

  return (
    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl font-bold">
        {total}
      </tspan>
      <tspan x={viewBox.cx} y={(viewBox.cy || 0) + PIE_LABEL_Y_OFFSET} className="fill-muted-foreground text-[10px]">
        total
      </tspan>
    </text>
  )
}

export function StatusPieChart({ data }: {
  data: { status: string; count: number; fill: string }[]
}) {
  const total = useMemo(() => data.reduce((sum, d) => sum + d.count, 0), [data])
  const chartData = data.filter(d => d.count > 0)

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[100px] w-[100px] rounded-full bg-muted mx-auto">
        <span className="text-xs text-muted-foreground">No instructions</span>
      </div>
    )
  }

  return (
    <ChartContainer config={statusChartConfig} className="mx-auto aspect-square h-[100px]">
      <PieChart>
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Pie data={chartData} dataKey="count" nameKey="status" innerRadius={30} outerRadius={45} strokeWidth={2}>
          <Label content={({ viewBox }) => <PieLabelContent viewBox={viewBox as { cx?: number; cy?: number }} total={total} />} />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
