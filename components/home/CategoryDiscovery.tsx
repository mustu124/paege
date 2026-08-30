import Link from "next/link";

import type { Category } from "@/lib/data/categories";
import { getStorageUrl } from "@/lib/storage";
import { Container } from "@/components/ui/Container";
import { SiteImage } from "@/components/ui/SiteImage";

export function CategoryDiscovery({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="mb-8">
          <h2 className="font-serif text-3xl italic text-charcoal-900 md:text-4xl">The Edit</h2>
          <p className="mt-2 font-sans text-sm text-charcoal-500">Shop Collection</p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/shop?category=${category.slug}`} className="group block">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream-100">
                <SiteImage
                  src={getStorageUrl("category-images", category.image_storage_path)}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-[1.03]"
                />
              </div>
              <p className="mt-3 text-center font-sans text-xs uppercase tracking-wider text-charcoal-900">
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
