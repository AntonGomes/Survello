import Link from "next/link"; 
"use client";

export default function LogoutButton() {
  return (
    <Link
      href="/"
      className="button logout"
    >
      Log Out
    </Link>
  );
}
