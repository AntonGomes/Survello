"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Calculator, Clock, DollarSign, Save, Play } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

import { updateProjectMutation, startTimerMutation, readProjectOptions, getCurrentTimerOptions } from "@/client/@tanstack/react-query.gen"
import { FeeType, type ProjectRead } from "@/client/types.gen"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ProjectBillingCardProps {
  project: ProjectRead
}

export function ProjectBillingCard({ project }: ProjectBillingCardProps) {
  const queryClient = useQueryClient()
  
  // Local state for immediate feedback
  const [actualHours, setActualHours] = useState(project.actual_hours || 0)
  const [settlementAmount, setSettlementAmount] = useState(project.final_settlement_amount || 0)
  const [hasChanges, setHasChanges] = useState(false)
  const [showTimerAlert, setShowTimerAlert] = useState(false)

  const { mutate: updateProject, isPending: isSaving } = useMutation({
    ...updateProjectMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: readProjectOptions({ path: { project_id: project.id } }).queryKey
      })
      // toast.success("Billing information updated")
      setHasChanges(false)
    },
    onError: () => {
        // toast.error("Failed to update billing information")
    }
  })

  const { mutate: startTimer, isPending: isStartingTimer } = useMutation({
    ...startTimerMutation(),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getCurrentTimerOptions().queryKey })
        setShowTimerAlert(false)
        // toast.success("Timer started")
    },
    onError: (err) => {
        // toast.error("Failed to start timer: " + err.message)
    }
  })

  const handleSave = () => {
    updateProject({
        path: { project_id: project.id },
        body: {
            actual_hours: actualHours,
            final_settlement_amount: settlementAmount
        }
    })
  }

  const isHourly = project.fee_type === FeeType.HOURLY || project.fee_type === FeeType.MIXED
  const isContingency = (project.contingency_percentage ?? 0) > 0 || project.fee_type === FeeType.MIXED
  
  // Calculations
  const hourlyTotal = (actualHours || 0) * (project.rate || 0)
  const contingencyTotal = ((settlementAmount || 0) * (project.contingency_percentage || 0)) / 100
  const totalFee = (isHourly ? hourlyTotal : 0) + (isContingency ? contingencyTotal : 0) + (project.fee_type === FeeType.FIXED ? (project.rate || 0) : 0)

  return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Billing & Fees
                </CardTitle>
                <CardDescription>Manage hours and project fees.</CardDescription>
            </div>
            <Badge variant="secondary" className="uppercase">{project.fee_type}</Badge>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
            
            {/* HOURLY SECTION */}
            {isHourly && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Hourly Tracking
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 gap-2 border-red-200 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setShowTimerAlert(true)}
                        >
                            <Play className="h-3 w-3 fill-red-500 text-red-500" />
                            Record Hours
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Hours Worked</Label>
                            <Input 
                                type="number" 
                                min="0" 
                                step="0.25"
                                value={actualHours}
                                onChange={(e) => {
                                    setActualHours(parseFloat(e.target.value) || 0)
                                    setHasChanges(true)
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Rate</Label>
                            <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50">
                                ${project.rate}/hr
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center bg-muted/50 p-3 rounded-md">
                        <span className="text-sm">Hourly Total:</span>
                        <span className="font-bold font-mono">${hourlyTotal.toFixed(2)}</span>
                    </div>
                </div>
            )}

            {isHourly && isContingency && <Separator />}

            {/* CONTINGENCY SECTION */}
            {isContingency && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Calculator className="h-4 w-4" />
                        Contingency Calculation
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Settlement Amount</Label>
                            <Input 
                                type="number" 
                                min="0" 
                                step="100"
                                value={settlementAmount}
                                onChange={(e) => {
                                    setSettlementAmount(parseFloat(e.target.value) || 0)
                                    setHasChanges(true)
                                }}
                                prefix="$"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Percentage</Label>
                            <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50">
                                {project.contingency_percentage}%
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center bg-muted/50 p-3 rounded-md">
                        <span className="text-sm">Contingency Fee:</span>
                        <span className="font-bold font-mono">${contingencyTotal.toFixed(2)}</span>
                    </div>
                </div>
            )}

            {/* FIXED SECTION (Fallback) */}
            {project.fee_type === FeeType.FIXED && !isContingency && (
                <div className="flex justify-between items-center bg-muted/50 p-3 rounded-md">
                    <span className="text-sm">Fixed Fee:</span>
                    <span className="font-bold font-mono">${project.rate?.toFixed(2)}</span>
                </div>
            )}

            {/* GRAND TOTAL */}
            <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <span className="font-bold text-lg">Total Fee</span>
                        {hasChanges && (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600 bg-yellow-50">
                                Unsaved Changes
                            </Badge>
                        )}
                    </div>
                    <span className="font-bold text-2xl text-primary">${totalFee.toFixed(2)}</span>
                </div>
            </div>

            {hasChanges && (
                <Button onClick={handleSave} disabled={isSaving} className="w-full">
                    {isSaving ? "Saving..." : "Save Billing Updates"}
                    <Save className="ml-2 h-4 w-4" />
                </Button>
            )}

            <AlertDialog open={showTimerAlert} onOpenChange={setShowTimerAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Start Recording Time?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will start a timer for <strong>{project.name}</strong>. 
                            Any other active timer will be stopped.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault()
                                startTimer({ body: { project_id: project.id } })
                            }}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {isStartingTimer ? "Starting..." : "Start Timer"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardContent>
    </Card>
  )
}
