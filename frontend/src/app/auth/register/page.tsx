'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Phone, ArrowRight, CheckCircle } from 'lucide-react';
import { AuthLayout, AuthForm, AuthInput, AuthButton } from '@/components/auth';
import { useUserStore } from '@/stores/user-store';
import { toast } from 'sonner';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z.string(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading, error, clearError } = useUserStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      clearError();
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });
      toast.success('Registration successful! Welcome to Pradeep Opticals!');
      router.push('/');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  const registerFeatures = [
    {
      icon: <CheckCircle className="h-5 w-5 text-emerald-200" />,
      text: 'Free eye consultation'
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-emerald-200" />,
      text: 'Personalized frame recommendations'
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-emerald-200" />,
      text: 'Exclusive member benefits'
    }
  ];

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join us to discover premium eyewear and expert care"
      heroTitle="Join our premium eyewear community"
      heroSubtitle="Experience the perfect blend of style, comfort, and precision with our curated collection of designer eyewear."
      features={registerFeatures}
      gradientFrom="from-emerald-600"
      gradientVia="via-teal-600"
      gradientTo="to-cyan-700"
      textColor="text-emerald-100"
      accentColor="text-emerald-200"
    >
      <AuthForm
        title="Get started"
        description="Create your account to start your eyewear journey"
        error={error || undefined}
        showSeparator={true}
        separatorText="Already have an account?"
        footerText=""
        footerLink={{
          text: 'Sign in to your account',
          href: '/auth/login'
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AuthInput
            id="name"
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            icon={User}
            {...register('name')}
            error={errors.name?.message}
            required
          />

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
            id="phone"
            label="Phone Number (Optional)"
            type="tel"
            placeholder="Enter your phone number"
            icon={Phone}
            {...register('phone')}
            error={errors.phone?.message}
          />

          <AuthInput
            id="password"
            label="Password"
            type="password"
            placeholder="Create a strong password"
            icon={Lock}
            {...register('password')}
            error={errors.password?.message}
            showPasswordToggle={true}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            required
          />

          <AuthInput
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            icon={Lock}
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            showPasswordToggle={true}
            showPassword={showConfirmPassword}
            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            required
          />

          <AuthButton
            type="submit"
            isLoading={isLoading}
            loadingText="Creating account..."
            icon={ArrowRight}
            gradientFrom="from-emerald-600"
            gradientTo="to-teal-600"
            hoverFrom="from-emerald-700"
            hoverTo="to-teal-700"
          >
            Create account
          </AuthButton>
        </form>
      </AuthForm>
    </AuthLayout>
  );
}
