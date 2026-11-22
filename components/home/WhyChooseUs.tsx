"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ShieldCheck, HeartHandshake, Sparkles, Gem } from "lucide-react";

const reasons = [
  {
    icon: ShieldCheck,
    title: "Vetted & Verified Vendors",
    description:
      "Every vendor profile is meticulously reviewed by our wedding curation team before listing, ensuring top-tier service standards.",
  },
  {
    icon: HeartHandshake,
    title: "Seamless Direct Bookings",
    description:
      "Submit dates, requirements, and custom notes directly to vendors without middlemen markups or bureaucratic delays.",
  },
  {
    icon: Gem,
    title: "Couture Quality Guarantee",
    description:
      "From intimate elopements to 500-guest gala celebrations, discover artisans who share your passion for timeless elegance.",
  },
  {
    icon: Sparkles,
    title: "Transparent Pricing",
    description:
      "Clear starting rates, detailed inclusions, and no hidden booking fees give you confidence in budgeting every detail.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Why Couples Choose WedPlan"
          subtitle="Designed to eliminate stress and inspire your wedding planning journey."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-6 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm hover:border-primary/40 hover:shadow-md transition-all space-y-4"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
