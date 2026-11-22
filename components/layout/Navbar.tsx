"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  Menu,
  Sparkles,
  LayoutDashboard,
  User,
  LogOut,
  Calendar,
  Store,
  Shield,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = session?.user as any;
  const role = user?.role || "customer";

  const getDashboardHref = () => {
    switch (role) {
      case "admin":
        return "/dashboard/admin";
      case "vendor":
        return "/dashboard/vendor";
      default:
        return "/dashboard/customer";
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Browse Services", href: "/services" },
  ];

  const getInitials = (name?: string) => {
    if (!name) return "WP";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5 fill-primary/30" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-xl font-bold tracking-tight text-foreground">
              Wed<span className="text-primary font-serif">Plan</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth State */}
        <div className="hidden md:flex items-center gap-3">
          {isPending ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full p-0 ring-2 ring-primary/20 hover:ring-primary/40 transition-all cursor-pointer"
                  />
                }
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={user?.image || ""}
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none text-foreground">
                      {user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <div className="pt-1 flex items-center gap-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary uppercase">
                        {role === "admin" && <Shield className="w-2.5 h-2.5 mr-1" />}
                        {role === "vendor" && <Store className="w-2.5 h-2.5 mr-1" />}
                        {role === "customer" && <Heart className="w-2.5 h-2.5 mr-1" />}
                        {role}
                      </span>
                      {user?.subscriptionPlan === "premium" && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                          PRO
                        </span>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={
                    <Link
                      href={getDashboardHref()}
                      className="cursor-pointer flex items-center gap-2"
                    />
                  }
                >
                  <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={
                    <Link
                      href="/dashboard/profile"
                      className="cursor-pointer flex items-center gap-2"
                    />
                  }
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive focus:text-destructive flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild size="sm">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              >
                <Link href="/sign-up">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="flex md:hidden items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">Toggle navigation</span>
                </Button>
              }
            />
            <SheetContent side="right" className="w-72">
              <SheetHeader className="text-left pb-4 border-b">
                <SheetTitle className="flex items-center gap-2 font-heading">
                  <Heart className="w-5 h-5 text-primary fill-primary/30" />
                  <span>WedPlan</span>
                </SheetTitle>
              </SheetHeader>

              <div className="py-4 flex flex-col space-y-3">
                {session?.user && (
                  <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-3 mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.image || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{user?.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {role} Account
                      </span>
                    </div>
                  </div>
                )}

                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-base font-medium py-2 px-3 rounded-md hover:bg-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}

                {session?.user ? (
                  <>
                    <Link
                      href={getDashboardHref()}
                      onClick={() => setMobileOpen(false)}
                      className="text-base font-medium py-2 px-3 rounded-md hover:bg-accent flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4 text-primary" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setMobileOpen(false)}
                      className="text-base font-medium py-2 px-3 rounded-md hover:bg-accent flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-primary" />
                      <span>Profile</span>
                    </Link>
                    <div className="pt-4 border-t">
                      <Button
                        variant="destructive"
                        className="w-full justify-start gap-2"
                        onClick={() => {
                          setMobileOpen(false);
                          handleSignOut();
                        }}
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="pt-6 border-t flex flex-col gap-2">
                    <Button
                      variant="outline"
                      asChild
                      className="w-full"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Link href="/sign-in">Sign In</Link>
                    </Button>
                    <Button
                      asChild
                      className="w-full bg-primary"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Link href="/sign-up">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
