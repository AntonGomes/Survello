"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowRight, UserPlus, X } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Team invites
  const [wantsToInvite, setWantsToInvite] = useState(false);
  const [inviteEmails, setInviteEmails] = useState<string[]>([""]);

  const addInviteEmail = () => {
    setInviteEmails([...inviteEmails, ""]);
  };

  const removeInviteEmail = (index: number) => {
    setInviteEmails(inviteEmails.filter((_, i) => i !== index));
  };

  const updateInviteEmail = (index: number, value: string) => {
    const updated = [...inviteEmails];
    updated[index] = value;
    setInviteEmails(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const validInviteEmails = wantsToInvite 
        ? inviteEmails.filter(e => e.trim()) 
        : [];
      await register({ 
        name, 
        email, 
        password, 
        org_name: orgName,
        inviteEmails: validInviteEmails,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to register");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-6">
             <Link href="/" className="text-3xl font-tiempos italic text-primary font-medium">Survello</Link>
          </div>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Get started with Survello today</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
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
              <label className="text-sm font-medium" htmlFor="orgName">Organization Name</label>
              <Input
                id="orgName"
                type="text"
                placeholder="Acme Inc."
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            {/* Invite Team Option */}
            <div className="pt-4 border-t">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="invite-team"
                  checked={wantsToInvite}
                  onCheckedChange={(checked) => setWantsToInvite(checked === true)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="invite-team"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Invite team members
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Send invitations to your team after signing up
                  </p>
                </div>
              </div>

              {wantsToInvite && (
                <div className="mt-4 space-y-3">
                  {inviteEmails.map((inviteEmail, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="colleague@example.com"
                        value={inviteEmail}
                        onChange={(e) => updateInviteEmail(index, e.target.value)}
                      />
                      {inviteEmails.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeInviteEmail(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addInviteEmail}
                    className="w-full"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add another
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pb-6">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : (
                <>
                  Sign Up
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
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
