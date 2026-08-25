import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";
import { PRODUCT_GRID_CLASSES } from "@/components/shop/ProductGrid";

export default function ShopLoading() {
  return (
    <Container className="py-10 md:py-14">
      <Skeleton className="h-3 w-40" />
      <div className="mt-4 flex items-end justify-between gap-4 border-b border-border pb-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="mt-10 flex gap-10">
        <div className="hidden w-56 shrink-0 flex-col gap-6 lg:flex">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className={`${PRODUCT_GRID_CLASSES} flex-1`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="aspect-[4/5] w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
