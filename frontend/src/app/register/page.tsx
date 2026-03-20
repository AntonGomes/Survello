"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowRight, UserPlus, X } from "lucide-react"
import { extractErrorMessage } from "@/lib/utils"

import { RegisterSidebar } from "./register-sidebar"

function useRegisterForm() {
  const { register } = useAuth()
  const [name, setName] = useState("")
  const [orgName, setOrgName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [wantsToInvite, setWantsToInvite] = useState(false)
  const [inviteEmails, setInviteEmails] = useState<string[]>([""])

  const updateInviteEmail = (index: number, value: string) => { const updated = [...inviteEmails]; updated[index] = value; setInviteEmails(updated) }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true)
    try { await register({ name, email, password, org_name: orgName, inviteEmails: wantsToInvite ? inviteEmails.filter(em => em.trim()) : [] }) }
    catch (err: unknown) { setError(extractErrorMessage(err, "Failed to register")) }
    finally { setLoading(false) }
  }

  return { name, setName, orgName, setOrgName, email, setEmail, password, setPassword, error, loading, wantsToInvite, setWantsToInvite, inviteEmails, setInviteEmails, updateInviteEmail, handleSubmit }
}

export default function RegisterPage() {
  const f = useRegisterForm()
  const MIN_PW_LENGTH = 8

  return (
    <div className="min-h-screen flex">
      <RegisterSidebar />
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="flex justify-between items-center p-6">
          <Link href="/" className="text-2xl font-tiempos italic text-primary font-medium lg:hidden">Survello</Link>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition ml-auto">Sign in</Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-foreground">Create an account</h2>
              <p className="text-muted-foreground">Get started with Survello today</p>
            </div>
            <form onSubmit={f.handleSubmit} className="space-y-4">
              {f.error && <Alert variant="destructive"><AlertDescription>{f.error}</AlertDescription></Alert>}
              <FormInput id="name" label="Full Name" type="text" placeholder="John Smith" value={f.name} onChange={f.setName} />
              <FormInput id="orgName" label="Organisation Name" type="text" placeholder="Smith Surveyors Ltd" value={f.orgName} onChange={f.setOrgName} />
              <FormInput id="email" label="Email" type="email" placeholder="name@example.com" value={f.email} onChange={f.setEmail} />
              <FormInput id="password" label="Password" type="password" value={f.password} onChange={f.setPassword} minLength={MIN_PW_LENGTH} />
              <InviteSection wantsToInvite={f.wantsToInvite} setWantsToInvite={f.setWantsToInvite} inviteEmails={f.inviteEmails} setInviteEmails={f.setInviteEmails} updateInviteEmail={f.updateInviteEmail} />
              <Button type="submit" className="w-full h-11" disabled={f.loading}>{f.loading ? "Creating account..." : "Create Account"}<ArrowRight className="ml-2 h-4 w-4" /></Button>
            </form>
            <div className="text-sm text-center text-muted-foreground">Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FormInput({ id, label, type, placeholder, value, onChange, minLength }: {
  id: string; label: string; type: string; placeholder?: string; value: string; onChange: (v: string) => void; minLength?: number
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={id}>{label}</label>
      <Input id={id} type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} required minLength={minLength} className="h-11" />
    </div>
  )
}

function InviteSection({ wantsToInvite, setWantsToInvite, inviteEmails, setInviteEmails, updateInviteEmail }: {
  wantsToInvite: boolean; setWantsToInvite: (v: boolean) => void; inviteEmails: string[]; setInviteEmails: (v: string[]) => void; updateInviteEmail: (i: number, v: string) => void
}) {
  return (
    <div className="pt-4 border-t">
      <div className="flex items-start space-x-3">
        <Checkbox id="invite-team" checked={wantsToInvite} onCheckedChange={(checked) => setWantsToInvite(checked === true)} />
        <div className="grid gap-1.5 leading-none">
          <Label htmlFor="invite-team" className="text-sm font-medium leading-none cursor-pointer">Invite team members</Label>
          <p className="text-xs text-muted-foreground">Send invitations to your team after signing up</p>
        </div>
      </div>
      {wantsToInvite && (
        <div className="mt-4 space-y-3">
          {inviteEmails.map((inviteEmail, index) => (
            <div key={index} className="flex gap-2">
              <Input type="email" placeholder="colleague@example.com" value={inviteEmail} onChange={(e) => updateInviteEmail(index, e.target.value)} className="h-10" />
              {inviteEmails.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => setInviteEmails(inviteEmails.filter((_, i) => i !== index))}><X className="h-4 w-4" /></Button>}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setInviteEmails([...inviteEmails, ""])} className="w-full"><UserPlus className="h-4 w-4 mr-2" />Add another</Button>
        </div>
      )}
    </div>
  )
}
