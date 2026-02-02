import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserSubscription {
    id: string;
    user_id: string;
    plan_tier: 'free' | 'professional' | 'enterprise';
    billing_period: 'monthly' | 'annual' | null;
    free_audits_used: number;
    free_audits_limit: number;
    subscription_status: 'active' | 'cancelled' | 'expired';
    current_period_start: string | null;
    current_period_end: string | null;
    created_at: string;
    updated_at: string;
}

export interface SubscriptionState {
    subscription: UserSubscription | null;
    isLoading: boolean;
    error: Error | null;
    auditsRemaining: number;
    canCreateAudit: boolean;
    isPaidPlan: boolean;
}

export function useSubscription(): SubscriptionState & {
    refreshSubscription: () => Promise<void>;
    upgradePlan: (plan: 'professional' | 'enterprise', billingPeriod: 'monthly' | 'annual') => Promise<void>;
} {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchSubscription = async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('user_subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (fetchError) {
                // If no subscription exists, create a default free tier one
                if (fetchError.code === 'PGRST116') {
                    const { data: newSub, error: insertError } = await supabase
                        .from('user_subscriptions')
                        .insert({ user_id: user.id })
                        .select()
                        .single();

                    if (insertError) throw insertError;
                    setSubscription(newSub);
                } else {
                    throw fetchError;
                }
            } else {
                setSubscription(data);
            }
        } catch (err) {
            setError(err as Error);
            console.error('Error fetching subscription:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const upgradePlan = async (
        plan: 'professional' | 'enterprise',
        billingPeriod: 'monthly' | 'annual'
    ) => {
        if (!user) throw new Error('User not authenticated');

        const { error: updateError } = await supabase
            .from('user_subscriptions')
            .update({
                plan_tier: plan,
                billing_period: billingPeriod,
                subscription_status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(
                    Date.now() + (billingPeriod === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000
                ).toISOString(),
            })
            .eq('user_id', user.id);

        if (updateError) throw updateError;

        await fetchSubscription();
    };

    useEffect(() => {
        fetchSubscription();
    }, [user]);

    const isPaidPlan = subscription?.plan_tier === 'professional' || subscription?.plan_tier === 'enterprise';
    const auditsRemaining = isPaidPlan
        ? Infinity
        : Math.max(0, (subscription?.free_audits_limit || 10) - (subscription?.free_audits_used || 0));
    const canCreateAudit = isPaidPlan || auditsRemaining > 0;

    return {
        subscription,
        isLoading,
        error,
        auditsRemaining,
        canCreateAudit,
        isPaidPlan,
        refreshSubscription: fetchSubscription,
        upgradePlan,
    };
}
