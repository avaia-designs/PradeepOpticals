'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Heart, User, Menu, X, Eye } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { useUserStore } from '@/stores/user-store';
import { useProductSuggestions } from '@/hooks/use-products';
import { debounce } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { totalItems } = useCartStore();
  const { user, isAuthenticated, wishlistCount, logout } = useUserStore();
  
  const { data: suggestions = [], isLoading: isSuggestionsLoading } = useProductSuggestions(
    searchQuery,
    5
  ) as { data: string[]; isLoading: boolean };

  const debouncedSearch = debounce((query: string) => {
    setSearchQuery(query);
  }, 300);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className={cn('sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60', className)}>
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="hidden md:flex items-center justify-between py-2 text-sm text-muted-foreground border-b">
          <div className="flex items-center space-x-4">
            <span>Free shipping on orders over $50</span>
            <span>•</span>
            <span>30-day return policy</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Contact Us
            </Link>
            <Link href="/help" className="hover:text-foreground transition-colors">
              Help Center
            </Link>
            <span>•</span>
            <span>Call: (555) 123-4567</span>
          </div>
        </div>

        {/* Main Header */}
        <div className="flex items-center justify-between py-4">
          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <MobileNavigation onClose={() => setIsMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Eye className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">Pradeep Opticals</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
              Products
            </Link>
            <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">
              Categories
            </Link>
            <Link href="/brands" className="text-sm font-medium hover:text-primary transition-colors">
              Brands
            </Link>
            <Link href="/sale" className="text-sm font-medium hover:text-primary transition-colors">
              Sale
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for glasses, frames, lenses..."
                  className="pl-10 pr-4 py-2 w-full"
                  onChange={handleSearch}
                  onFocus={() => setIsSearchOpen(true)}
                  onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                />
              </div>
              
              {/* Search Suggestions Dropdown */}
              {isSearchOpen && (searchQuery || suggestions.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50">
                  {isSuggestionsLoading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Loading suggestions...
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="py-2">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  ) : searchQuery && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No suggestions found
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
                {wishlistCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {wishlistCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Cart</span>
                {totalItems > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {totalItems}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profile?.avatar} alt={user?.name} />
                      <AvatarFallback>
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist">Wishlist</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/addresses">Addresses</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Mobile Navigation Component
function MobileNavigation({ onClose }: { onClose: () => void }) {
  const { user, isAuthenticated, logout } = useUserStore();

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Menu</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <nav className="flex flex-col space-y-2">
        <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors" onClick={onClose}>
          Products
        </Link>
        <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors" onClick={onClose}>
          Categories
        </Link>
        <Link href="/brands" className="text-sm font-medium hover:text-primary transition-colors" onClick={onClose}>
          Brands
        </Link>
        <Link href="/sale" className="text-sm font-medium hover:text-primary transition-colors" onClick={onClose}>
          Sale
        </Link>
        <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors" onClick={onClose}>
          About
        </Link>
      </nav>

      {isAuthenticated ? (
        <div className="border-t pt-4">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profile?.avatar} alt={user?.name} />
              <AvatarFallback>
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <Link href="/account" className="text-sm font-medium hover:text-primary transition-colors" onClick={onClose}>
              Account
            </Link>
            <Link href="/orders" className="text-sm font-medium hover:text-primary transition-colors" onClick={onClose}>
              Orders
            </Link>
            <Link href="/wishlist" className="text-sm font-medium hover:text-primary transition-colors" onClick={onClose}>
              Wishlist
            </Link>
            <Link href="/addresses" className="text-sm font-medium hover:text-primary transition-colors" onClick={onClose}>
              Addresses
            </Link>
            <Button variant="ghost" className="justify-start p-0 h-auto" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-t pt-4 flex flex-col space-y-2">
          <Button variant="outline" asChild onClick={onClose}>
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button asChild onClick={onClose}>
            <Link href="/auth/register">Sign Up</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
