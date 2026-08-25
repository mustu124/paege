"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { signInAction } from "@/app/(auth)/actions";
import { signInSchema, type SignInInput } from "@/lib/validation/auth.schema";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginForm({ redirectTo, initialError }: { redirectTo?: string; initialError?: string }) {
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(initialError ?? null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema) });

  function onSubmit(values: SignInInput) {
    setFormError(null);
    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("password", values.password);
    if (redirectTo) formData.set("redirectTo", redirectTo);

    startTransition(async () => {
      const result = await signInAction(formData);
      if (result?.error) setFormError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-serif text-3xl italic text-charcoal-900">Sign In</h1>
        <p className="mt-2 font-sans text-sm text-charcoal-500">Welcome back.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        {formError && <p className="font-sans text-xs text-burgundy">{formError}</p>}

        <Button type="submit" size="lg" disabled={pending} className="mt-2">
          {pending ? "Signing In…" : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
