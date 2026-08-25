import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

interface NotFoundContentProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function NotFoundContent({
  title = "404",
  description = "The page you're looking for doesn't exist.",
  actionLabel = "Return Home",
  actionHref = "/",
}: NotFoundContentProps) {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-serif text-5xl italic text-charcoal-900">{title}</p>
      <p className="max-w-sm font-sans text-sm text-charcoal-500">{description}</p>
      <Link href={actionHref}>
        <Button className="mt-2">{actionLabel}</Button>
      </Link>
    </Container>
  );
}
