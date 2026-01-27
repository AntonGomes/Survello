"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, X, Check, CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { 
  createInstructionMutation, 
  createInstructionTypeMutation,
  readInstructionTypesOptions,
  readJobOptions
} from "@/client/@tanstack/react-query.gen";
import { InstructionStatus, FeeType, type InstructionCreate } from "@/client/types.gen";

const formSchema = z.object({
  name: z.string().min(2, "Instruction name must be at least 2 characters"),
  description: z.string().optional().or(z.literal("")),
  instruction_type_id: z.string().min(1, "Please select an instruction type"),
  fee_type: z.nativeEnum(FeeType),
  status: z.nativeEnum(InstructionStatus),
  rate: z.number().min(0).optional(),
  contingency_percentage: z.number().min(0).max(100).optional(),
  deadline: z.date().optional(),
});

interface CreateInstructionDialogProps {
  jobId: number;
  trigger?: React.ReactNode;
}

export function CreateInstructionDialog({ jobId, trigger }: CreateInstructionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isCreatingType, setIsCreatingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  
  const queryClient = useQueryClient();

  const { data: instructionTypes, isLoading: isLoadingTypes } = useQuery({
    ...readInstructionTypesOptions(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      instruction_type_id: "",
      fee_type: FeeType.FIXED,
      status: InstructionStatus.PLANNED,
      rate: 0,
      contingency_percentage: 0,
      deadline: undefined,
    },
  });

  // Watch for instruction type selection to autofill values
  const selectedTypeId = form.watch("instruction_type_id");
  const selectedType = instructionTypes?.find(t => t.id.toString() === selectedTypeId);

  const { mutate: createInstruction, isPending } = useMutation({
    ...createInstructionMutation(),
    onSuccess: () => {
      // Invalidate the job query to refresh the instructions list
      queryClient.invalidateQueries({ 
        queryKey: readJobOptions({ path: { job_id: jobId } }).queryKey 
      });
      setOpen(false);
      form.reset();
    },
  });

  const { mutate: createType, isPending: isCreatingTypePending } = useMutation({
    ...createInstructionTypeMutation(),
    onSuccess: (newType) => {
        queryClient.invalidateQueries({ queryKey: readInstructionTypesOptions().queryKey });
        form.setValue("instruction_type_id", newType.id.toString());
        setIsCreatingType(false);
        setNewTypeName("");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const instructionData: InstructionCreate = {
      name: values.name,
      description: values.description || "",
      job_id: jobId,
      instruction_type_id: parseInt(values.instruction_type_id),
      fee_type: values.fee_type,
      status: values.status,
      rate: values.rate,
      contingency_percentage: values.contingency_percentage,
      forecasted_billable_hours: 0,
      deadline: values.deadline?.toISOString() ?? null,
    };

    createInstruction({
      body: instructionData,
    });
  }

  const handleCreateType = () => {
      if (!newTypeName.trim()) return;
      createType({
        body: {
            name: newTypeName,
            description: null,
            rate: 0
        }
      });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Instruction
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Instruction</DialogTitle>
          <DialogDescription>
            Add a new instruction to this job.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instruction Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Topographical Survey" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="instruction_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instruction Type</FormLabel>
                    {isCreatingType ? (
                        <div className="flex gap-2">
                            <Input 
                                value={newTypeName} 
                                onChange={(e) => setNewTypeName(e.target.value)}
                                placeholder="New Type Name"
                                className="h-10"
                                autoFocus
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter') {
                                        e.preventDefault();
                                        handleCreateType();
                                    }
                                }}
                            />
                            <Button 
                                type="button" 
                                size="icon" 
                                onClick={handleCreateType}
                                disabled={isCreatingTypePending || !newTypeName.trim()}
                            >
                                {isCreatingTypePending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4" />
                                )}
                            </Button>
                            <Button 
                                type="button" 
                                size="icon" 
                                variant="ghost"
                                onClick={() => setIsCreatingType(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <Select 
                            onValueChange={(val) => {
                                if (val === "_new") {
                                    setIsCreatingType(true);
                                } else {
                                    field.onChange(val);
                                    // Auto-fill defaults from selected type
                                    const type = instructionTypes?.find(t => t.id.toString() === val);
                                    if (type) {
                                        if (type.default_fee_type) form.setValue("fee_type", type.default_fee_type);
                                        if (type.rate) form.setValue("rate", type.rate);
                                        if (type.default_contingency_percentage) form.setValue("contingency_percentage", type.default_contingency_percentage);
                                    }
                                }
                            }} 
                            value={field.value}
                        >
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder={isLoadingTypes ? "Loading..." : "Select Type"} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {isLoadingTypes ? (
                            <div className="flex items-center justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                            ) : (
                                <>
                                {instructionTypes?.map((type) => (
                                <SelectItem key={type.id} value={type.id.toString()}>
                                    {type.name}
                                </SelectItem>
                                ))}
                                <SelectSeparator />
                                <SelectItem value="_new" className="text-primary font-medium cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        Create New Type...
                                    </div>
                                </SelectItem>
                                </>
                            )}
                        </SelectContent>
                        </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(InstructionStatus).map((status) => (
                          <SelectItem key={status} value={status} className="capitalize">
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Deadline Field */}
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Deadline (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a deadline date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                      {field.value && (
                        <div className="p-2 border-t">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => field.onChange(undefined)}
                          >
                            Clear deadline
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fee_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Fee Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(FeeType).map((type) => (
                          <SelectItem key={type} value={type} className="capitalize">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rate / Fee Amount</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            placeholder="0.00"
                            {...field} 
                            onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contingency_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contingency %</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="100"
                            step="0.01" 
                            placeholder="0%"
                            {...field} 
                            onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Instruction details and scope..." 
                      className="resize-none min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Instruction
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
