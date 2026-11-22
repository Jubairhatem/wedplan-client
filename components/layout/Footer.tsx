import Link from "next/link";
import { Heart, Mail, MapPin, Phone, Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-card/60 backdrop-blur-sm text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Heart className="w-4 h-4 fill-primary/30" />
              </div>
              <span className="font-heading text-xl font-bold tracking-tight">
                Wed<span className="text-primary font-serif">Plan</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your dream wedding, beautifully planned. Discover and book premium
              venues, top photographers, elite caterers, and talented designers in
              one seamless platform.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-muted/80 hover:bg-primary/10 hover:text-primary flex items-center justify-center text-muted-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-muted/80 hover:bg-primary/10 hover:text-primary flex items-center justify-center text-muted-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-muted/80 hover:bg-primary/10 hover:text-primary flex items-center justify-center text-muted-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="font-heading font-semibold text-base mb-4 text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Browse Wedding Services
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-up"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Become a Vendor
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-in"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Client Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h3 className="font-heading font-semibold text-base mb-4 text-foreground">
              Popular Services
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/services?category=Photography%20%26%20Videography"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Photography & Videography
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=Wedding%20Venues"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Luxury Wedding Venues
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=Decoration%20%26%20Florist"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Decoration & Floral Design
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=Catering%20Services"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Gourmet Catering
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="font-heading font-semibold text-base mb-4 text-foreground">
              Get in Touch
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>124 Blossom Lane, Suite 400, New York, NY 10001</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>+1 (800) 555-WEDP</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>support@wedplan.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {currentYear} WedPlan Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/" className="hover:text-primary transition-colors">
              Cookie Preferences
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
