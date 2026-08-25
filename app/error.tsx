"use client";

import { useEffect } from "react";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-serif text-3xl italic text-charcoal-900">Something went wrong</p>
      <p className="max-w-sm font-sans text-sm text-charcoal-500">
        We couldn&apos;t load this page. Please try again.
      </p>
      <Button onClick={() => reset()} className="mt-2">
        Try Again
      </Button>
    </Container>
  );
}
