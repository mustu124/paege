import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function OrderLoading() {
  return (
    <Container className="py-10 md:py-14">
      <div className="mx-auto max-w-2xl">
        <Skeleton className="h-9 w-64" />
        <div className="mt-8 flex flex-col gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </Container>
  );
}
