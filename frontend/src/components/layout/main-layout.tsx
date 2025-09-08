'use client';

import React, { useEffect } from 'react';
import { Header } from './header';
import { Footer } from './footer';
import { Toaster } from '@/components/ui/sonner';
import { useUserStore } from '@/stores/user-store';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { initialize } = useUserStore();

  useEffect(() => {
    // Initialize user store on app load
    initialize();
  }, [initialize]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}