'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, LucideIcon } from 'lucide-react';

interface AuthButtonProps {
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  className?: string;
  icon?: LucideIcon;
  gradientFrom?: string;
  gradientTo?: string;
  hoverFrom?: string;
  hoverTo?: string;
  onClick?: () => void;
}

export function AuthButton({
  type = 'submit',
  children,
  isLoading = false,
  loadingText = 'Loading...',
  disabled = false,
  className = '',
  icon: Icon,
  gradientFrom = 'from-blue-600',
  gradientTo = 'to-purple-600',
  hoverFrom = 'from-blue-700',
  hoverTo = 'to-purple-700',
  onClick
}: AuthButtonProps) {
  return (
    <Button
      type={type}
      className={`w-full h-11 bg-gradient-to-r ${gradientFrom} ${gradientTo} hover:${hoverFrom} hover:${hoverTo} text-white font-medium transition-all duration-200 ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {children}
          {Icon && <Icon className="ml-2 h-4 w-4" />}
        </>
      )}
    </Button>
  );
}
