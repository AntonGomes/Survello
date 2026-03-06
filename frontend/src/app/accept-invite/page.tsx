"use client";

const REDIRECT_DELAY_MS = 2000;
const MIN_PASSWORD_LENGTH = 8;

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { verifyInvitationOptions, acceptInvitationMutation } from "@/client/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, Building2 } from "lucide-react";

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-primary">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {children}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InvalidTokenView() {
  return (
    <CenteredCard>
      <XCircle className="h-12 w-12 text-destructive" />
      <div>
        <h2 className="text-lg font-semibold">Invalid Invitation Link</h2>
        <p className="text-muted-foreground mt-2">This invitation link is invalid. Please check your email for the correct link.</p>
      </div>
      <Link href="/login"><Button variant="outline">Go to Login</Button></Link>
    </CenteredCard>
  );
}

function VerifyingView() {
  return (
    <CenteredCard>
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-muted-foreground">Verifying invitation...</p>
    </CenteredCard>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <CenteredCard>
      <XCircle className="h-12 w-12 text-destructive" />
      <div>
        <h2 className="text-lg font-semibold">Invitation Invalid</h2>
        <p className="text-muted-foreground mt-2">{message}</p>
      </div>
      <Link href="/login"><Button variant="outline">Go to Login</Button></Link>
    </CenteredCard>
  );
}

function SuccessView() {
  return (
    <CenteredCard>
      <CheckCircle2 className="h-12 w-12 text-green-500" />
      <div>
        <h2 className="text-lg font-semibold">Account Created!</h2>
        <p className="text-muted-foreground mt-2">Redirecting you to login...</p>
      </div>
    </CenteredCard>
  );
}

function useAcceptInvite(token: string | null) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const verification = useQuery({
    ...verifyInvitationOptions({ path: { token: token || "" } }),
    enabled: !!token,
    retry: false,
  });

  const { mutate: acceptInvite, isPending } = useMutation({
    ...acceptInvitationMutation(),
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => router.push("/login"), REDIRECT_DELAY_MS);
    },
    onError: () => setError("Failed to create account"),
  });

  return { error, setError, success, verification, acceptInvite, isPending };
}

function InviteFormHeader({ invitation }: { invitation: { org_name?: string; invited_by_name?: string } | undefined }) {
  return (
    <CardHeader>
      <div className="flex justify-center mb-6"><Link href="/" className="text-3xl font-tiempos italic text-primary font-medium">Survello</Link></div>
      <div className="flex items-center justify-center gap-2 p-3 bg-muted rounded-lg mb-4"><Building2 className="h-5 w-5 text-muted-foreground" /><span className="font-medium">{invitation?.org_name}</span></div>
      <CardTitle>Join {invitation?.org_name}</CardTitle>
      <CardDescription><span className="font-medium">{invitation?.invited_by_name}</span> has invited you to join their organisation. Create your account to get started.</CardDescription>
    </CardHeader>
  );
}

function AcceptInviteForm({ invitation, token, error, setError, acceptInvite, isPending }: {
  invitation: { org_name?: string; invited_by_name?: string; email?: string } | undefined
  token: string; error: string; setError: (v: string) => void
  acceptInvite: (args: { body: { token: string; name: string; password: string } }) => void; isPending: boolean
}) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < MIN_PASSWORD_LENGTH) { setError("Password must be at least 8 characters"); return; }
    acceptInvite({ body: { token, name, password } });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary">
      <Card className="w-full max-w-md">
        <InviteFormHeader invitation={invitation} />
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            <FormInput id="email" label="Email" type="email" value={invitation?.email || ""} disabled />
            <FormInput id="name" label="Full Name" type="text" placeholder="John Doe" value={name} onChange={setName} />
            <FormInput id="password" label="Password" type="password" placeholder="At least 8 characters" value={password} onChange={setPassword} minLength={MIN_PASSWORD_LENGTH} />
            <FormInput id="confirmPassword" label="Confirm Password" type="password" placeholder="Confirm your password" value={confirmPassword} onChange={setConfirmPassword} />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isPending}>{isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>) : "Create Account & Join"}</Button>
            <div className="text-sm text-center text-gray-500">Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link></div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function FormInput({ id, label, type, placeholder, value, onChange, minLength, disabled }: {
  id: string; label: string; type: string; placeholder?: string; value: string; onChange?: (v: string) => void; minLength?: number; disabled?: boolean
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={id}>{label}</label>
      <Input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined} required={!disabled} minLength={minLength} disabled={disabled} className={disabled ? "bg-muted" : undefined} />
      {disabled && <p className="text-xs text-muted-foreground">This is the email address your invitation was sent to</p>}
    </div>
  );
}

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { error, setError, success, verification, acceptInvite, isPending } = useAcceptInvite(token);

  if (!token) return <InvalidTokenView />;
  if (verification.isLoading) return <VerifyingView />;
  if (verification.isError) {
    const msg = (verification.error as { message?: string })?.message || "This invitation is invalid or has expired.";
    return <ErrorView message={msg} />;
  }
  if (success) return <SuccessView />;

  return <AcceptInviteForm invitation={verification.data} token={token} error={error} setError={setError} acceptInvite={acceptInvite} isPending={isPending} />;
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-primary"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <AcceptInviteContent />
    </Suspense>
  );
}
