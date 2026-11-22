import { HeroBanner } from "@/components/home/HeroBanner";
import { FeaturedServices } from "@/components/home/FeaturedServices";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroBanner />
      <FeaturedServices />
      <CategoriesSection />
      <WhyChooseUs />
    </div>
  );
}
