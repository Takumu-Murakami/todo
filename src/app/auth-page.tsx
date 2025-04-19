"use client";
import { SessionProvider } from "next-auth/react";
import AuthTest from "./auth-test";

export default function AuthPage() {
  return (
    <SessionProvider>
      <AuthTest />
    </SessionProvider>
  );
}
