import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md mx-auto space-y-6">
        <div className="relative mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Heart className="w-12 h-12 fill-primary/20" />
          <span className="absolute text-xl font-bold font-heading text-primary">
            404
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Page Not Found
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The wedding page or service you are searching for may have been moved,
            renamed, or is currently unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Return Home
            </Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/services" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Browse Services
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
