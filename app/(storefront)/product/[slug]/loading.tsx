import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductLoading() {
  return (
    <Container className="py-10 md:py-14">
      <Skeleton className="h-3 w-48" />
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <Skeleton className="aspect-[4/5] w-full" />
        <div className="flex max-w-xl flex-col gap-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="mt-4 h-24 w-full" />
          <Skeleton className="mt-4 h-10 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </Container>
  );
}
