"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"
import { getPayloadConfigFromPayload, useChart, type ChartConfig } from "./chart-utils"

export const ChartTooltip = RechartsPrimitive.Tooltip

export interface TooltipPayloadItem {
  dataKey?: string | number
  name?: string | number
  value?: number | string
  color?: string
  payload?: Record<string, unknown>
  fill?: string
}

interface ChartTooltipContentProps extends React.ComponentProps<"div"> {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "line" | "dot" | "dashed"
  nameKey?: string
  labelKey?: string
  labelFormatter?: (label: string, payload: TooltipPayloadItem[]) => React.ReactNode
  formatter?: (value: string | number, name: string | number, item: TooltipPayloadItem, index: number, payload: Record<string, unknown>) => React.ReactNode
  labelClassName?: string
  color?: string
}

function useTooltipLabel({ hideLabel, payload, labelKey, label, labelFormatter, labelClassName, config }: {
  hideLabel: boolean
  payload?: TooltipPayloadItem[]
  labelKey?: string
  label?: string
  labelFormatter?: (label: string, payload: TooltipPayloadItem[]) => React.ReactNode
  labelClassName?: string
  config: ChartConfig
}) {
  return React.useMemo(() => {
    if (hideLabel || !payload?.length) return null
    const item = payload[0]
    if (!item) return null
    const key = `${labelKey || item.dataKey || item.name || "value"}`
    const itemConfig = getPayloadConfigFromPayload({ config, payload: item, key })
    const value = !labelKey && typeof label === "string"
      ? config[label as keyof typeof config]?.label || label
      : itemConfig?.label
    if (labelFormatter && label) {
      return <div className={cn("font-medium", labelClassName)}>{labelFormatter(label, payload)}</div>
    }
    if (!value) return null
    return <div className={cn("font-medium", labelClassName)}>{value}</div>
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey])
}

function TooltipIndicator({ indicator, indicatorColor, nestLabel }: {
  indicator: "line" | "dot" | "dashed"
  indicatorColor: string | undefined
  nestLabel: boolean
}) {
  return (
    <div
      className={cn(
        "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
        {
          "h-2.5 w-2.5": indicator === "dot",
          "w-1": indicator === "line",
          "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
          "my-0.5": nestLabel && indicator === "dashed",
        }
      )}
      style={{ "--color-bg": indicatorColor, "--color-border": indicatorColor } as React.CSSProperties}
    />
  )
}

function TooltipItemRow({ item, index, config, nameKey, color, indicator, nestLabel, hideIndicator, formatter, tooltipLabel }: {
  item: TooltipPayloadItem
  index: number
  config: ChartConfig
  nameKey?: string
  color?: string
  indicator: "line" | "dot" | "dashed"
  nestLabel: boolean
  hideIndicator: boolean
  formatter?: ChartTooltipContentProps["formatter"]
  tooltipLabel: React.ReactNode
}) {
  const key = `${nameKey || item.name || item.dataKey || "value"}`
  const itemConfig = getPayloadConfigFromPayload({ config, payload: item, key })
  const indicatorColor = color || (item.payload as Record<string, unknown>)?.fill as string || item.color
  return (
    <div
      key={String(item.dataKey)}
      className={cn(
        "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
        indicator === "dot" && "items-center"
      )}
    >
      {formatter && item?.value !== undefined && item.name ? (
        formatter(item.value, item.name, item, index, item.payload || {})
      ) : (
        <>
          {itemConfig?.icon ? (
            <itemConfig.icon />
          ) : (
            !hideIndicator && <TooltipIndicator indicator={indicator} indicatorColor={indicatorColor} nestLabel={nestLabel} />
          )}
          <div className={cn("flex flex-1 justify-between leading-none", nestLabel ? "items-end" : "items-center")}>
            <div className="grid gap-1.5">
              {nestLabel ? tooltipLabel : null}
              <span className="text-muted-foreground">{itemConfig?.label || item.name}</span>
            </div>
            {item.value && (
              <span className="font-mono font-medium tabular-nums text-foreground">
                {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  ({ active, payload, className, indicator = "dot", hideLabel = false, hideIndicator = false, label, labelFormatter, labelClassName, formatter, color, nameKey, labelKey }, ref) => {
    const { config } = useChart()
    const tooltipLabel = useTooltipLabel({ hideLabel, payload, labelKey, label, labelFormatter, labelClassName, config })
    if (!active || !payload?.length) return null
    const nestLabel = payload.length === 1 && indicator !== "dot"
    return (
      <div ref={ref} className={cn("grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl", className)}>
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => (
            <TooltipItemRow key={String(item.dataKey)} item={item} index={index} config={config} nameKey={nameKey} color={color} indicator={indicator} nestLabel={nestLabel} hideIndicator={hideIndicator} formatter={formatter} tooltipLabel={tooltipLabel} />
          ))}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltip"
