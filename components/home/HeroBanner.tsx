"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, ArrowRight, ShieldCheck, Star } from "lucide-react";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36 bg-gradient-to-b from-rose-50/70 via-background to-background">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-amber-100/30 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Top Tagline Pill */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs sm:text-sm font-medium mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 fill-primary/30" />
          <span>The Modern Wedding Planning Experience</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.15]"
        >
          Curate Your Timeless{" "}
          <span className="text-primary italic font-serif">Wedding</span>{" "}
          Celebration
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Discover elite venues, visionary photographers, bespoke floral
          artisans, and gourmet caterers. Connect with verified vendors to craft
          your unforgettable day.
        </motion.p>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-base px-8 py-6 rounded-full shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/35"
          >
            <Link href="/services" className="flex items-center gap-2">
              <span>Explore Wedding Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto text-base px-8 py-6 rounded-full border-border/80 hover:bg-muted/60 transition-all"
          >
            <Link href="/sign-up">Join as a Vendor</Link>
          </Button>
        </motion.div>

        {/* Highlights Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 pt-8 border-t border-border/50 max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-6 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Verified Vendors
              </p>
              <p className="text-xs text-muted-foreground">Admin-approved quality</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Star className="w-5 h-5 fill-primary/30" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Top Rated Services
              </p>
              <p className="text-xs text-muted-foreground">Highest wedding standards</p>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Heart className="w-5 h-5 fill-primary/30" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Direct Booking
              </p>
              <p className="text-xs text-muted-foreground">Seamless reservations</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
