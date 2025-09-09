'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { AuthLayout, AuthForm, AuthInput, AuthButton } from '@/components/auth';
import { useUserStore } from '@/stores/user-store';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useUserStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      clearError();
      await login(data.email, data.password);
      toast.success('Login successful!');
      router.push('/');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
    }
  };

  const loginFeatures = [
    {
      icon: <div className="w-2 h-2 bg-white rounded-full" />,
      text: 'Premium quality frames'
    },
    {
      icon: <div className="w-2 h-2 bg-white rounded-full" />,
      text: 'Expert eye care consultation'
    },
    {
      icon: <div className="w-2 h-2 bg-white rounded-full" />,
      text: 'Free shipping & returns'
    }
  ];

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue shopping"
      heroTitle="Welcome back to premium eyewear"
      heroSubtitle="Discover our exclusive collection of designer frames, prescription glasses, and sunglasses crafted with precision."
      features={loginFeatures}
      gradientFrom="from-blue-600"
      gradientVia="via-purple-600"
      gradientTo="to-indigo-700"
      textColor="text-blue-100"
      accentColor=""
    >
      <AuthForm
        title="Sign in"
        description="Enter your credentials to access your account"
        error={error || undefined}
        showSeparator={true}
        separatorText="Or continue with"
        footerText="Don't have an account?"
        footerLink={{
          text: 'Create one now',
          href: '/auth/register'
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AuthInput
            id="email"
            label="Email address"
            type="email"
            placeholder="Enter your email"
            icon={Mail}
            {...register('email')}
            error={errors.email?.message}
            required
          />

          <AuthInput
            id="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            icon={Lock}
            {...register('password')}
            error={errors.password?.message}
            showPasswordToggle={true}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            required
          />

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <AuthButton
            type="submit"
            isLoading={isLoading}
            loadingText="Signing in..."
            icon={ArrowRight}
            gradientFrom="from-blue-600"
            gradientTo="to-purple-600"
            hoverFrom="from-blue-700"
            hoverTo="to-purple-700"
          >
            Sign in
          </AuthButton>
        </form>
      </AuthForm>
    </AuthLayout>
  );
}
