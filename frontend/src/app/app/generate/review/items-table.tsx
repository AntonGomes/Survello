"use client"

import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableFooter,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import type { DilapsItem, DilapsSection, ReviewAction, UnitType } from "@/hooks/use-dilaps-review"

const UNIT_OPTIONS: UnitType[] = ["Sum", "m", "m\u00B2", "No"]

type ItemsTableProps = {
  section: DilapsSection
  dispatch: React.Dispatch<ReviewAction>
}

function formatCurrency(value: number | null): string {
  if (value === null) return "\u2014"
  return `\u00A3${value.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`
}

function ItemRow({ item, section, dispatch }: { item: DilapsItem; section: DilapsSection; dispatch: React.Dispatch<ReviewAction> }) {
  const updateField = (field: keyof DilapsItem, value: string | number | null) => {
    dispatch({ type: "UPDATE_ITEM", payload: { sectionId: section.id, itemId: item.id, field, value } })
  }

  return (
    <TableRow className="group">
      <TableCell className="font-mono text-muted-foreground w-16">{item.itemNumber}</TableCell>
      <TableCell className="w-24">
        <Input className="h-8 text-xs" value={item.leaseClause} onChange={(e) => updateField("leaseClause", e.target.value)} />
      </TableCell>
      <TableCell className="min-w-48">
        <Textarea className="min-h-8 text-xs resize-none" value={item.wantOfRepair} onChange={(e) => updateField("wantOfRepair", e.target.value)} />
      </TableCell>
      <TableCell className="min-w-48">
        <Textarea className="min-h-8 text-xs resize-none" value={item.remedy} onChange={(e) => updateField("remedy", e.target.value)} />
      </TableCell>
      <TableCell className="w-24">
        <Select value={item.unit} onValueChange={(val) => updateField("unit", val)}>
          <SelectTrigger size="sm" className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
          <SelectContent>{UNIT_OPTIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
        </Select>
      </TableCell>
      <TableCell className="w-20">
        <Input type="number" className="h-8 text-xs" value={item.quantity ?? ""} onChange={(e) => updateField("quantity", e.target.value ? Number(e.target.value) : null)} />
      </TableCell>
      <TableCell className="w-20">
        <Input type="number" className="h-8 text-xs" value={item.rate ?? ""} onChange={(e) => updateField("rate", e.target.value ? Number(e.target.value) : null)} />
      </TableCell>
      <TableCell className="w-24 text-right font-mono text-sm">{formatCurrency(item.cost)}</TableCell>
      <TableCell className="w-10">
        <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100" onClick={() => dispatch({ type: "DELETE_ITEM", sectionId: section.id, itemId: item.id })}>
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </TableCell>
    </TableRow>
  )
}

export function ItemsTable({ section, dispatch }: ItemsTableProps) {
  const sectionTotal = section.items.reduce((sum, item) => sum + (item.cost ?? 0), 0)

  return (
    <div className="space-y-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Item</TableHead>
            <TableHead className="w-24">Clause</TableHead>
            <TableHead className="min-w-48">Want of Repair</TableHead>
            <TableHead className="min-w-48">Remedy</TableHead>
            <TableHead className="w-24">Unit</TableHead>
            <TableHead className="w-20">Q</TableHead>
            <TableHead className="w-20">R</TableHead>
            <TableHead className="w-24 text-right">&pound;</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {section.items.map((item) => (
            <ItemRow key={item.id} item={item} section={section} dispatch={dispatch} />
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={7} className="text-right font-medium">Section Total</TableCell>
            <TableCell className="text-right font-mono font-bold">{formatCurrency(sectionTotal)}</TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
      <Button variant="outline" size="sm" onClick={() => dispatch({ type: "ADD_ITEM", sectionId: section.id })}>
        <Plus className="h-4 w-4 mr-1" />
        Add Item
      </Button>
    </div>
  )
}
