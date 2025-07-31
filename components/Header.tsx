"use client";
import {
  ClerkLoaded,
  OrganizationSwitcher,
  Protect,
  SignedIn,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";
import Form from "next/form";
import {
  PackageIcon,
  ShoppingBasketIcon,
  Search,
  Menu,
  X,
  PenToolIcon,
  SlidersHorizontal,
  WandSparklesIcon,
  TowerControlIcon,
} from "lucide-react";
import useBasketStore from "@/store/store";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";
function Header() {
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const itemCount = useBasketStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );
  return (
    <header className="bg-background shadow-sm border-b sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between py-4">
          <Link
            href="/"
            className="text-2xl font-bold text-primary hover:text-primary/90 transition-colors duration-200"
          >
            Tafreed
          </Link>
          <div className="flex-1 max-w-2xl mx-8">
            <Form action="/search" className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                  name="query"
                />
              </div>
            </Form>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/basket"
              className="relative flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {itemCount}
                </span>
              )}
              <ShoppingBasketIcon className="w-4 h-4" />
              <span>Basket</span>
            </Link>
            <Link
              href="/customize"
              className="relative flex items-center space-x-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              <WandSparklesIcon />
              <span>Customize</span>
            </Link>
            <Protect role="admin">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <p className="relative flex items-center space-x-2 bg-card hover:bg-muted text-card-foreground font-semibold py-2 px-4 rounded-lg transition-colors duration-200 border">
                    Admin
                  </p>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Link
                      href="/studio"
                      className="w-full flex items-center space-x-2"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      <span>Store Control</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      href="/designControl"
                      className="w-full flex items-center space-x-2"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      <span>Design Control</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Protect>
            <ClerkLoaded>
              <SignedIn>
                <Link
                  href="/orders"
                  className="flex items-center space-x-2 text-foreground hover:text-primary font-medium py-2 px-3 rounded-lg hover:bg-muted transition-all duration-200"
                >
                  <PackageIcon className="w-4 h-4" /> <span>Orders</span>
                </Link>
              </SignedIn>
              <OrganizationSwitcher />
              {user ? (
                <div className="flex items-center space-x-3 pl-4 border-l border-border">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      Welcome back
                    </p>
                    <p className="font-semibold text-foreground">
                      {user.fullName}!
                    </p>
                  </div>
                  <UserButton />
                </div>
              ) : (
                <SignInButton />
              )}
            </ClerkLoaded>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between py-4">
          <Link
            href="/"
            className="text-xl font-bold text-primary hover:text-primary/90 transition-colors duration-200"
          >
            Tafreed
          </Link>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Link
              href="/basket"
              className="relative p-2 text-foreground hover:text-primary transition-colors duration-200"
            >
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                  {itemCount}
                </span>
              )}
              <ShoppingBasketIcon className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-foreground hover:text-primary transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-4">
          <Form action="/search" className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                name="query"
              />
            </div>
          </Form>
        </div>

        {/* Mobile Menu Panel */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border py-4">
            <div className="space-y-2">
              <Link
                href="/customize"
                className="flex items-center space-x-3 py-3 px-4 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <PenToolIcon className="w-5 h-5" />
                <span className="font-medium">
                  Customize Your<strong> Own T-Shirt </strong>
                </span>
              </Link>
              <ClerkLoaded>
                <SignedIn>
                  <Protect role="admin">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-full">
                        <p className="relative flex items-center space-x-3 py-3 px-4 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-all duration-200">
                          <TowerControlIcon />
                          <span>Admin</span>
                        </p>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Link
                            href="/studio"
                            className="w-full flex items-center space-x-2"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span>Store Control</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link
                            href="/designControl"
                            className="w-full flex items-center space-x-2"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span>Design Control</span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Protect>
                  <Link
                    href="/orders"
                    className="flex items-center space-x-3 py-3 px-4 text-foreground hover:text-primary hover:bg-muted rounded-lg transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <PackageIcon className="w-5 h-5" />
                    <span className="font-medium">My Orders</span>
                  </Link>
                </SignedIn>
              </ClerkLoaded>
              {user ? (
                <div className="py-3 px-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Signed in as
                  </p>
                  <p className="font-semibold text-foreground">
                    {user.fullName}
                  </p>
                </div>
              ) : (
                <div className="py-3 px-4 border-t border-border">
                  <SignInButton />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
export default Header;
