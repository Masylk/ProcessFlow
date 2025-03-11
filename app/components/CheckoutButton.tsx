"use client";

import React, { useState } from 'react';
import { loadStripe } from "@stripe/stripe-js";
import { useTheme } from '@/app/theme/hooks';
import { cn } from '@/lib/utils/cn';
import ButtonNormal from './ButtonNormal';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/hooks/useWorkspace';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutButtonProps {
  priceId: string;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  isCurrentPlan?: boolean;
  children: React.ReactNode;
}

export default function CheckoutButton({
  priceId,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  isCurrentPlan = false,
  children,
}: CheckoutButtonProps) {
  const { getCssVariable } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { workspace } = useWorkspace();

  const baseStyles = 'font-semibold transition-colors duration-200 rounded-lg flex items-center justify-center gap-2';
  const disabledStyles = 'opacity-50 saturate-50 cursor-not-allowed hover:bg-transparent hover:text-inherit hover:border-inherit';
  
  const sizeStyles = {
    small: 'px-3 py-2 text-sm gap-1 font-normal rounded-md',
    medium: 'px-3.5 py-2.5 text-base gap-1 font-medium rounded-md',
    large: 'px-4 py-2.5 text-lg gap-2 font-semibold rounded-md',
  };

  const getButtonToken = (type: 'bg' | 'fg' | 'border', state: 'normal' | 'hover' = 'normal'): string => {
    const suffix = state === 'hover' ? '-hover' : '';
    return getCssVariable(`button-primary-${type}${suffix}`);
  };

  const buttonId = 'btn-checkout';
  const style = {
    backgroundColor: getButtonToken('bg'),
    color: getButtonToken('fg'),
    borderColor: getButtonToken('border'),
    borderWidth: '1px',
    width: fullWidth ? '100%' : 'auto'
  };

  const hoverStyle = `
    #${buttonId}:not(:disabled):hover {
      background-color: ${getButtonToken('bg', 'hover')} !important;
      color: ${getButtonToken('fg', 'hover')} !important;
      border-color: ${getButtonToken('border', 'hover')} !important;
    }
  `;

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!workspace?.id) {
        throw new Error('No workspace selected');
      }

      if (isCurrentPlan) {
        // Redirect to billing portal for current plan management
        const response = await fetch(`/api/subscription?workspaceId=${workspace.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.details || data.error || 'Failed to access billing portal');
        }

        if (data.url) {
          // Use router.push for client-side navigation within the app
          // Use window.location.href for external URLs (like Stripe)
          if (data.url.startsWith(process.env.NEXT_PUBLIC_APP_URL || '')) {
            router.push(data.url);
          } else {
            window.location.href = data.url;
          }
        } else {
          throw new Error('No redirect URL received');
        }
        return;
      }

      // Create new checkout session
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          workspaceId: workspace.id,
          workspaceSlug: workspace.slug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        // Always use window.location.href for Stripe URLs
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const planMap: { [key: string]: 'free' | 'earlyAdopter' } = {
    'price_1R0gMwAiIekpSP7WgmGUdlZF': 'earlyAdopter', // Monthly price
    'price_1R14rXAiIekpSP7WxI9zoQIQ': 'earlyAdopter', // Annual price
  };

  return (
    <div className="flex flex-col gap-2">
      <style>{hoverStyle}</style>
      <ButtonNormal
        variant={variant}
        size={size}
        disabled={disabled || isLoading}
        onClick={handleCheckout}
      >
        {isLoading ? 'Loading...' : children}
      </ButtonNormal>
      {error && (
        <div className="text-red-500 text-sm mt-1">
          {error}
        </div>
      )}
    </div>
  );
} 