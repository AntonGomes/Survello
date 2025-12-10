"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function LoginButton() {
  return (
    <Button asChild>
      <Link href="/auth/login">Log in</Link>
    </Button>
  );
}
