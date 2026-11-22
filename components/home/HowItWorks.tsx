"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/button";
import { Search, CalendarCheck, GlassWater, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Browse & Discover",
    description:
      "Filter verified vendors by category, destination, and budget. View real event galleries and detailed pricing packages.",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Select & Reserve",
    description:
      "Choose your wedding date, submit event specifications, and send an official reservation request directly to the artisan.",
  },
  {
    number: "03",
    icon: GlassWater,
    title: "Celebrate Joyfully",
    description:
      "Track accepted bookings in your personal wedding dashboard and walk down the aisle with total peace of mind.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-gradient-to-b from-muted/20 via-background to-rose-50/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="How WedPlan Works"
          subtitle="Three simple steps to assemble your dream wedding vendor team."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative mt-16">
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 border-t border-dashed border-primary/30 -translate-y-8 z-0" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center p-8 rounded-2xl bg-card border border-border/70 shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
              >
                {/* Step badge */}
                <div className="absolute -top-4 px-3 py-1 rounded-full bg-primary text-primary-foreground font-mono text-xs font-bold tracking-wider shadow">
                  STEP {step.number}
                </div>

                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center my-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8" />
                </div>

                <h3 className="font-heading font-bold text-xl text-foreground mb-3">
                  {step.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Banner CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-primary/10 via-rose-100/40 to-amber-100/30 border border-primary/20 text-center space-y-6"
        >
          <h3 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
            Are You a Wedding Professional?
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Expand your clientele and showcase your artistic wedding services to
            thousands of engaged couples planning their big day.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8"
            >
              <Link href="/sign-up" className="flex items-center gap-2">
                <span>List Your Services</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8">
              <Link href="/services">Browse Marketplace</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
