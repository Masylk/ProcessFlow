'use client';

import React, { useState } from 'react';
import { useColors } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';
import { toast } from 'sonner';
import useSWR from 'swr';

interface BillingInfoFormProps {
  workspaceId: number;
}

interface BillingInfo {
  billing_email: string;
  billing_address?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country_code: string;
  tax_rate: number;
  vat_number?: string;
  payment_method?: {
    brand: string;
    last4: string;
    expiry_month: number;
    expiry_year: number;
  };
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const formatCountryCode = (countryCode: string | undefined): string => {
  if (!countryCode) return '';
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode) || countryCode;
  } catch (error) {
    console.error('Error formatting country code:', error);
    return countryCode;
  }
};

const formatExpiryDate = (month?: number, year?: number): string => {
  if (!month || !year) return '';
  return `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`;
};

const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export default function BillingInfoForm({ workspaceId }: BillingInfoFormProps) {
  const colors = useColors();
  const [isLoading, setIsLoading] = useState(false);

  const { data: billingData, error, mutate } = useSWR<BillingInfo>(
    `/api/billing-info?workspaceId=${workspaceId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000,
      errorRetryCount: 3,
      errorRetryInterval: 2000,
      shouldRetryOnError: (err) => {
        return !err.status || err.status >= 500;
      },
      onError: (err) => {
        console.error('Error fetching billing info:', err);
        toast.error('Failed to fetch billing details', {
          description: err instanceof Error ? err.message : 'Please try again later',
        });
      }
    }
  );

  const handleEditClick = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workspaceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to access billing portal');
      }

      // Trigger a revalidation before redirecting
      await mutate();
      
      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (error) {
      console.error('Error accessing billing portal:', error);
      toast.error('Failed to Access Portal', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div style={{ color: colors['text-error'] }} className="p-4">
        Failed to load billing information. Please try again later.
      </div>
    );
  }

  const renderSection = (title: string, content: React.ReactNode) => (
    <div className="flex flex-col gap-2">
      <h3 style={{ color: colors['text-primary'] }} className="text-lg font-semibold">
        {title}
      </h3>
      {content}
    </div>
  );

  return (
    <div 
      style={{ 
        backgroundColor: colors['bg-secondary'],
        borderColor: colors['border-secondary']
      }}
      className="w-full rounded-xl border relative"
    >
      <div className="absolute top-4 right-4">
        <ButtonNormal
          onClick={handleEditClick}
          variant="secondary"
          size="small"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Edit Billing Details'}
        </ButtonNormal>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* Billing Address Section */}
        {renderSection(
          "Billing Address",
          <div className="flex flex-col gap-1">
            <h4 
              style={{ color: colors['text-primary'] }}
              className="text-base font-medium"
            >
              {billingData?.billing_email || 'No email provided'}
            </h4>
            <p 
              style={{ color: colors['text-tertiary'] }}
              className="text-sm whitespace-pre-line"
            >
              {[
                billingData?.address_line1,
                billingData?.address_line2,
                [
                  billingData?.city,
                  billingData?.state,
                  billingData?.postal_code
                ].filter(Boolean).join(', '),
                formatCountryCode(billingData?.country_code)
              ].filter(Boolean).join('\n')}
            </p>
          </div>
        )}

      </div>
    </div>
  );
} 