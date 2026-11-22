"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ServiceCard, ServiceItem } from "@/components/services/ServiceCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/button";
import { fetchAPI } from "@/lib/api";
import { ArrowRight, Sparkles } from "lucide-react";

// Curated fallback services to guarantee an immaculate UI experience
const fallbackFeatured: ServiceItem[] = [
  {
    _id: "sample-1",
    serviceName: "The Grand Rose Estate & Ballroom",
    category: "Wedding Venues",
    description:
      "A breathless 18th-century French country manor featuring manicured botanical gardens, crystal chandelier ballroom, and sunset terrace.",
    price: 4800,
    location: "Hudson Valley, New York",
    images: [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
    ],
    vendor: {
      name: "Eleanor Vance",
      businessName: "Grand Rose Estates",
      isPremium: true,
    },
  },
  {
    _id: "sample-2",
    serviceName: "Aura Cinematic Wedding Cinema",
    category: "Photography & Videography",
    description:
      "Editorial storytelling, documentary wedding films, drone cinematography and master-grade photo artistry captured with timeless elegance.",
    price: 2900,
    location: "Los Angeles, California",
    images: [
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80",
    ],
    vendor: {
      name: "Marcus Thorne",
      businessName: "Aura Wedding Cinema",
      isPremium: true,
    },
  },
  {
    _id: "sample-3",
    serviceName: "Opulent Petals Floral & Design",
    category: "Decoration & Florist",
    description:
      "Custom cascading floral arches, romantic candlelit tablescapes, and bespoke bridal bouquets handcrafted with imported European blooms.",
    price: 2200,
    location: "Miami, Florida",
    images: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    ],
    vendor: {
      name: "Sofia Rossi",
      businessName: "Opulent Petals Co.",
      isPremium: false,
    },
  },
  {
    _id: "sample-4",
    serviceName: "Le Ciel Gourmet Artisanal Catering",
    category: "Catering Services",
    description:
      "Five-star culinary journeys with seasonal farm-to-table tasting menus, sommelier wine pairings, and hand-sculpted artisanal wedding cakes.",
    price: 3600,
    location: "Chicago, Illinois",
    images: [
      "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
    ],
    vendor: {
      name: "Chef Julian Laurent",
      businessName: "Le Ciel Catering",
      isPremium: true,
    },
  },
  {
    _id: "sample-5",
    serviceName: "Lumière Couture Bridal Styling",
    category: "Makeup & Styling",
    description:
      "Luxury bridal hair and high-definition luxury makeup designed to highlight your natural radiance throughout emotional vows and reception dancing.",
    price: 1100,
    location: "Austin, Texas",
    images: [
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
    ],
    vendor: {
      name: "Camille Dupont",
      businessName: "Lumière Bridal Studio",
      isPremium: false,
    },
  },
  {
    _id: "sample-6",
    serviceName: "Atelier Royale Bespoke Bridal Gowns",
    category: "Wedding Fashion",
    description:
      "Custom silk wedding gowns, tailored tuxedos, and couture veils handcrafted by master seamstresses with antique French lace.",
    price: 4200,
    location: "Seattle, Washington",
    images: [
      "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80",
    ],
    vendor: {
      name: "Isabella Moretti",
      businessName: "Atelier Royale Couture",
      isPremium: true,
    },
  },
];

export function FeaturedServices() {
  const [services, setServices] = useState<ServiceItem[]>(fallbackFeatured);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await fetchAPI<ServiceItem[]>("/services/featured");
        if (res.success && res.data && res.data.length > 0) {
          setServices(res.data);
        }
      } catch (err) {
        // Fallback is already loaded
      }
    }
    loadFeatured();
  }, []);

  return (
    <section className="py-20 bg-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <SectionHeading
            title="Featured Wedding Services"
            subtitle="Handcrafted selections by top-rated artisans and acclaimed venues."
            align="left"
            className="mb-0"
          />

          <Button
            asChild
            variant="outline"
            className="rounded-full self-start md:self-auto gap-2"
          >
            <Link href="/services">
              <span>View All Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Grid of Featured Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.slice(0, 6).map((service, idx) => (
            <motion.div
              key={service._id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
            >
              <ServiceCard service={service} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
