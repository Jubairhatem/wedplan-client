import { Heart } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <Heart className="w-6 h-6 text-primary fill-primary/40 absolute animate-pulse" />
      </div>
      <p className="text-sm font-medium text-muted-foreground tracking-wide font-heading">
        Preparing WedPlan...
      </p>
    </div>
  );
}
