"use client";

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

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Verify the invitation token
  const { 
    data: invitation, 
    isLoading: isVerifying, 
    isError: isInvalidToken,
    error: verifyError,
  } = useQuery({
    ...verifyInvitationOptions({ path: { token: token || "" } }),
    enabled: !!token,
    retry: false,
  });

  // Accept invitation mutation
  const { mutate: acceptInvite, isPending: isAccepting } = useMutation({
    ...acceptInvitationMutation(),
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    },
    onError: () => {
      setError("Failed to create account");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!token) return;

    acceptInvite({
      body: {
        token,
        name,
        password,
      },
    });
  };

  // No token provided
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <XCircle className="h-12 w-12 text-destructive" />
              <div>
                <h2 className="text-lg font-semibold">Invalid Invitation Link</h2>
                <p className="text-muted-foreground mt-2">
                  This invitation link is invalid. Please check your email for the correct link.
                </p>
              </div>
              <Link href="/login">
                <Button variant="outline">Go to Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Verifying invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid or expired token
  if (isInvalidToken) {
    const errorMessage = (verifyError as { message?: string })?.message || "This invitation is invalid or has expired.";
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <XCircle className="h-12 w-12 text-destructive" />
              <div>
                <h2 className="text-lg font-semibold">Invitation Invalid</h2>
                <p className="text-muted-foreground mt-2">{errorMessage}</p>
              </div>
              <Link href="/login">
                <Button variant="outline">Go to Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <div>
                <h2 className="text-lg font-semibold">Account Created!</h2>
                <p className="text-muted-foreground mt-2">
                  Redirecting you to login...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Accept invitation form
  return (
    <div className="flex items-center justify-center min-h-screen bg-primary">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-6">
            <Link href="/" className="text-3xl font-tiempos italic text-primary font-medium">
              Survello
            </Link>
          </div>
          
          {/* Organization badge */}
          <div className="flex items-center justify-center gap-2 p-3 bg-muted rounded-lg mb-4">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{invitation?.org_name}</span>
          </div>
          
          <CardTitle>Join {invitation?.org_name}</CardTitle>
          <CardDescription>
            <span className="font-medium">{invitation?.invited_by_name}</span> has invited you to join their organization. 
            Create your account to get started.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Email (read-only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                value={invitation?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                This is the email address your invitation was sent to
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">Full Name</label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="confirmPassword">Confirm Password</label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isAccepting}>
              {isAccepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account & Join"
              )}
            </Button>
            <div className="text-sm text-center text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-primary">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  );
}
