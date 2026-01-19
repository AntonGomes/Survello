"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";

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
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import { 
  createJobMutation, 
  readJobsOptions,
  readClientsOptions,
  readClientOptions
} from "@/client/@tanstack/react-query.gen";
import { JobStatus, type JobCreate } from "@/client/types.gen";

const formSchema = z.object({
  name: z.string().min(2, "Job name must be at least 2 characters"),
  client_id: z.string().min(1, "Please select a client"),
  address: z.string().optional(),
  status: z.nativeEnum(JobStatus),
});

interface CreateJobDialogProps {
  initialClientId?: number;
  trigger?: React.ReactNode;
}

export function CreateJobDialog({ initialClientId, trigger }: CreateJobDialogProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: clients, isLoading: isLoadingClients } = useQuery({
    ...readClientsOptions(),
    enabled: !initialClientId, // Only fetch clients if we don't have one pre-selected
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      client_id: initialClientId ? initialClientId.toString() : "",
      address: "",
      status: JobStatus.PLANNED,
    },
  });

  const { mutate: createJob, isPending } = useMutation({
    ...createJobMutation(),
    onSuccess: () => {
      // Invalidate the main jobs list (matching the default params used in JobsPage)
      queryClient.invalidateQueries({ 
        queryKey: readJobsOptions({ 
            query: { limit: 100, offset: 0 } 
        }).queryKey 
      });
      // Also invalidate generic jobs queries to be safe
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
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;

    const jobData: JobCreate = {
      name: values.name,
      client_id: parseInt(values.client_id),
      // org_id: user.org_id ?? null, // JobCreate doesn't seem to have org_id based on grepped output
      // created_by_user_id: user.id, // JobCreate doesn't seem to have created_by_user_id based on grepped output?
      address: values.address || null,
      status: values.status as JobStatus,
    };

    createJob({
      body: jobData,
    });
  }

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Job</DialogTitle>
          <DialogDescription>
            {initialClientId ? "Create a new job for this client." : "Create a new job record."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        ) : clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Status</FormLabel>
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



              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Site Address (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter the site address for this job..." 
                        className="resize-none"
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
                Create Job
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
