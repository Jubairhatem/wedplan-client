import { HeroBanner } from "@/components/home/HeroBanner";
import { FeaturedServices } from "@/components/home/FeaturedServices";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroBanner />
      <FeaturedServices />
    </div>
  );
}
