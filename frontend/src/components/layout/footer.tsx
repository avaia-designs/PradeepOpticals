import React from 'react';
import Link from 'next/link';
import { Eye, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn('bg-muted/50 border-t', className)}>
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Eye className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">Pradeep Opticals</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your trusted partner for premium eyewear and optical solutions. 
              We offer the latest in fashion frames, prescription lenses, and eye care services.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                All Products
              </Link>
              <Link href="/categories" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Categories
              </Link>
              <Link href="/brands" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Brands
              </Link>
              <Link href="/sale" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Sale
              </Link>
              <Link href="/new-arrivals" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                New Arrivals
              </Link>
              <Link href="/popular" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Popular
              </Link>
            </nav>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Service</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Help Center
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </Link>
              <Link href="/shipping" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Shipping Info
              </Link>
              <Link href="/returns" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Returns & Exchanges
              </Link>
              <Link href="/size-guide" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Size Guide
              </Link>
              <Link href="/warranty" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Warranty
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p>123 Main Street</p>
                  <p>Suite 100</p>
                  <p>New York, NY 10001</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <a href="tel:+15551234567" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  (555) 123-4567
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <a href="mailto:info@pradeepopticals.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  info@pradeepopticals.com
                </a>
              </div>
            </div>
            
            {/* Store Hours */}
            <div className="pt-2">
              <h4 className="text-sm font-medium mb-2">Store Hours</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Mon - Fri: 9:00 AM - 7:00 PM</p>
                <p>Saturday: 10:00 AM - 6:00 PM</p>
                <p>Sunday: 12:00 PM - 5:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t py-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to our newsletter for the latest eyewear trends and exclusive offers.
            </p>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Pradeep Opticals. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
