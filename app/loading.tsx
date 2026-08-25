import { Skeleton } from "@/components/ui/Skeleton";
import { Container } from "@/components/ui/Container";

export default function Loading() {
  return (
    <Container className="py-16">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5] w-full" />
        ))}
      </div>
    </Container>
  );
}
