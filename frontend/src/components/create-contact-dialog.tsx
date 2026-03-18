"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { readClientOptions, createClientContactMutation } from "@/client/@tanstack/react-query.gen";
import type { ClientContactCreate } from "@/client/types.gen";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  role_title: z.string().optional(),
});

interface CreateContactDialogProps {
  clientId: number;
}

function ContactFormFields({ form }: { form: ReturnType<typeof useForm<z.infer<typeof formSchema>>> }) {
  return (
    <>
      <FormField control={form.control} name="name" render={({ field }) => (
        <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="email" render={({ field }) => (
        <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="john@example.com" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="phone" render={({ field }) => (
        <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="+1 234 567 890" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={form.control} name="role_title" render={({ field }) => (
        <FormItem><FormLabel>Role / Title</FormLabel><FormControl><Input placeholder="Project Manager" {...field} /></FormControl><FormMessage /></FormItem>
      )} />
    </>
  );
}

export function CreateContactDialog({ clientId }: CreateContactDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", phone: "", role_title: "" },
  });

  const { mutate: createContact, isPending } = useMutation({
    ...createClientContactMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: readClientOptions({ path: { client_id: clientId } }).queryKey });
      setOpen(false);
      form.reset();
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const contactData: ClientContactCreate = { name: values.name, email: values.email || null, phone: values.phone || null, role_title: values.role_title || null };
    createContact({ path: { client_id: clientId }, body: contactData });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" size="sm">Add Contact</Button></DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader><DialogTitle>Add Contact</DialogTitle><DialogDescription>Add a new contact person for this client.</DialogDescription></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ContactFormFields form={form} />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Contact</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
