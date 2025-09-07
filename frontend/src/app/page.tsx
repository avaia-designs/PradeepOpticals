import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Shield, Truck, Headphones, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <Sparkles className="h-4 w-4 mr-2" />
                  New Collection 2024
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight font-heading">
                  Discover Your
                  <span className="gradient-text block">Perfect Vision</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Premium eyewear that combines style, comfort, and clarity. 
                  Find the perfect frames that reflect your personality and enhance your vision.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/products">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-muted-foreground">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Frame Styles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">50+</div>
                  <div className="text-sm text-muted-foreground">Brands</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&h=600&fit=crop&crop=center"
                  alt="Premium eyewear collection"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              
              {/* Floating Cards */}
              <Card className="absolute -bottom-6 -left-6 w-48 glass-effect">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Star className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">4.9/5 Rating</div>
                      <div className="text-sm text-muted-foreground">Customer Reviews</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="absolute -top-6 -right-6 w-48 glass-effect">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-success/10 rounded-full">
                      <Truck className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <div className="font-semibold">Free Shipping</div>
                      <div className="text-sm text-muted-foreground">On orders over $50</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 font-heading">Why Choose Pradeep Opticals?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're committed to providing you with the best eyewear experience, 
              combining quality, style, and exceptional service.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Eye className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 font-heading">Expert Eye Care</h3>
                <p className="text-muted-foreground">
                  Professional eye examinations and personalized recommendations from certified optometrists.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="p-4 bg-success/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-2 font-heading">Quality Guarantee</h3>
                <p className="text-muted-foreground">
                  Premium materials and craftsmanship with a comprehensive warranty on all our products.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="p-4 bg-warning/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Truck className="h-8 w-8 text-warning" />
                </div>
                <h3 className="text-xl font-semibold mb-2 font-heading">Fast Delivery</h3>
                <p className="text-muted-foreground">
                  Quick and secure shipping with tracking and insurance on all orders.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="p-4 bg-info/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Headphones className="h-8 w-8 text-info" />
                </div>
                <h3 className="text-xl font-semibold mb-2 font-heading">24/7 Support</h3>
                <p className="text-muted-foreground">
                  Round-the-clock customer service to help you with any questions or concerns.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 font-heading">Shop by Category</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore our diverse collection of eyewear categories, 
              each carefully curated to meet your specific needs and style preferences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Prescription Glasses",
                description: "Clear vision with style",
                image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&h=400&fit=crop&crop=center",
                href: "/categories/prescription-glasses"
              },
              {
                title: "Sunglasses",
                description: "Protect your eyes in style",
                image: "https://images.unsplash.com/photo-1511499767150-a48a237f0c44?w=600&h=400&fit=crop&crop=center",
                href: "/categories/sunglasses"
              },
              {
                title: "Reading Glasses",
                description: "Perfect for close-up work",
                image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&h=400&fit=crop&crop=center",
                href: "/categories/reading-glasses"
              },
              {
                title: "Computer Glasses",
                description: "Reduce digital eye strain",
                image: "https://images.unsplash.com/photo-1506629905607-1a0b0a0b0b0b?w=600&h=400&fit=crop&crop=center",
                href: "/categories/computer-glasses"
              },
              {
                title: "Progressive Lenses",
                description: "Seamless vision at all distances",
                image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&h=400&fit=crop&crop=center",
                href: "/categories/progressive-lenses"
              },
              {
                title: "Kids Eyewear",
                description: "Durable and fun frames",
                image: "https://images.unsplash.com/photo-1511499767150-a48a237f0c44?w=600&h=400&fit=crop&crop=center",
                href: "/categories/kids-eyewear"
              }
            ].map((category, index) => (
              <Card key={index} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-semibold mb-1 font-heading">{category.title}</h3>
                    <p className="text-sm opacity-90">{category.description}</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <Button asChild className="w-full">
                    <Link href={category.href}>
                      Shop {category.title}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 font-heading">
            Ready to Find Your Perfect Pair?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Book an appointment with our eye care professionals or browse our 
            extensive collection online. Your perfect vision awaits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/appointment">Book Appointment</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/products">Shop Online</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
