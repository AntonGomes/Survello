"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  return (
    <Button variant="outline" asChild>
      <Link href="/auth/logout">Log out</Link>
    </Button>
  );
}
