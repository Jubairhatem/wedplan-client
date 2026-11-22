"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  Camera,
  Landmark,
  Flower2,
  UtensilsCrossed,
  Sparkles,
  Shirt,
  ArrowRight,
} from "lucide-react";

const categories = [
  {
    name: "Photography & Videography",
    description: "Capture the raw emotions, joyful tears, and timeless moments.",
    icon: Camera,
    color: "from-rose-500/20 to-pink-500/10",
    image:
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Wedding Venues",
    description: "Historic estates, seaside bluffs, and crystal glasshouses.",
    icon: Landmark,
    color: "from-amber-500/20 to-yellow-500/10",
    image:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Decoration & Florist",
    description: "Cascading floral arches and intimate candlelit receptions.",
    icon: Flower2,
    color: "from-emerald-500/20 to-teal-500/10",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Catering Services",
    description: "Michelin-inspired tasting menus and artisanal champagne bars.",
    icon: UtensilsCrossed,
    color: "from-orange-500/20 to-amber-500/10",
    image:
      "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Makeup & Styling",
    description: "High-definition bridal glam and couture hair design.",
    icon: Sparkles,
    color: "from-purple-500/20 to-rose-500/10",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Wedding Fashion",
    description: "Bespoke bridal gowns, tailored tuxedos, and silk accessories.",
    icon: Shirt,
    color: "from-blue-500/20 to-indigo-500/10",
    image:
      "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=600&q=80",
  },
];

export function CategoriesSection() {
  return (
    <section className="py-20 bg-muted/30 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Explore by Category"
          subtitle="Discover specialized wedding artisans dedicated to every element of your celebration."
          align="center"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            const linkHref = `/services?category=${encodeURIComponent(cat.name)}`;

            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.07 }}
              >
                <Link
                  href={linkHref}
                  className="group relative block overflow-hidden rounded-2xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative h-44 w-full overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
                    <div className="absolute bottom-3 left-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center text-primary border border-primary/30">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-heading font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        {cat.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {cat.description}
                    </p>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
