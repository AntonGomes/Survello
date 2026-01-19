"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Trash2, FileText } from "lucide-react";

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
  createQuoteMutation,
  readQuotesOptions,
  readClientsOptions,
  readLeadsOptions,
  readProjectTypesOptions,
} from "@/client/@tanstack/react-query.gen";
import { QuoteStatus, type QuoteCreate, type QuoteLineCreate } from "@/client/types.gen";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const quoteLineSchema = z.object({
  project_type_id: z.string().min(1, "Please select a project type"),
  estimated_fee: z.string().optional(),
  notes: z.string().optional(),
});

const formSchema = z.object({
  name: z.string().min(2, "Quote name must be at least 2 characters"),
  client_or_lead: z.string().optional(), // Format: "client:123" or "lead:456"
  estimated_fee: z.string().optional(),
  expected_start_date: z.string().optional(),
  status: z.nativeEnum(QuoteStatus),
  notes: z.string().optional(),
  lines: z.array(quoteLineSchema).optional(),
});

interface CreateQuoteDialogProps {
  initialClientId?: number;
  initialLeadId?: number;
  trigger?: React.ReactNode;
}

export function CreateQuoteDialog({ 
  initialClientId, 
  initialLeadId, 
  trigger 
}: CreateQuoteDialogProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: clients, isLoading: isLoadingClients } = useQuery({
    ...readClientsOptions(),
    enabled: !initialClientId && !initialLeadId,
  });

  const { data: leads, isLoading: isLoadingLeads } = useQuery({
    ...readLeadsOptions(),
    enabled: !initialClientId && !initialLeadId,
  });

  const { data: projectTypes, isLoading: isLoadingProjectTypes } = useQuery({
    ...readProjectTypesOptions(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      client_or_lead: initialClientId 
        ? `client:${initialClientId}` 
        : initialLeadId 
          ? `lead:${initialLeadId}` 
          : "",
      estimated_fee: "",
      expected_start_date: "",
      status: QuoteStatus.DRAFT,
      notes: "",
      lines: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  const { mutate: createQuote, isPending } = useMutation({
    ...createQuoteMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: readQuotesOptions().queryKey,
      });
      setOpen(false);
      form.reset();
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;

    let clientId: number | null = null;
    let leadId: number | null = null;

    if (values.client_or_lead) {
      const parts = values.client_or_lead.split(":");
      const type = parts[0];
      const id = parts[1];
      if (type === "client" && id) {
        clientId = parseInt(id);
      } else if (type === "lead" && id) {
        leadId = parseInt(id);
      }
    }

    // Calculate total estimated fee from lines if not set
    let totalFee: number | null = null;
    if (values.estimated_fee) {
      totalFee = parseFloat(values.estimated_fee);
    } else if (values.lines && values.lines.length > 0) {
      totalFee = values.lines.reduce((sum, line) => {
        const lineFee = line.estimated_fee ? parseFloat(line.estimated_fee) : 0;
        return sum + lineFee;
      }, 0);
      if (totalFee === 0) totalFee = null;
    }

    const quoteLines: QuoteLineCreate[] = (values.lines || []).map(line => ({
      project_type_id: parseInt(line.project_type_id),
      estimated_fee: line.estimated_fee ? parseFloat(line.estimated_fee) : null,
      notes: line.notes || null,
    }));

    const quoteData: QuoteCreate = {
      name: values.name,
      client_id: clientId,
      lead_id: leadId,
      estimated_fee: totalFee,
      expected_start_date: values.expected_start_date || null,
      status: values.status,
      notes: values.notes || null,
      lines: quoteLines.length > 0 ? quoteLines : undefined,
    };

    createQuote({
      body: quoteData,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Create Quote
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Quote</DialogTitle>
          <DialogDescription>
            Create a new quote with potential projects.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Quote Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Schedule of Conditions - 123 High St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!initialClientId && !initialLeadId && (
                <FormField
                  control={form.control}
                  name="client_or_lead"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Client or Lead</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client or lead" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(isLoadingClients || isLoadingLeads) ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : (
                            <>
                              {clients && clients.length > 0 && (
                                <>
                                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                                    Clients
                                  </div>
                                  {clients.map((client) => (
                                    <SelectItem key={`client:${client.id}`} value={`client:${client.id}`}>
                                      {client.name}
                                    </SelectItem>
                                  ))}
                                </>
                              )}
                              {leads && leads.length > 0 && (
                                <>
                                  <Separator className="my-1" />
                                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                                    Leads
                                  </div>
                                  {leads.filter(l => l.status !== "converted" && l.status !== "lost").map((lead) => (
                                    <SelectItem key={`lead:${lead.id}`} value={`lead:${lead.id}`}>
                                      {lead.name}
                                    </SelectItem>
                                  ))}
                                </>
                              )}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="estimated_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Fee (£)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5000" {...field} />
                    </FormControl>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(QuoteStatus).map((status) => (
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
                name="expected_start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Start</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Quote Lines (Potential Projects) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Potential Projects</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ project_type_id: "", estimated_fee: "", notes: "" })}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Project
                </Button>
              </div>

              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No projects added yet. Add potential projects this quote covers.
                </p>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-12 gap-2 p-3 border rounded-lg bg-muted/30"
                    >
                      <FormField
                        control={form.control}
                        name={`lines.${index}.project_type_id`}
                        render={({ field }) => (
                          <FormItem className="col-span-5">
                            <FormLabel className="text-xs">Project Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isLoadingProjectTypes ? (
                                  <div className="flex items-center justify-center p-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  </div>
                                ) : (
                                  projectTypes?.map((pt) => (
                                    <SelectItem key={pt.id} value={pt.id.toString()}>
                                      {pt.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`lines.${index}.estimated_fee`}
                        render={({ field }) => (
                          <FormItem className="col-span-3">
                            <FormLabel className="text-xs">Fee (£)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="1000"
                                className="h-8"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`lines.${index}.notes`}
                        render={({ field }) => (
                          <FormItem className="col-span-3">
                            <FormLabel className="text-xs">Notes</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Notes..."
                                className="h-8"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="col-span-1 flex items-end justify-center pb-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Quote
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
