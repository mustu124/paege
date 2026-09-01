import { getActiveHomepageSlides } from "@/lib/data/homepage-slides";
import { getActiveCategories } from "@/lib/data/categories";
import { getBestsellers, getNewArrivals } from "@/lib/data/products";
import { getSiteImages } from "@/lib/data/site-images";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryDiscovery } from "@/components/home/CategoryDiscovery";
import { ProductRail } from "@/components/home/ProductRail";
import { PaegeStatement } from "@/components/home/PaegeStatement";
import { FeaturedEditorial } from "@/components/home/FeaturedEditorial";
import { ClosingStatement } from "@/components/home/ClosingStatement";
import { EmptyState } from "@/components/ui/EmptyState";
import { Container } from "@/components/ui/Container";

export default async function HomePage() {
  const [desktopSlides, mobileSlides, categories, bestsellers, newArrivals, siteImages] = await Promise.all([
    getActiveHomepageSlides("desktop"),
    getActiveHomepageSlides("mobile"),
    getActiveCategories(),
    getBestsellers(),
    getNewArrivals(),
    getSiteImages(),
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

      {/* Section order follows the brand refresh: The New Edit, then
          The Paege Favourites, then The Edit (categories), then the
          standalone PAEGE / Part of You moment — the Slow Fashion
          banner keeps its prior relative position after that ("Our
          Approach" / "Less, but better" was removed per feedback),
          ending on the full-width closing statement right before the
          footer. */}
      <ProductRail
        title="The New Edit"
        subtitle="Pieces you'll want to keep."
        viewAllHref="/shop?filter=new-arrivals"
        products={newArrivals}
      />
      <ProductRail
        title="The Paege Favourites"
        subtitle="The ones everyone's coming back to."
        viewAllHref="/shop?filter=bestsellers"
        products={bestsellers}
      />
      <CategoryDiscovery categories={categories} />
      <PaegeStatement />
      <FeaturedEditorial image={siteImages.featured_editorial} />
      <ClosingStatement />
    </div>
  );
}
