"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Camera } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import {
  createSurveyMutation,
  readSurveysOptions,
} from "@/client/@tanstack/react-query.gen";
import { type SurveyCreate } from "@/client/types.gen";

const formSchema = z.object({
  date: z.string().min(1, "Please select a date"),
  notes: z.string().optional(),
});

interface CreateSurveyDialogProps {
  jobId: number;
  trigger?: React.ReactNode;
}

export function CreateSurveyDialog({ jobId, trigger }: CreateSurveyDialogProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0], // Default to today
      notes: "",
    },
  });

  const { mutate: createSurvey, isPending } = useMutation({
    ...createSurveyMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: readSurveysOptions({ query: { job_id: jobId } }).queryKey,
      });
      setOpen(false);
      form.reset();
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;

    const surveyData: SurveyCreate = {
      job_id: jobId,
      date: values.date,
      notes: values.notes || null,
      surveyor_id: user.id, // Default to current user as surveyor
    };

    createSurvey({
      body: surveyData,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Camera className="mr-2 h-4 w-4" />
            Add Survey
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Survey</DialogTitle>
          <DialogDescription>
            Record a site survey visit for this job.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Survey Date</FormLabel>
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
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any observations or notes from the survey..."
                      className="resize-none"
                      rows={4}
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
                Add Survey
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
