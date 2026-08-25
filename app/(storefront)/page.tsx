import { getActiveHomepageSlides } from "@/lib/data/homepage-slides";
import { getActiveCategories } from "@/lib/data/categories";
import { getBestsellers, getNewArrivals } from "@/lib/data/products";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryDiscovery } from "@/components/home/CategoryDiscovery";
import { ProductRail } from "@/components/home/ProductRail";
import { FeaturedEditorial } from "@/components/home/FeaturedEditorial";
import { BrandStory } from "@/components/home/BrandStory";
import { EmptyState } from "@/components/ui/EmptyState";
import { Container } from "@/components/ui/Container";

export default async function HomePage() {
  const [desktopSlides, mobileSlides, categories, bestsellers, newArrivals] = await Promise.all([
    getActiveHomepageSlides("desktop"),
    getActiveHomepageSlides("mobile"),
    getActiveCategories(),
    getBestsellers(),
    getNewArrivals(),
  ]);

  return (
    <div>
      {desktopSlides.length > 0 || mobileSlides.length > 0 ? (
        <>
          {/* Two independent hero sets — not a responsive crop of one
              set of slides. Each has its own images/copy/order, so a
              mobile visitor and a desktop visitor may see different
              content entirely, per the admin's curation. */}
          <div className="hidden md:block">
            <HeroCarousel slides={desktopSlides} />
          </div>
          <div className="md:hidden">
            <HeroCarousel slides={mobileSlides} />
          </div>
        </>
      ) : (
        <Container className="py-16">
          <EmptyState
            title="Welcome to PAEGE"
            description="Homepage imagery hasn't been configured yet — add slides from the admin panel to feature them here."
          />
        </Container>
      )}

      <CategoryDiscovery categories={categories} />
      <ProductRail title="Bestsellers" viewAllHref="/shop?filter=bestsellers" products={bestsellers} />
      <ProductRail title="New Arrivals" viewAllHref="/shop?filter=new-arrivals" products={newArrivals} />
      <FeaturedEditorial />
      <BrandStory />
    </div>
  );
}
