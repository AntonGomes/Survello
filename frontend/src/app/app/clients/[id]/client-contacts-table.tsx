"use client"

import { Mail, Phone, Star, MoreHorizontal, Trash2, UserCheck, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CreateContactDialog } from "@/components/create-contact-dialog"

interface Contact {
  id: number
  name: string
  email?: string | null
  phone?: string | null
  role_title?: string | null
}

interface ContactsTableProps {
  clientId: number
  contacts: Contact[] | undefined
  keyContactId: number | null | undefined
  resolvedKeyContactId: number | null | undefined
  onSetKeyContact: (contactId: number) => void
  onDeleteContact: (contactId: number) => void
}

export function ContactsTable({ clientId, contacts, keyContactId, resolvedKeyContactId, onSetKeyContact, onDeleteContact }: ContactsTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5 text-muted-foreground" />Contacts</CardTitle>
            <CardDescription>Manage contacts for this client. Set a key contact for quick communication.</CardDescription>
          </div>
          <CreateContactDialog clientId={clientId} />
        </div>
      </CardHeader>
      <CardContent>
        {contacts && contacts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"><TooltipProvider><Tooltip><TooltipTrigger><Star className="h-4 w-4" /></TooltipTrigger><TooltipContent>Key Contact</TooltipContent></Tooltip></TooltipProvider></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map(contact => (
                <ContactRow key={contact.id} contact={contact} isKeyContact={keyContactId === contact.id || (!keyContactId && contact.id === resolvedKeyContactId)} onSetKeyContact={onSetKeyContact} onDeleteContact={onDeleteContact} />
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground bg-muted/20">
            No contacts listed for this client. Add your first contact to get started.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ContactRow({ contact, isKeyContact, onSetKeyContact, onDeleteContact }: {
  contact: Contact; isKeyContact: boolean; onSetKeyContact: (id: number) => void; onDeleteContact: (id: number) => void
}) {
  return (
    <TableRow>
      <TableCell><Checkbox checked={isKeyContact} onCheckedChange={() => onSetKeyContact(contact.id)} /></TableCell>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {contact.name}
          {isKeyContact && <Badge variant="secondary" className="text-[10px] px-1.5 py-0"><Star className="h-2.5 w-2.5 mr-0.5" />Key</Badge>}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{contact.role_title || "\u2014"}</TableCell>
      <TableCell>
        {contact.email ? <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-primary hover:underline"><Mail className="h-3.5 w-3.5" />{contact.email}</a> : <span className="text-muted-foreground">{"\u2014"}</span>}
      </TableCell>
      <TableCell>
        {contact.phone ? <div className="flex items-center gap-1.5 text-muted-foreground"><Phone className="h-3.5 w-3.5" />{contact.phone}</div> : <span className="text-muted-foreground">{"\u2014"}</span>}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSetKeyContact(contact.id)}><UserCheck className="h-4 w-4 mr-2" />Set as Key Contact</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDeleteContact(contact.id)} className="text-destructive focus:text-destructive"><Trash2 className="h-4 w-4 mr-2" />Remove</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
