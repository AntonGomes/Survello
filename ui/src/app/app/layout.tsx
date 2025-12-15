import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { auth0 } from "@/lib/auth0";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <AppShell userEmail={session.user?.email}>
      {children}
    </AppShell>
  );
}
