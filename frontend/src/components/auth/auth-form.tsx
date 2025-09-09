'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface AuthFormProps {
  children: React.ReactNode;
  title: string;
  description: string;
  error?: string;
  showSeparator?: boolean;
  separatorText?: string;
  footerText?: string;
  footerLink?: {
    text: string;
    href: string;
  };
}

export function AuthForm({
  children,
  title,
  description,
  error,
  showSeparator = false,
  separatorText,
  footerText,
  footerLink
}: AuthFormProps) {
  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl text-center">{title}</CardTitle>
        <CardDescription className="text-center">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {children}

        {showSeparator && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                {separatorText}
              </span>
            </div>
          </div>
        )}

        {footerText && (
          <div className="text-center text-sm text-gray-600">
            {footerText}{' '}
            {footerLink && (
              <a
                href={footerLink.href}
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {footerLink.text}
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
