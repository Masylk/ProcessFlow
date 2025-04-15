'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/user';
import ButtonNormal from '@/app/components/ButtonNormal';
import WorkspaceSettings from './WorkspaceSettings';
import { Workspace } from '@/types/workspace';
import { useColors, useTheme } from '@/app/theme/hooks';
import type { ThemeMode } from '@/app/theme/types';
import CheckoutButton from '@/app/components/CheckoutButton';
import { WorkspaceProvider } from '@/hooks/useWorkspace';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { STRIPE_PRICE_IDS } from '@/lib/stripe';
import Modal from '@/app/components/Modal';
import BillingInfoForm from './BillingInfoForm';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface SettingsPageProps {
  user: User | null;
  onClose: () => void;
  workspace?: Workspace;
  onWorkspaceUpdate?: (updates: Partial<Workspace>) => Promise<boolean>;
  onWorkspaceDelete?: (workspaceId: number) => Promise<void>;
  initialTab?: string;
}

export default function SettingsPage({
  user,
  onClose,
  workspace,
  onWorkspaceUpdate,
  onWorkspaceDelete,
  initialTab,
}: SettingsPageProps) {
  const colors = useColors();
  const { currentTheme, setTheme } = useTheme();
  const tabs = ['Workspace', 'Plan', 'Billing', 'Appearance'];
  const defaultTab = 'Workspace';
  
  // Force defaultTab to always be 'Workspace' regardless of initialTab
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Log and ensure activeTab is set to a valid value on mount
  useEffect(() => {
    console.log('SettingsPage mounting with initialTab:', initialTab, 'activeTab:', activeTab);
    // Always reset to default tab on mount to ensure we have a valid tab selected
    setActiveTab(defaultTab);
    
    // Apply initialTab after a short delay if it's valid
    if (initialTab && tabs.includes(initialTab)) {
      setTimeout(() => {
        setActiveTab(initialTab);
      }, 0);
    }
  }, []);

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>(
    'monthly'
  );
  const [currentPlan, setCurrentPlan] = useState<'free' | 'earlyAdopter'>(
    'free'
  );
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(
    null
  );
  const [subscriptionEnd, setSubscriptionEnd] = useState<Date | null>(null);
  const [nextPaymentAmount, setNextPaymentAmount] = useState<number | null>(
    null
  );
  const [showDowngradeConfirmation, setShowDowngradeConfirmation] =
    useState(false);
  const [isUpdatingBillingPeriod, setIsUpdatingBillingPeriod] = useState(false);
  const searchParams = useSearchParams();
  const [currentBillingType, setCurrentBillingType] = useState<
    'monthly' | 'annual' | null
  >(null);

  // State for plan change confirmation modal
  const [showPlanChangeConfirmation, setShowPlanChangeConfirmation] =
    useState(false);
  const [pendingBillingPeriod, setPendingBillingPeriod] = useState<
    'monthly' | 'annual' | null
  >(null);

  const {
    data: subscriptionData,
    error: subscriptionError,
    mutate: mutateSubscription,
  } = useSWR<{
    plan_type: string;
    status: string;
    current_period_end: string | null;
    price_id: string | null;
    next_payment_amount: number | null;
    users: Array<{ id: number; email: string }>;
  }>(`/api/subscription?workspaceId=${workspace?.id}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const { data: invoicesData, error: invoicesError } = useSWR<{
    invoices: Array<{
      id: string;
      number: string;
      created: number;
      status: string;
      amount: number;
      currency: string;
      pdfUrl: string;
      hostedUrl: string;
      plan: string;
    }>;
  }>(
    workspace?.id ? `/api/invoices?workspaceId=${workspace.id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const fetchSubscription = async () => {
    if (!workspace) return;

    try {
      setIsLoadingPlan(true);
      const res = await fetch(`/api/subscription?workspaceId=${workspace.id}`);

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Subscription API error:', {
          status: res.status,
          error: errorData.error || 'Unknown error',
          workspaceId: workspace.id,
        });
        setCurrentPlan('free');
        return false;
      }

      const data = await res.json();

      if (data.error) {
        console.error('Subscription data error:', data.error);
        setCurrentPlan('free');
        return false;
      }

      // Map the plan_type from database to our UI plan types
      const planMap: { [key: string]: 'free' | 'earlyAdopter' } = {
        FREE: 'free',
        EARLY_ADOPTER: 'earlyAdopter',
      };

      setCurrentPlan(planMap[data.plan_type] || 'free');
      setSubscriptionStatus(data.status);
      setSubscriptionEnd(
        data.current_period_end ? new Date(data.current_period_end) : null
      );
      setNextPaymentAmount(data.next_payment_amount || null);

      // Set the billing period based on the subscription price ID
      if (data.price_id) {
        // Check if the price ID matches annual or monthly
        if (
          data.price_id === STRIPE_PRICE_IDS.EARLY_ADOPTER.ANNUAL ||
          data.price_id ===
            process.env.NEXT_PUBLIC_STRIPE_EARLY_ADOPTER_ANNUAL_PRICE_ID
        ) {
          setBillingPeriod('annual');
          setCurrentBillingType('annual');
        } else {
          setBillingPeriod('monthly');
          setCurrentBillingType('monthly');
        }
      } else {
        // Default to monthly if no price ID is available
        setBillingPeriod('monthly');
        setCurrentBillingType(null);
      }

      // Return true if subscription is active
      return (
        data.plan_type === 'EARLY_ADOPTER' &&
        (data.status === 'ACTIVE' || data.status === 'TRIALING')
      );
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setCurrentPlan('free');
      return false;
    } finally {
      setIsLoadingPlan(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchSubscription();
  }, [workspace]);

  // Refetch when returning from checkout
  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');
    const message = searchParams.get('message');
    const error = searchParams.get('error');
    const action = searchParams.get('action');

    // Check for URL parameters or stored notification data
    const showNotification = () => {
      // First check localStorage for pending notifications
      const storedNotification =
        typeof window !== 'undefined'
          ? localStorage.getItem('checkoutNotification')
          : null;

      if (storedNotification) {
        try {
          const notification = JSON.parse(storedNotification);

          // Show the appropriate toast based on stored data
          if (notification.status === 'success') {
            if (notification.action === 'upgrade') {
              toast.success('Successfully Upgraded! 🚀', {
                description:
                  'Your subscription has been upgraded to the Early Adopter plan. Enjoy all the premium features!',
                duration: 7000,
              });
            } else {
              toast.success('Subscription Activated', {
                description:
                  'Your Early Adopter subscription has been successfully activated.',
                duration: 5000,
              });
            }
          } else if (notification.status === 'failed') {
            toast.error('Checkout Failed', {
              description:
                notification.error ||
                'There was an issue processing your payment. Please try again.',
              duration: 0, // Keep until dismissed
            });
          }

          // Clear the stored notification after showing it
          localStorage.removeItem('checkoutNotification');
        } catch (e) {
          console.error('Error parsing stored notification:', e);
          localStorage.removeItem('checkoutNotification');
        }

        return true; // Notification was shown from localStorage
      }

      return false; // No stored notification was found
    };

    // Handle URL parameters and store notification if needed
    if (checkoutStatus) {
      fetchSubscription();

      // If we have URL parameters, store them before they're cleared
      if (checkoutStatus === 'success' || checkoutStatus === 'failed') {
        const notificationData = {
          status: checkoutStatus,
          action: action || null,
          error: error || null,
          timestamp: new Date().getTime(),
        };

        // Store in localStorage for persistence across reloads
        localStorage.setItem(
          'checkoutNotification',
          JSON.stringify(notificationData)
        );
      }

      // Clear the checkout parameters from URL to avoid unnecessary refetches
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('checkout');
      newUrl.searchParams.delete('message');
      newUrl.searchParams.delete('error');
      newUrl.searchParams.delete('action');
      window.history.replaceState({}, '', newUrl.toString());

      // Try to show notification now (if localStorage was already set)
      showNotification();
    } else {
      // No URL parameters, check if we have a stored notification
      showNotification();
    }
  }, [searchParams]);

  // Check for stored notifications on mount (for cases where the effect above doesn't run)
  useEffect(() => {
    const storedNotification =
      typeof window !== 'undefined'
        ? localStorage.getItem('checkoutNotification')
        : null;

    if (storedNotification) {
      try {
        const notification = JSON.parse(storedNotification);

        // Only show notifications that are less than 1 minute old
        // This prevents showing very old notifications after long periods
        const currentTime = new Date().getTime();
        const notificationTime = notification.timestamp || 0;

        if (currentTime - notificationTime < 60000) {
          // Show the appropriate toast based on stored data
          if (notification.status === 'success') {
            if (notification.action === 'upgrade') {
              toast.success('Successfully Upgraded! 🚀', {
                description:
                  'Your subscription has been upgraded to the Early Adopter plan. Enjoy all the premium features!',
                duration: 7000,
              });
            } else {
              toast.success('Subscription Activated', {
                description:
                  'Your Early Adopter subscription has been successfully activated.',
                duration: 5000,
              });
            }
          } else if (notification.status === 'failed') {
            toast.error('Checkout Failed', {
              description:
                notification.error ||
                'There was an issue processing your payment. Please try again.',
              duration: 0, // Keep until dismissed
            });
          }
        }

        // Clear the stored notification after showing it
        localStorage.removeItem('checkoutNotification');
      } catch (e) {
        console.error('Error parsing stored notification:', e);
        localStorage.removeItem('checkoutNotification');
      }
    }
  }, []);

  // Ensure activeTab is always valid
  useEffect(() => {
    if (!tabs.includes(activeTab)) {
      setActiveTab(defaultTab);
    }
  }, [activeTab]); 
  
  useEffect(() => {
    if (initialTab && tabs.includes(initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleDowngradeClick = () => {
    setShowDowngradeConfirmation(true);
  };

  const handleConfirmDowngrade = async () => {
    if (!workspace) return;

    try {
      setIsLoadingPlan(true);

      // Call the API to cancel the subscription
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceId: workspace.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error('Failed to Downgrade', {
          description:
            data.details ||
            data.error ||
            'An error occurred while downgrading your plan',
          duration: 5000,
        });
        console.error('Error downgrading plan:', data);
        return;
      }

      // Update the UI to reflect the change
      setCurrentPlan('free');
      setSubscriptionStatus('CANCELED');

      // Show success toast
      toast.success('Successfully Downgraded', {
        description:
          'Your subscription has been canceled. You will continue to have access to Early Adopter features until the end of your billing period.',
        duration: 7000,
      });
    } catch (error) {
      console.error('Error downgrading to free plan:', error);
      toast.error('Failed to Downgrade', {
        description:
          'An unexpected error occurred. Please try again or contact support.',
        duration: 5000,
      });
    } finally {
      setIsLoadingPlan(false);
      setShowDowngradeConfirmation(false);
    }
  };

  // Function to update the subscription billing period
  const updateBillingPeriod = async (period: 'monthly' | 'annual') => {
    if (!workspace || currentPlan !== 'earlyAdopter') return;

    try {
      setIsUpdatingBillingPeriod(true);

      const response = await fetch('/api/subscription/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceId: workspace.id,
          billingPeriod: period,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.details || data.error || 'Failed to update subscription'
        );
      }

      // Update the billing period and subscription end date
      setBillingPeriod(period);
      setCurrentBillingType(period); // Update the current billing type

      if (data.current_period_end) {
        setSubscriptionEnd(new Date(data.current_period_end));
      }

      // Use the detailed message from the API
      const title = data.is_upgrade
        ? 'Upgraded to Annual Billing'
        : 'Switched to Monthly Billing';

      toast.success(title, {
        description:
          data.details ||
          `Your subscription has been updated to ${period} billing.`,
      });

      // Refresh subscription data
      fetchSubscription();

      return data;
    } catch (error) {
      console.error('Error updating billing period:', error);
      toast.error('Failed to Update Billing', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
      throw error;
    } finally {
      setIsUpdatingBillingPeriod(false);
    }
  };

  // Function to handle billing period toggle clicks - now only updates UI state
  const handleBillingPeriodChange = (period: 'monthly' | 'annual') => {
    // Simply update the UI state without changing subscription
    setBillingPeriod(period);
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  // Plan pricing and structure
  const PLAN_DATA = {
    free: {
      name: 'Free. Forever.',
      price: '$0',
      features: [
        '5 conditional processes',
        'Edit mode',
        'Read mode',
        'Basic export and sharing',
      ],
    },
    earlyAdopter: {
      monthly: {
        price: '$15',
        period: 'per user/month billed monthly',
        priceId:
          process.env.NEXT_PUBLIC_STRIPE_EARLY_ADOPTER_MONTHLY_PRICE_ID || '',
      },
      annual: {
        price: '$12',
        period: 'per user/month billed annually',
        priceId:
          process.env.NEXT_PUBLIC_STRIPE_EARLY_ADOPTER_ANNUAL_PRICE_ID || '',
      },
      name: 'Early Adopter',
      features: [
        'All Free features +',
        'Unlimited conditional processes',
        'Early access to new features',
        'Branded processes & exports',
        'Priority support from the founders',
        'Remove ProcessFlow branding',
      ],
    },
  };

  // Function to determine the correct button text for the plan
  const getPlanButtonText = (
    planType: 'free' | 'earlyAdopter',
    currentBillingType: 'monthly' | 'annual' | null,
    selectedBillingPeriod: 'monthly' | 'annual'
  ): React.ReactNode => {
    // For the free plan, show simple upgrade text
    if (planType === 'free') {
      return `Upgrade to ${selectedBillingPeriod === 'annual' ? 'annual' : 'monthly'} plan`;
    }

    // For users already on the Early Adopter plan
    if (planType === 'earlyAdopter') {
      // If they've selected the same billing period they already have
      if (currentBillingType === selectedBillingPeriod) {
        return 'Current plan';
      }

      // If they're on monthly and want to switch to annual (upgrade)
      if (
        currentBillingType === 'monthly' &&
        selectedBillingPeriod === 'annual'
      ) {
        return (
          <div className="flex items-center gap-1">
            <span>Upgrade to annual billing</span>
            <span
              style={{
                backgroundColor: colors['bg-brand-primary'],
                color: colors['text-brand-primary'],
                borderColor: colors['border-brand'],
              }}
              className="text-xs px-2 py-0.5 rounded-full border"
            >
              Save 20%
            </span>
          </div>
        );
      }

      // If they're on annual and want to switch to monthly
      if (
        currentBillingType === 'annual' &&
        selectedBillingPeriod === 'monthly'
      ) {
        return 'Switch to monthly billing';
      }
    }

    // Default fallback text
    return 'Select plan';
  };

  // Function to handle plan button click
  const handlePlanButtonClick = async (planType: 'free' | 'earlyAdopter') => {
    // If they're not changing their current plan, do nothing
    if (
      planType === currentPlan &&
      subscriptionStatus === 'ACTIVE' &&
      ((currentBillingType === 'monthly' && billingPeriod === 'monthly') ||
        (currentBillingType === 'annual' && billingPeriod === 'annual'))
    ) {
      return;
    }

    // If they're on a free plan, we don't need to do anything special -
    // the regular checkout flow will handle it
    if (currentPlan === 'free') {
      return;
    }

    // If they're already on Early Adopter plan but want to change billing period
    if (
      currentPlan === 'earlyAdopter' &&
      subscriptionStatus === 'ACTIVE' &&
      currentBillingType !== billingPeriod
    ) {
      // Show confirmation modal instead of immediately updating
      setPendingBillingPeriod(billingPeriod);
      setShowPlanChangeConfirmation(true);
    }
  };

  // Function to confirm and actually process the plan change
  const confirmPlanChange = async () => {
    if (!pendingBillingPeriod) return;

    try {
      // Show appropriate message based on the change
      const isUpgrade = pendingBillingPeriod === 'annual';
      const toastTitle = isUpgrade
        ? 'Upgrading to Annual Billing'
        : 'Switching to Monthly Billing';

      toast.info(toastTitle, {
        description: 'Processing your request...',
      });

      // Update the subscription billing period
      const result = await updateBillingPeriod(pendingBillingPeriod);

      // Hide confirmation modal
      setShowPlanChangeConfirmation(false);
      setPendingBillingPeriod(null);

      // Success is handled in updateBillingPeriod function
    } catch (error) {
      // Error handling is done in updateBillingPeriod
      console.error('Error handling plan change confirmation:', error);

      // Hide confirmation modal even on error
      setShowPlanChangeConfirmation(false);
      setPendingBillingPeriod(null);
    }
  };

  return (
    <WorkspaceProvider value={{ workspace: workspace || null }}>
      <div
        style={{ backgroundColor: colors['bg-primary'] }}
        className="h-screen"
      >
        {/* Header */}
        <div className="px-8 py-6">
          <h1
            style={{ color: colors['text-primary'] }}
            className="text-2xl font-semibold"
          >
            Settings
          </h1>
        </div>

        {/* Tabs */}
        <div className="px-8 mb-6">
          <div
            style={{
              backgroundColor: colors['bg-secondary'],
              borderColor: colors['border-secondary'],
            }}
            className="inline-flex w-full p-1 rounded-lg border"
          >
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                style={{
                  backgroundColor:
                    activeTab === tab ? colors['bg-primary'] : 'transparent',
                  borderColor:
                    activeTab === tab
                      ? colors['border-secondary']
                      : 'transparent',
                  color:
                    activeTab === tab
                      ? colors['text-primary']
                      : colors['text-quaternary'],
                }}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 border hover:text-[var(--text-primary)]`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-210px)] overflow-y-auto pb-10">
          {activeTab === 'Workspace' && workspace && onWorkspaceUpdate && (
            <div className="px-8">
              <WorkspaceSettings
                workspace={workspace}
                onUpdate={onWorkspaceUpdate}
                onDelete={onWorkspaceDelete}
              />
            </div>
          )}
          {activeTab === 'Team' && (
            <div className="px-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2
                    style={{ color: colors['text-primary'] }}
                    className="text-lg font-semibold"
                  >
                    Team members
                  </h2>
                  <p
                    style={{ color: colors['text-tertiary'] }}
                    className="text-sm"
                  >
                    Manage your team members and their account permissions here.
                  </p>
                </div>
                <div className="flex gap-3">
                  <ButtonNormal variant="secondary" size="small">
                    Download CSV
                  </ButtonNormal>
                  <ButtonNormal variant="primary" size="small">
                    Add user
                  </ButtonNormal>
                </div>
              </div>

              {/* Team members table */}
              <div
                style={{ borderColor: colors['border-secondary'] }}
                className="mt-6 border rounded-lg overflow-hidden"
              >
                {/* Table header */}
                <div
                  style={{
                    backgroundColor: colors['bg-secondary'],
                    color: colors['text-tertiary'],
                  }}
                  className="grid grid-cols-12 gap-4 px-6 py-3 text-sm font-medium"
                >
                  <div className="col-span-4">Name</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-4">Email address</div>
                  <div className="col-span-2">Teams</div>
                </div>

                {/* Table content would go here */}
                {/* This would be populated with actual team member data */}
              </div>
            </div>
          )}

          {activeTab === 'Plan' && (
            <div className="flex flex-col justify-center items-center">
              <div className="flex w-full justify-center">
                {/* Billing Toggle */}
                <div
                  style={{
                    backgroundColor: colors['bg-secondary'],
                    borderColor: colors['border-secondary'],
                  }}
                  className="inline-flex rounded-lg border p-1 mb-12"
                >
                  <button
                    onClick={() => handleBillingPeriodChange('monthly')}
                    disabled={isUpdatingBillingPeriod}
                    style={{
                      backgroundColor:
                        billingPeriod === 'monthly'
                          ? colors['bg-primary']
                          : 'transparent',
                      borderColor:
                        billingPeriod === 'monthly'
                          ? colors['border-primary']
                          : 'transparent',
                      color:
                        billingPeriod === 'monthly'
                          ? colors['text-primary']
                          : colors['text-tertiary'],
                    }}
                    className="px-4 py-2 rounded-lg transition-all text-sm font-medium border"
                  >
                    Monthly billing
                  </button>
                  <button
                    onClick={() => handleBillingPeriodChange('annual')}
                    disabled={isUpdatingBillingPeriod}
                    style={{
                      backgroundColor:
                        billingPeriod === 'annual'
                          ? colors['bg-primary']
                          : 'transparent',
                      borderColor:
                        billingPeriod === 'annual'
                          ? colors['border-primary']
                          : 'transparent',
                      color:
                        billingPeriod === 'annual'
                          ? colors['text-primary']
                          : colors['text-tertiary'],
                    }}
                    className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium border"
                  >
                    Annual billing
                    <span
                      style={{
                        backgroundColor: colors['bg-brand-primary'],
                        color: colors['text-brand-primary'],
                        borderColor: colors['border-brand'],
                      }}
                      className="text-xs px-3 py-0.5 rounded-full border"
                    >
                      Save 20%
                    </span>
                  </button>
                </div>
              </div>
              {/* Pricing Cards */}
              <div className="grid md:grid-cols-2 gap-8 w-fit">
                {/* Free Plan */}
                <div
                  style={{
                    backgroundColor: colors['bg-primary'],
                    borderColor: colors['border-primary'],
                  }}
                  className="border rounded-xl p-8 shadow-sm flex flex-col"
                >
                  <div className="mb-8">
                    <h2
                      style={{ color: colors['text-primary'] }}
                      className="text-2xl font-semibold mb-2"
                    >
                      {PLAN_DATA.free.name}
                    </h2>
                    <div
                      style={{ color: colors['text-primary'] }}
                      className="text-2xl font-bold"
                    >
                      {PLAN_DATA.free.price}
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {PLAN_DATA.free.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/blue-check.svg`}
                          alt="check"
                          className="w-5 h-5"
                        />
                        <span
                          style={{ color: colors['text-tertiary'] }}
                          className="text-base font-normal"
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto">
                    <ButtonNormal
                      variant="secondary"
                      size="small"
                      className="w-full"
                      disabled={isLoadingPlan || currentPlan === 'free'}
                      onClick={
                        currentPlan !== 'free'
                          ? handleDowngradeClick
                          : undefined
                      }
                    >
                      {isLoadingPlan
                        ? 'Loading...'
                        : currentPlan === 'free'
                          ? 'Current plan'
                          : 'Downgrade to Free'}
                    </ButtonNormal>
                  </div>
                </div>

                {/* Early Adopter Plan */}
                <div
                  style={{
                    backgroundColor: colors['bg-primary'],
                    borderColor: colors['border-primary'],
                  }}
                  className="border rounded-xl p-8 shadow-sm relative"
                >
                  {currentPlan === 'earlyAdopter' &&
                    subscriptionStatus === 'ACTIVE' && (
                      <div
                        style={{
                          backgroundColor: colors['bg-brand-primary'],
                          color: colors['text-brand-primary'],
                          borderColor: colors['border-brand'],
                        }}
                        className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-medium border"
                      >
                        Current plan
                      </div>
                    )}

                  <div className="mb-8">
                    <h2
                      style={{ color: colors['text-primary'] }}
                      className="text-2xl font-semibold mb-2"
                    >
                      {PLAN_DATA.earlyAdopter.name}
                    </h2>
                    <div
                      style={{ color: colors['text-primary'] }}
                      className="text-2xl font-bold"
                    >
                      {billingPeriod === 'monthly'
                        ? PLAN_DATA.earlyAdopter.monthly.price
                        : PLAN_DATA.earlyAdopter.annual.price}
                      <span
                        style={{ color: colors['text-tertiary'] }}
                        className="text-sm font-normal ml-2"
                      >
                        {billingPeriod === 'monthly'
                          ? PLAN_DATA.earlyAdopter.monthly.period
                          : PLAN_DATA.earlyAdopter.annual.period}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {PLAN_DATA.earlyAdopter.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/blue-check.svg`}
                          alt="check"
                          className="w-5 h-5"
                        />
                        <span
                          style={{ color: colors['text-tertiary'] }}
                          className="text-base font-normal"
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {currentPlan === 'earlyAdopter' &&
                  subscriptionStatus === 'ACTIVE' ? (
                    // If they're already on this plan, show an upgrade/downgrade button based on billing period
                    <ButtonNormal
                      variant="primary"
                      size="small"
                      className="w-full mt-4"
                      onClick={() => handlePlanButtonClick('earlyAdopter')}
                      disabled={
                        currentBillingType === billingPeriod ||
                        isUpdatingBillingPeriod
                      }
                    >
                      {isUpdatingBillingPeriod
                        ? 'Updating...'
                        : getPlanButtonText(
                            'earlyAdopter',
                            currentBillingType,
                            billingPeriod
                          )}
                    </ButtonNormal>
                  ) : (
                    // If they're not on this plan, show a checkout button
                    <CheckoutButton
                      priceId={
                        billingPeriod === 'monthly'
                          ? PLAN_DATA.earlyAdopter.monthly.priceId
                          : PLAN_DATA.earlyAdopter.annual.priceId
                      }
                      isCurrentPlan={false}
                      variant="primary"
                      size="small"
                      fullWidth
                    >
                      {isLoadingPlan
                        ? 'Loading...'
                        : getPlanButtonText('free', null, billingPeriod)}
                    </CheckoutButton>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Billing' && (
            <div className="flex flex-col gap-10 min-h-full">
              {/* Header */}
              <div className="px-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-wrap items-start gap-4">
                      <div className="flex-1 min-w-[320px] flex flex-col gap-1">
                        <h2
                          style={{ color: colors['text-primary'] }}
                          className="text-[30px] font-semibold leading-[38px]"
                        >
                          Billing
                        </h2>
                        <p
                          style={{ color: colors['text-tertiary'] }}
                          className="text-base leading-6"
                        >
                          Manage your billing and payment details.
                        </p>
                      </div>
                    </div>
                    <div
                      style={{ backgroundColor: colors['border-secondary'] }}
                      className="h-px w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Current Plan Overview */}
              <div className="px-8">
                <div className="flex flex-col gap-4">
                  <div
                    style={{
                      backgroundColor: colors['bg-secondary'],
                      borderColor: colors['border-secondary'],
                    }}
                    className="w-full rounded-xl border p-6"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1 pt-1">
                        <div className="flex items-center gap-2">
                          <h3
                            style={{ color: colors['text-primary'] }}
                            className="text-lg font-semibold leading-7"
                          >
                            {currentPlan === 'earlyAdopter'
                              ? 'Early Adopter'
                              : 'Free Plan'}
                          </h3>
                          {currentPlan === 'earlyAdopter' &&
                            subscriptionStatus === 'ACTIVE' && (
                              <div
                                style={{
                                  backgroundColor: colors['bg-brand-primary'],
                                  color: colors['text-brand-primary'],
                                  borderColor: colors['border-brand'],
                                }}
                                className="px-1.5 py-0.5 text-xs font-medium rounded-md border"
                              >
                                Current plan
                              </div>
                            )}
                        </div>
                        <p
                          style={{ color: colors['text-tertiary'] }}
                          className="text-sm leading-5"
                        >
                          {currentPlan === 'earlyAdopter'
                            ? currentBillingType === 'annual'
                              ? '$12 per user/mo, billed annually'
                              : '$15 per user/mo, billed monthly'
                            : 'Free forever'}
                        </p>
                      </div>
                      <div className="flex gap-16">
                        <div className="flex flex-col gap-1 items-end pt-1">
                          <p
                            style={{ color: colors['text-tertiary'] }}
                            className="text-sm font-medium leading-5"
                          >
                            Users
                          </p>
                          <div className="flex items-center gap-2">
                            <span
                              style={{ color: colors['text-primary'] }}
                              className="text-lg font-semibold leading-7"
                            >
                              {subscriptionData?.users?.length || 0}
                            </span>
                          </div>
                        </div>
                        {currentPlan === 'earlyAdopter' &&
                          subscriptionStatus === 'ACTIVE' && (
                            <div className="flex flex-col gap-1 items-end pt-1">
                              <p
                                style={{ color: colors['text-tertiary'] }}
                                className="text-sm font-medium leading-5"
                              >
                                Next renewal
                              </p>
                              <div className="flex items-center gap-2">
                                <span
                                  style={{ color: colors['text-primary'] }}
                                  className="text-lg font-semibold leading-7"
                                >
                                  $
                                  {nextPaymentAmount
                                    ? (nextPaymentAmount / 100).toLocaleString()
                                    : '0'}{' '}
                                  on{' '}
                                  {subscriptionEnd
                                    ? new Date(
                                        subscriptionEnd
                                      ).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })
                                    : 'N/A'}
                                </span>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Details */}
              <div className="px-8">
                <div className="flex flex-col gap-6">
                  <h3
                    style={{ color: colors['text-primary'] }}
                    className="text-lg font-semibold leading-7"
                  >
                    Billing Details
                  </h3>
                  <div className="flex flex-col gap-4">
                    {/* Personal Info */}
                    <BillingInfoForm workspaceId={workspace?.id || 0} isFreePlan={currentPlan === 'free'} />
                  </div>
                </div>
              </div>

              {/* Invoices */}
              <div className="px-8">
                <div className="flex flex-col gap-6">
                  <h3
                    style={{ color: colors['text-primary'] }}
                    className="text-lg font-semibold leading-7"
                  >
                    Invoices
                  </h3>

                  {/* Invoices Table */}
                  {Boolean(
                    invoicesData?.invoices && invoicesData.invoices.length > 0
                  ) ? (
                    <div
                      style={{
                        backgroundColor: colors['bg-secondary'],
                        borderColor: colors['border-secondary'],
                      }}
                      className="w-full rounded-xl border overflow-hidden"
                    >
                      {/* Table Header */}
                      <div
                        style={{
                          borderColor: colors['border-secondary'],
                        }}
                        className="grid grid-cols-[1fr,1fr,1fr,1fr,auto] gap-4 border-b px-6"
                      >
                        <div className="py-3">
                          <span
                            style={{ color: colors['text-tertiary'] }}
                            className="text-sm font-medium"
                          >
                            Invoice n°
                          </span>
                        </div>
                        <div className="py-3">
                          <span
                            style={{ color: colors['text-tertiary'] }}
                            className="text-sm font-medium"
                          >
                            Billing date
                          </span>
                        </div>
                        <div className="py-3">
                          <span
                            style={{ color: colors['text-tertiary'] }}
                            className="text-sm font-medium"
                          >
                            Amount
                          </span>
                        </div>
                        <div className="py-3">
                          <span
                            style={{ color: colors['text-tertiary'] }}
                            className="text-sm font-medium"
                          >
                            Subscription
                          </span>
                        </div>
                        <div className="py-3 w-[100px]"></div>
                      </div>

                      {/* Table Body */}
                      {invoicesData?.invoices
                        .filter(
                          (invoice) =>
                            invoice.number && invoice.created && invoice.amount
                        )
                        .map((invoice) => (
                          <div
                            key={invoice.id}
                            style={{
                              borderColor: colors['border-secondary'],
                            }}
                            className="grid grid-cols-[1fr,1fr,1fr,1fr,auto] gap-4 border-b px-6 items-center hover:bg-[rgba(255,255,255,0.02)]"
                          >
                            <div className="py-3">
                              <span
                                style={{ color: colors['text-primary'] }}
                                className="text-sm font-medium"
                              >
                                {invoice.number}
                              </span>
                            </div>
                            <div className="py-3">
                              <span
                                style={{ color: colors['text-tertiary'] }}
                                className="text-sm"
                              >
                                {new Date(
                                  invoice.created * 1000
                                ).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            <div className="py-3">
                              <span
                                style={{ color: colors['text-tertiary'] }}
                                className="text-sm"
                              >
                                {invoice.currency.toUpperCase()}{' '}
                                {(invoice.amount / 100).toFixed(2)}
                              </span>
                            </div>
                            <div className="py-3">
                              <span
                                style={{ color: colors['text-tertiary'] }}
                                className="text-sm"
                              >
                                {invoice.plan}
                              </span>
                            </div>
                            <div className="py-3 w-[100px]">
                              <button
                                style={{ color: colors['text-primary'] }}
                                className="text-sm font-medium hover:opacity-80"
                                onClick={() =>
                                  window.open(invoice.hostedUrl, '_blank')
                                }
                              >
                                View
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        backgroundColor: colors['bg-secondary'],
                        borderColor: colors['border-secondary'],
                        color: colors['text-tertiary'],
                      }}
                      className="w-full rounded-xl border p-8 text-center"
                    >
                      {invoicesError
                        ? 'Failed to load invoices. Please try again later.'
                        : 'No invoices found.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Appearance' && (
            <div className="px-8">
              <div className="mb-6">
                <h2
                  style={{ color: colors['text-primary'] }}
                  className="text-lg font-semibold mb-1"
                >
                  Theme
                </h2>
                <p
                  style={{ color: colors['text-tertiary'] }}
                  className="text-sm"
                >
                  Customize your UI theme
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-3xl">
                {/* Light Theme Option */}
                <div
                  className="relative cursor-pointer group"
                  onClick={() => setTheme('light' as ThemeMode)}
                >
                  <div
                    style={{
                      backgroundColor: colors['bg-primary'],
                      borderColor:
                        currentTheme === 'light'
                          ? colors['text-accent']
                          : colors['border-secondary'],
                    }}
                    className="aspect-[4/3] rounded-xl border-2 overflow-hidden transition-all duration-200 hover:border-[#4761c4]"
                  >
                    <div className="w-full h-full p-2">
                      <div className="w-full h-full rounded-lg bg-[#F9FAFB] overflow-hidden">
                        <div className="h-2 w-8 bg-[#D0D5DD] rounded-full m-2"></div>
                        <div className="space-y-1 px-2">
                          <div className="h-1 w-3/4 bg-[#D0D5DD] rounded-full"></div>
                          <div className="h-1 w-1/2 bg-[#D0D5DD] rounded-full"></div>
                          <div className="h-1 w-2/3 bg-[#D0D5DD] rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {currentTheme === 'light' && (
                    <div className="absolute -right-1 -top-1">
                      <div
                        style={{
                          backgroundColor: colors['bg-primary'],
                          borderColor: colors['border-primary'],
                        }}
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                      >
                        <div className="w-4 h-4 rounded-full bg-[#4761c4] flex items-center justify-center">
                          <img
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-white.svg`}
                            alt="Selected"
                            className="w-3 h-3"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <p
                    style={{ color: colors['text-primary'] }}
                    className="mt-2 text-sm font-medium text-center"
                  >
                    Light
                  </p>
                </div>

                {/* Dark Theme Option */}
                <div
                  className="relative cursor-pointer group"
                  onClick={() => setTheme('dark' as ThemeMode)}
                >
                  <div
                    style={{
                      backgroundColor: colors['bg-primary'],
                      borderColor:
                        currentTheme === 'dark'
                          ? colors['text-accent']
                          : colors['border-secondary'],
                    }}
                    className="aspect-[4/3] rounded-xl border-2 overflow-hidden transition-all duration-200 hover:border-[#4761c4]"
                  >
                    <div className="w-full h-full p-2">
                      <div className="w-full h-full rounded-lg bg-[#1C1C1C] overflow-hidden">
                        <div className="h-2 w-8 bg-[#2C2C2C] rounded-full m-2"></div>
                        <div className="space-y-1 px-2">
                          <div className="h-1 w-3/4 bg-[#2C2C2C] rounded-full"></div>
                          <div className="h-1 w-1/2 bg-[#2C2C2C] rounded-full"></div>
                          <div className="h-1 w-2/3 bg-[#2C2C2C] rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {currentTheme === 'dark' && (
                    <div className="absolute -right-1 -top-1">
                      <div
                        style={{
                          backgroundColor: colors['bg-primary'],
                          borderColor: colors['border-primary'],
                        }}
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                      >
                        <div className="w-4 h-4 rounded-full bg-[#4761c4] flex items-center justify-center">
                          <img
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-white.svg`}
                            alt="Selected"
                            className="w-3 h-3"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <p
                    style={{ color: colors['text-primary'] }}
                    className="mt-2 text-sm font-medium text-center"
                  >
                    Dark
                  </p>
                </div>

                {/* System Theme Option */}
                <div
                  className="relative cursor-pointer group hidden"
                  onClick={() => setTheme('system' as ThemeMode)}
                >
                  <div
                    style={{
                      backgroundColor: colors['bg-primary'],
                      borderColor:
                        currentTheme === 'system'
                          ? colors['text-accent']
                          : colors['border-secondary'],
                    }}
                    className="aspect-[4/3] rounded-xl border-2 overflow-hidden transition-all duration-200 hover:border-[#4761c4]"
                  >
                    <div className="w-full h-full p-2">
                      <div className="w-full h-full rounded-lg overflow-hidden grid grid-cols-2 gap-1">
                        <div className="bg-[#F9FAFB] overflow-hidden">
                          <div className="h-1.5 w-6 bg-[#D0D5DD] rounded-full m-1.5"></div>
                          <div className="space-y-0.5 px-1.5">
                            <div className="h-0.5 w-3/4 bg-[#D0D5DD] rounded-full"></div>
                            <div className="h-0.5 w-1/2 bg-[#D0D5DD] rounded-full"></div>
                            <div className="h-0.5 w-2/3 bg-[#D0D5DD] rounded-full"></div>
                          </div>
                        </div>
                        <div className="bg-[#1C1C1C] overflow-hidden">
                          <div className="h-1.5 w-6 bg-[#2C2C2C] rounded-full m-1.5"></div>
                          <div className="space-y-0.5 px-1.5">
                            <div className="h-0.5 w-3/4 bg-[#2C2C2C] rounded-full"></div>
                            <div className="h-0.5 w-1/2 bg-[#2C2C2C] rounded-full"></div>
                            <div className="h-0.5 w-2/3 bg-[#2C2C2C] rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {currentTheme === 'system' && (
                    <div className="absolute -right-1 -top-1">
                      <div
                        style={{
                          backgroundColor: colors['bg-primary'],
                          borderColor: colors['border-primary'],
                        }}
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                      >
                        <div className="w-4 h-4 rounded-full bg-[#4761c4] flex items-center justify-center">
                          <img
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-white.svg`}
                            alt="Selected"
                            className="w-3 h-3"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <p
                    style={{ color: colors['text-primary'] }}
                    className="mt-2 text-sm font-medium text-center"
                  >
                    System
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Downgrade Confirmation Modal */}
        {showDowngradeConfirmation && (
          <Modal
            title="Downgrade to Free Plan"
            subtitle="You'll still have access to Premium features until the end of your current billing period"
            onClose={() => setShowDowngradeConfirmation(false)}
            showHeaderSeparator={true}
            actions={
              <div className="flex justify-end gap-3 w-full">
                <ButtonNormal
                  variant="secondary"
                  size="small"
                  onClick={() => setShowDowngradeConfirmation(false)}
                >
                  Cancel
                </ButtonNormal>
                <ButtonNormal
                  variant="primary"
                  size="small"
                  onClick={handleConfirmDowngrade}
                  disabled={isLoadingPlan}
                >
                  {isLoadingPlan ? 'Downgrading...' : 'Confirm Downgrade'}
                </ButtonNormal>
              </div>
            }
          >
            <div className="space-y-4 py-2">
              <p style={{ color: colors['text-secondary'] }}>
                By downgrading to the Free plan, you'll lose access to:
              </p>
              <ul
                className="list-disc pl-5 space-y-2"
                style={{ color: colors['text-secondary'] }}
              >
                <li>Unlimited conditional processes</li>
                <li>Early access to new features</li>
                <li>Branded processes & exports</li>
                <li>Priority support from the founders</li>
                <li>ProcessFlow branding removal</li>
              </ul>
              <p
                style={{ color: colors['text-secondary'] }}
                className="font-semibold"
              >
                You'll continue to have access to Premium features until the end
                of your current billing period.
              </p>
            </div>
          </Modal>
        )}

        {/* Plan Change Confirmation Modal */}
        {showPlanChangeConfirmation && (
          <Modal
            title={
              pendingBillingPeriod === 'annual'
                ? 'Upgrade to Annual Billing'
                : 'Switch to Monthly Billing'
            }
            subtitle={
              pendingBillingPeriod === 'annual'
                ? 'You will be upgrading from monthly to annual billing'
                : 'You will be switching from annual to monthly billing'
            }
            onClose={() => setShowPlanChangeConfirmation(false)}
            showHeaderSeparator={true}
            actions={
              <div className="flex justify-end gap-3 w-full">
                <ButtonNormal
                  variant="secondary"
                  size="small"
                  onClick={() => setShowPlanChangeConfirmation(false)}
                >
                  Cancel
                </ButtonNormal>
                <ButtonNormal
                  variant="primary"
                  size="small"
                  onClick={confirmPlanChange}
                  disabled={isUpdatingBillingPeriod}
                >
                  {isUpdatingBillingPeriod ? (
                    'Confirming...'
                  ) : pendingBillingPeriod === 'annual' ? (
                    <div className="flex items-center gap-1">
                      <span>Confirm Upgrade</span>
                      <span
                        style={{
                          backgroundColor: colors['bg-brand-primary'],
                          color: colors['text-brand-primary'],
                          borderColor: colors['border-brand'],
                        }}
                        className="text-xs px-2 py-0.5 rounded-full border"
                      >
                        Save 20%
                      </span>
                    </div>
                  ) : (
                    'Confirm Change'
                  )}
                </ButtonNormal>
              </div>
            }
          >
            <div className="space-y-4 py-2">
              {pendingBillingPeriod === 'annual' ? (
                <>
                  <p style={{ color: colors['text-secondary'] }}>
                    By upgrading to annual billing, you'll benefit from:
                  </p>
                  <ul
                    className="list-disc pl-5 space-y-2"
                    style={{ color: colors['text-secondary'] }}
                  >
                    <li>
                      <strong>20% savings</strong> compared to monthly billing
                    </li>
                    <li>
                      Your subscription will be charged{' '}
                      <strong>annually</strong> instead of monthly
                    </li>
                    <li>
                      Your new price will be{' '}
                      <strong>
                        {PLAN_DATA.earlyAdopter.annual.price} per user/month
                      </strong>
                      , billed annually
                    </li>
                    <li>
                      The change will take effect at the start of your next
                      billing cycle
                    </li>
                  </ul>
                  <p
                    style={{ color: colors['text-secondary'] }}
                    className="font-semibold"
                  >
                    You will continue to have access to all Early Adopter
                    features during this transition.
                  </p>
                </>
              ) : (
                <>
                  <p style={{ color: colors['text-secondary'] }}>
                    By switching to monthly billing:
                  </p>
                  <ul
                    className="list-disc pl-5 space-y-2"
                    style={{ color: colors['text-secondary'] }}
                  >
                    <li>
                      Your subscription will be charged <strong>monthly</strong>{' '}
                      instead of annually
                    </li>
                    <li>
                      Your new price will be{' '}
                      <strong>
                        {PLAN_DATA.earlyAdopter.monthly.price} per user/month
                      </strong>
                    </li>
                    <li>You'll no longer receive the 20% annual discount</li>
                    <li>
                      The change will take effect at the end of your current
                      annual billing period
                    </li>
                    <li>
                      No refunds will be issued for the remaining time on your
                      annual plan
                    </li>
                  </ul>
                  <p
                    style={{ color: colors['text-secondary'] }}
                    className="font-semibold"
                  >
                    You will continue to have access to all Early Adopter
                    features during this transition.
                  </p>
                </>
              )}
            </div>
          </Modal>
        )}
      </div>
    </WorkspaceProvider>
  );
}
