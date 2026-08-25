import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign In" };

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}

const ERROR_MESSAGES: Record<string, string> = {
  not_admin: "That account doesn't have admin access.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect, error } = await searchParams;
  const initialError = error ? (ERROR_MESSAGES[error] ?? "Something went wrong. Please sign in again.") : undefined;
  return <LoginForm redirectTo={redirect} initialError={initialError} />;
}
