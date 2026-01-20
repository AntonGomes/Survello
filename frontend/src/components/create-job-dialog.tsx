"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Check, X } from "lucide-react";

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
  SelectSeparator,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { InlineCreateClient } from "@/components/inline-create-client";
import { 
  createJobMutation, 
  createProjectMutation,
  createProjectTypeMutation,
  readJobsOptions,
  readClientsOptions,
  readClientOptions,
  readProjectTypesOptions,
} from "@/client/@tanstack/react-query.gen";
import { JobStatus, ProjectStatus, FeeType, type JobCreate, type ProjectCreate } from "@/client/types.gen";

const formSchema = z.object({
  // Job fields
  name: z.string().min(2, "Job name must be at least 2 characters"),
  client_id: z.string().min(1, "Please select a client"),
  address: z.string().optional(),
  status: z.nativeEnum(JobStatus),
  // Project fields
  project_name: z.string().min(2, "Project name must be at least 2 characters"),
  project_type_id: z.string().min(1, "Please select a project type"),
  fee_type: z.nativeEnum(FeeType),
  rate: z.number().min(0).optional(),
});

interface CreateJobDialogProps {
  initialClientId?: number;
  trigger?: React.ReactNode;
}

export function CreateJobDialog({ initialClientId, trigger }: CreateJobDialogProps) {
  const [open, setOpen] = useState(false);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [isCreatingType, setIsCreatingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: clients, isLoading: isLoadingClients } = useQuery({
    ...readClientsOptions(),
    enabled: !initialClientId,
  });

  const { data: projectTypes, isLoading: isLoadingTypes } = useQuery({
    ...readProjectTypesOptions(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      client_id: initialClientId ? initialClientId.toString() : "",
      address: "",
      status: JobStatus.PLANNED,
      project_name: "",
      project_type_id: "",
      fee_type: FeeType.FIXED,
      rate: 0,
    },
  });

  const { mutateAsync: createJob, isPending: isCreatingJob } = useMutation({
    ...createJobMutation(),
  });

  const { mutateAsync: createProject, isPending: isCreatingProject } = useMutation({
    ...createProjectMutation(),
  });

  const { mutate: createType, isPending: isCreatingTypePending } = useMutation({
    ...createProjectTypeMutation(),
    onSuccess: (newType) => {
      queryClient.invalidateQueries({ queryKey: readProjectTypesOptions().queryKey });
      form.setValue("project_type_id", newType.id.toString());
      setIsCreatingType(false);
      setNewTypeName("");
    },
  });

  const isPending = isCreatingJob || isCreatingProject;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;

    try {
      // First create the job
      const jobData: JobCreate = {
        name: values.name,
        client_id: parseInt(values.client_id),
        address: values.address || null,
        status: values.status as JobStatus,
      };

      const newJob = await createJob({ body: jobData });

      // Then create the project
      const projectData: ProjectCreate = {
        name: values.project_name,
        description: "",
        job_id: newJob.id,
        project_type_id: parseInt(values.project_type_id),
        fee_type: values.fee_type,
        status: ProjectStatus.PLANNED,
        rate: values.rate,
        contingency_percentage: 0,
        forecasted_billable_hours: 0,
      };

      await createProject({ body: projectData });

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
        rate: 0,
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
              ? "Create a new job with its first project for this client." 
              : "Create a new job with its first project."}
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
                    <FormLabel>Job Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Site Survey - 123 Main St" {...field} />
                    </FormControl>
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
                      <FormLabel>Client</FormLabel>
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
                    <FormLabel>Site Address (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter the site address for this job..." 
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

            {/* Project Details Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">First Project</h4>
              
              <FormField
                control={form.control}
                name="project_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
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
                  name="project_type_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type</FormLabel>
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
                              // Auto-fill defaults from selected type
                              const type = projectTypes?.find(t => t.id.toString() === val);
                              if (type) {
                                if (type.default_fee_type) form.setValue("fee_type", type.default_fee_type);
                                if (type.rate) form.setValue("rate", type.rate);
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
                                {projectTypes?.map((type) => (
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
              </div>

              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate / Fee Amount (£)</FormLabel>
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
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Job & Project
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
