import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CheckoutLoading() {
  return (
    <Container className="py-10 md:py-14">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mb-10 mt-4 h-9 w-48" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    </Container>
  );
}
