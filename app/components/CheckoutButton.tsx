"use client";

import React from 'react';
import { loadStripe } from "@stripe/stripe-js";
import { useColors } from '@/app/theme/hooks';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutButtonProps {
  priceId: string;
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ 
  priceId, 
  className = "",
  children = "Subscribe",
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  isLoading = false
}) => {
  const colors = useColors();
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  // Size classes
  const sizeClasses = {
    sm: 'text-sm py-1.5 px-3',
    md: 'text-sm py-2 px-4',
    lg: 'text-base py-2.5 px-5'
  };
  
  // Process checkout
  const handleCheckout = async () => {
    if (isProcessing || disabled || isLoading) return;
    
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

  // Get button style based on variant
  const getButtonStyle = () => {
    if (disabled) {
      return {
        backgroundColor: colors['bg-tertiary'],
        color: colors['text-tertiary'],
        cursor: 'not-allowed'
      };
    }
    
    if (variant === 'primary') {
      return {
        backgroundColor: colors['bg-accent'],
        color: 'white',
      };
    }
    
    return {
      backgroundColor: 'transparent',
      color: colors['text-accent'],
      border: `1px solid ${colors['text-accent']}`
    };
  };

  const buttonStyle = getButtonStyle();
  
  return (
    <button 
      onClick={handleCheckout} 
      disabled={disabled || isProcessing || isLoading}
      className={`rounded-md font-medium transition duration-150 ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className} ${variant === 'primary' ? 'hover:opacity-90' : 'hover:bg-opacity-10 hover:bg-accent'}`}
      style={buttonStyle}
    >
      {isProcessing || isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </div>
      ) : children}
    </button>
  );
};

export default CheckoutButton; 