'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  heroTitle: string;
  heroSubtitle: string;
  features: Array<{
    icon: React.ReactNode;
    text: string;
  }>;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  textColor: string;
  accentColor: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  heroTitle,
  heroSubtitle,
  features,
  gradientFrom,
  gradientVia,
  gradientTo,
  textColor,
  accentColor
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding and Hero */}
      <div className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold">Pradeep Opticals</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              {heroTitle}
            </h1>
            <p className={`text-xl ${textColor} leading-relaxed`}>
              {heroSubtitle}
            </p>
          </div>
          
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`${accentColor}`}>
                  {feature.icon}
                </div>
                <span className={textColor}>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-lg" />
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Pradeep Opticals</span>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              {title}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {subtitle}
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
