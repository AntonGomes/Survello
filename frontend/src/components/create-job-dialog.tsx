"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Check, X, Users } from "lucide-react";

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
  FormDescription,
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
  SelectSeparator,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { useAuth } from "@/context/auth-context";
import { InlineCreateClient } from "@/components/inline-create-client";
import { 
  createJobMutation, 
  createInstructionMutation,
  createInstructionTypeMutation,
  readJobsOptions,
  readClientsOptions,
  readClientOptions,
  readInstructionTypesOptions,
} from "@/client/@tanstack/react-query.gen";
import { JobStatus, InstructionStatus, type JobCreate, type InstructionCreate } from "@/client/types.gen";

const formSchema = z.object({
  // Job fields
  name: z.string().min(2, "Job reference must be at least 2 characters"),
  client_id: z.string().min(1, "Please select a client"),
  is_joint: z.boolean(),
  secondary_client_id: z.string().optional(),
  address: z.string().optional(),
  status: z.nativeEnum(JobStatus),
  // Instruction fields
  instruction_type_id: z.string().min(1, "Please select an instruction type"),
});

interface CreateJobDialogProps {
  initialClientId?: number;
  trigger?: React.ReactNode;
}

export function CreateJobDialog({ initialClientId, trigger }: CreateJobDialogProps) {
  const [open, setOpen] = useState(false);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [isCreatingSecondaryClient, setIsCreatingSecondaryClient] = useState(false);
  const [isCreatingType, setIsCreatingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: clients, isLoading: isLoadingClients } = useQuery({
    ...readClientsOptions(),
    enabled: open, // Always load clients when dialog is open
  });

  const { data: instructionTypes, isLoading: isLoadingTypes } = useQuery({
    ...readInstructionTypesOptions(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      client_id: initialClientId ? initialClientId.toString() : "",
      is_joint: false,
      secondary_client_id: "",
      address: "",
      status: JobStatus.PLANNED,
      instruction_type_id: "",
    },
  });

  const { mutateAsync: createJob, isPending: isCreatingJob } = useMutation({
    ...createJobMutation(),
  });

  const { mutateAsync: createInstruction, isPending: isCreatingInstruction } = useMutation({
    ...createInstructionMutation(),
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

  const isPending = isCreatingJob || isCreatingInstruction;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;

    try {
      // First create the job
      const jobData: JobCreate = {
        name: values.name,
        client_id: parseInt(values.client_id),
        is_joint: values.is_joint,
        secondary_client_id: values.is_joint && values.secondary_client_id 
          ? parseInt(values.secondary_client_id) 
          : null,
        address: values.address || null,
        status: values.status as JobStatus,
      };

      const newJob = await createJob({ body: jobData });

      // Then create the instruction
      const instructionData: InstructionCreate = {
        description: "",
        job_id: newJob.id,
        instruction_type_id: parseInt(values.instruction_type_id),
        status: InstructionStatus.PLANNED,
      };

      await createInstruction({ body: instructionData });

      // Invalidate queries
      queryClient.invalidateQueries({ 
        queryKey: readJobsOptions({ query: { limit: 100, offset: 0 } }).queryKey 
      });
      queryClient.invalidateQueries({ 
        queryKey: readJobsOptions().queryKey 
      });
      
      if (initialClientId) {
        queryClient.invalidateQueries({ 
          queryKey: readClientOptions({ path: { client_id: initialClientId } }).queryKey 
        });
      }

      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to create job with project:", error);
    }
  }

  const handleCreateType = () => {
    if (!newTypeName.trim()) return;
    createType({
      body: {
        name: newTypeName,
        description: null,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Job
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Job</DialogTitle>
          <DialogDescription>
            {initialClientId 
              ? "Create a new job with its first instruction for this client." 
              : "Create a new job with its first instruction. A job number will be automatically assigned."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Job Details Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Job Details</h4>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Job Reference</FormLabel>
                      <InfoTooltip content="A short, descriptive name for this job. Example: 'Smith Residence Survey' or 'Oak Street Development'" />
                    </div>
                    <FormControl>
                      <Input placeholder="e.g. Smith Residence Survey" {...field} />
                    </FormControl>
                    <FormDescription>
                      This helps identify the job. A unique job number will be generated automatically.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {!initialClientId && (
                <FormField
                  control={form.control}
                  name="client_id"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>Instructing Client</FormLabel>
                        <InfoTooltip content="The primary client who is instructing this work. For joint instructions, you can add a secondary client below." />
                      </div>
                      {isCreatingClient ? (
                        <InlineCreateClient
                          onCreated={(clientId) => {
                            field.onChange(clientId.toString());
                            setIsCreatingClient(false);
                          }}
                          onCancel={() => setIsCreatingClient(false)}
                        />
                      ) : (
                        <Select 
                          onValueChange={(val) => {
                            if (val === "_new") {
                              setIsCreatingClient(true);
                            } else {
                              field.onChange(val);
                            }
                          }} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingClients ? (
                              <div className="flex items-center justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : (
                              <>
                                {clients?.map((client) => (
                                  <SelectItem key={client.id} value={client.id.toString()}>
                                    {client.name}
                                  </SelectItem>
                                ))}
                                <SelectSeparator />
                                <SelectItem value="_new" className="text-primary font-medium">
                                  <div className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create New Client...
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
              )}

              {/* Joint Instruction Toggle */}
              <FormField
                control={form.control}
                name="is_joint"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <FormLabel className="text-sm font-medium">Joint Instruction</FormLabel>
                      </div>
                      <FormDescription className="text-xs">
                        Enable if this job involves two clients (e.g., buyer and seller, trustees)
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Secondary Client Selector (shown when is_joint is true) */}
              {form.watch("is_joint") && (
                <FormField
                  control={form.control}
                  name="secondary_client_id"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>Secondary Client</FormLabel>
                        <InfoTooltip content="The second party in a joint instruction, such as a co-owner, buyer, or trustee." />
                      </div>
                      {isCreatingSecondaryClient ? (
                        <InlineCreateClient
                          onCreated={(clientId) => {
                            field.onChange(clientId.toString());
                            setIsCreatingSecondaryClient(false);
                          }}
                          onCancel={() => setIsCreatingSecondaryClient(false)}
                        />
                      ) : (
                        <Select 
                          onValueChange={(val) => {
                            if (val === "_new") {
                              setIsCreatingSecondaryClient(true);
                            } else {
                              field.onChange(val);
                            }
                          }} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select secondary client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingClients ? (
                              <div className="flex items-center justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : (
                              <>
                                {clients?.filter(c => c.id.toString() !== form.watch("client_id")).map((client) => (
                                  <SelectItem key={client.id} value={client.id.toString()}>
                                    {client.name}
                                  </SelectItem>
                                ))}
                                <SelectSeparator />
                                <SelectItem value="_new" className="text-primary font-medium">
                                  <div className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create New Client...
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
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(JobStatus).map((status) => (
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

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Site Address</FormLabel>
                      <InfoTooltip content="The physical address where the survey or work will take place. This can be different from the client's address." />
                    </div>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter the full site address...&#10;e.g. 123 Main Street&#10;London&#10;SW1A 1AA" 
                        className="resize-none"
                        rows={2}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Instruction Details Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">First Instruction</h4>
              
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
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleCreateType();
                            }
                            if (e.key === "Escape") {
                              setIsCreatingType(false);
                              setNewTypeName("");
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
                          onClick={() => {
                            setIsCreatingType(false);
                            setNewTypeName("");
                          }}
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
                              <SelectItem value="_new" className="text-primary font-medium">
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
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Job & Instruction
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
