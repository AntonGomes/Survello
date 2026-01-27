"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowRight, UserPlus, X, FileText, Clock, TrendingUp } from "lucide-react";

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
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12">
        <div>
          <Link href="/" className="text-3xl font-tiempos italic text-white font-medium">
            Survello
          </Link>
        </div>
        
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Surveying, reimagined for efficiency.
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed max-w-md">
              From site notes to signed schedules in minutes. Join surveyors who are reclaiming their time.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-white font-medium">Automated Schedules</p>
                <p className="text-blue-200 text-sm">Generate professional documents instantly</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-white font-medium">Save 122 Hours/Year</p>
                <p className="text-blue-200 text-sm">Focus on billable work, not admin</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-white font-medium">Grow Your Practice</p>
                <p className="text-blue-200 text-sm">Innovative SMEs see 14.8% revenue growth</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-blue-200 text-sm">
          © {new Date().getFullYear()} Survello. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="flex justify-between items-center p-6">
          <Link href="/" className="text-2xl font-tiempos italic text-primary font-medium lg:hidden">
            Survello
          </Link>
          <Link 
            href="/login" 
            className="text-sm text-muted-foreground hover:text-primary transition ml-auto"
          >
            Sign in
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-foreground">Create an account</h2>
              <p className="text-muted-foreground">
                Get started with Survello today
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="name">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="orgName">
                  Organisation Name
                </label>
                <Input
                  id="orgName"
                  type="text"
                  placeholder="Smith Surveyors Ltd"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="password">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-11"
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
                      className="text-sm font-medium leading-none cursor-pointer"
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
                          className="h-10"
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

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
