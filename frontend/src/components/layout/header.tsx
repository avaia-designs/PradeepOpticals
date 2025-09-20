'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Heart, User, Menu, X, Eye, Phone, Mail, MapPin } from 'lucide-react';
import { useCartStore, useTotalItems } from '@/stores/cart-store';
import { useUserStore } from '@/stores/user-store';
import { useProductSuggestions } from '@/hooks/use-products';
import { debounce } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const totalItems = useTotalItems();
  const { user, isAuthenticated, logout, isAdmin, isStaff, isStaffOrAdmin } = useUserStore();
  const wishlistCount = 0; // TODO: Implement wishlist functionality
  
  const { data: suggestionsData, isLoading: isSuggestionsLoading } = useProductSuggestions(
    searchQuery,  
    5
  );
  
  const suggestions = suggestionsData?.data?.map(product => product.name) || [];

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
    <header className={cn('sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b shadow-sm', className)}>
      {/* Top Bar */}
      <div className="hidden lg:block border-b bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>info@pradeepopticals.com</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>123 Main St, City</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-muted-foreground">Free shipping on orders over $50</span>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-muted-foreground">30-day return policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <MobileNavigation onClose={() => setIsMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Eye className="h-10 w-10 text-primary group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute -inset-1 bg-primary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold gradient-text font-heading group-hover:scale-105 transition-transform duration-200">Pradeep</span>
              <span className="text-xl font-bold gradient-text font-heading group-hover:scale-105 transition-transform duration-200">Opticals</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
              Products
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
                  className="pl-10 pr-4 py-2 w-full rounded-full border-2 focus:border-primary transition-colors"
                  onChange={handleSearch}
                  onFocus={() => setIsSearchOpen(true)}
                  onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                />
              </div>
              
              {/* Search Suggestions Dropdown */}
              {isSearchOpen && (searchQuery || suggestions.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                  {isSuggestionsLoading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Loading suggestions...
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="py-2">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 transition-colors flex items-center space-x-2"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <span>{suggestion}</span>
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
          <div className="flex items-center space-x-1">
            {/* Mobile Search */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>


            {/* Cart */}
            <Button variant="ghost" size="icon" asChild className="relative">
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
                  <Button variant="ghost" size="icon" className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profile?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                  </div>
                  <DropdownMenuSeparator />
                  
                  {/* Customer Menu Items */}
                  <DropdownMenuItem asChild>
                    <Link href="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/appointments">My Appointments</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/quotations">My Quotations</Link>
                  </DropdownMenuItem>
                  
                  {/* Staff/Admin Menu Items */}
                  {isStaffOrAdmin() && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Staff Panel</DropdownMenuLabel>
                      {isStaff() && (
                        <DropdownMenuItem asChild>
                          <Link href="/staff">Staff Dashboard</Link>
                        </DropdownMenuItem>
                      )}
                      {isAdmin() && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin">Admin Dashboard</Link>
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
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
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Eye className="h-8 w-8 text-primary" />
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold gradient-text font-heading">Pradeep</span>
            <span className="text-lg font-bold gradient-text font-heading">Opticals</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Separator />

      {/* Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for glasses, frames, lenses..."
            className="pl-10"
          />
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="space-y-1">
        <div className="text-sm font-medium text-muted-foreground mb-2">Shop</div>
        <Link href="/products" className="flex items-center py-2 text-sm hover:text-primary transition-colors" onClick={onClose}>
          All Products
        </Link>
      </nav>

      <Separator />

      {/* User Section */}
      {isAuthenticated ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profile?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="space-y-1">
            <Link href="/orders" className="flex items-center py-2 text-sm hover:text-primary transition-colors" onClick={onClose}>
              My Orders
            </Link>
            <Link href="/appointments" className="flex items-center py-2 text-sm hover:text-primary transition-colors" onClick={onClose}>
              My Appointments
            </Link>
            <Link href="/quotations" className="flex items-center py-2 text-sm hover:text-primary transition-colors" onClick={onClose}>
              My Quotations
            </Link>
            <Button variant="ghost" className="justify-start p-0 h-auto text-destructive hover:text-destructive" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Button variant="outline" asChild className="w-full" onClick={onClose}>
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button asChild className="w-full" onClick={onClose}>
            <Link href="/auth/register">Sign Up</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
