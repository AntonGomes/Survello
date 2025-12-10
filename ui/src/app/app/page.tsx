import { redirect } from "next/navigation";
import { Main } from "@/components/Main";
import { AppShell } from "@/components/AppShell";
import { auth0 } from "@/lib/auth0";

export default async function AppPage() {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <AppShell userEmail={session.user?.email}>
      <Main />
    </AppShell>
  );
}
