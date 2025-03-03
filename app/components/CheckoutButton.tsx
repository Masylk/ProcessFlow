"use client";

import React, { useState } from 'react';
import { loadStripe } from "@stripe/stripe-js";
import { useTheme } from '@/app/theme/hooks';
import { cn } from '@/lib/utils/cn';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutButtonProps {
  priceId: string;
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  isCurrentPlan?: boolean;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ 
  priceId, 
  className,
  children = "Subscribe",
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  isCurrentPlan = false
}) => {
  const { getCssVariable } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);

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
    if (isProcessing || disabled) return;
    
    setIsProcessing(true);
    try {
      const stripe = await stripePromise;
      
      if (!stripe) {
        console.error("Stripe failed to load");
        return;
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Checkout API request failed");
      }

      const { sessionId } = await response.json();
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        console.error("Stripe redirect error:", error);
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const planMap: { [key: string]: 'free' | 'earlyAdopter' } = {
    'price_early_adopter_monthly': 'earlyAdopter',
    'price_early_adopter_annual': 'earlyAdopter',
  };

  return (
    <>
      <style>{hoverStyle}</style>
      <button
        id={buttonId}
        onClick={handleCheckout}
        onMouseDown={(e) => e.preventDefault()}
        disabled={isProcessing || disabled || isCurrentPlan}
        className={cn(
          baseStyles,
          sizeStyles[size],
          className,
          (isProcessing || disabled || isCurrentPlan) && disabledStyles
        )}
        style={style}
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              style={{ color: getCssVariable('button-loading-spinner') }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Processing...</span>
          </div>
        ) : (
          <span>{isCurrentPlan ? "Current plan" : children}</span>
        )}
      </button>
    </>
  );
};

export default CheckoutButton; 