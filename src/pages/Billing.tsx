import { useState } from 'react';
import { Check, Star, Lock, Users, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';

export default function Billing() {
    const [loading, setLoading] = useState<string | null>(null);
    const [isAnnual, setIsAnnual] = useState(false);
    const { subscription, upgradePlan, refreshSubscription } = useSubscription();

    const handleSubscribe = async (planId: string) => {
        if (planId === 'starter') {
            toast.info('You are already on the free plan');
            return;
        }

        setLoading(planId);
        try {
            const planTier = planId as 'professional' | 'enterprise';
            await upgradePlan(planTier, isAnnual ? 'annual' : 'monthly');

            toast.success(`Successfully upgraded to ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan!`, {
                description: isAnnual ? 'Annual billing activated' : 'Monthly billing activated',
            });

            await refreshSubscription();
        } catch (error) {
            console.error('Upgrade error:', error);
            toast.error('Failed to upgrade plan', {
                description: error instanceof Error ? error.message : 'Please try again later',
            });
        } finally {
            setLoading(null);
        }
    };

    const currentPlanId = subscription?.plan_tier === 'professional' ? 'pro' :
        subscription?.plan_tier === 'enterprise' ? 'enterprise' : 'starter';

    const plans = [
        {
            id: 'starter',
            name: 'Starter',
            monthlyPrice: 0,
            description: 'Essential compliance tools for small teams.',
            features: ['10 Free Audits', 'Basic Compliance Standards', 'PDF Export', 'Email Support'],
            current: currentPlanId === 'starter',
            popular: false,
        },
        {
            id: 'pro',
            name: 'Professional',
            monthlyPrice: 49,
            description: 'Advanced AI analysis for growing legal teams.',
            features: [
                'Unlimited Audits',
                'Advanced Gap Analysis',
                'Chat with Contract (AI)',
                'Priority Support',
                'Custom Standards'
            ],
            current: currentPlanId === 'pro',
            popular: true,
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            monthlyPrice: null,
            description: 'Full-scale automation for large organizations.',
            features: [
                'Dedicated Success Manager',
                'API Access',
                'SSO & Advanced Security',
                'Custom AI Model Training',
                'SLA & Audit Logs'
            ],
            current: currentPlanId === 'enterprise',
            popular: false,
        }
    ];

    const getPrice = (monthlyPrice: number | null) => {
        if (monthlyPrice === null) return 'Custom';
        if (monthlyPrice === 0) return '$0';
        if (isAnnual) {
            return `$${Math.round(monthlyPrice * 0.8)}`;
        }
        return `$${monthlyPrice}`;
    };

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto space-y-12 pb-16">
                {/* Header */}
                <div className="text-center space-y-4 animate-slide-up">
                    <span className="inline-block rounded-full border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-5 py-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 shadow-sm">
                        💎 Pricing
                    </span>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                        <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
                            Simple, Transparent
                        </span>
                        {' '}Pricing
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Choose the plan that fits your team's needs. All plans include a 14-day free trial.
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <span className={`text-sm font-semibold transition-colors ${!isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-gray-400'}`}>
                        Monthly
                    </span>
                    <Switch
                        checked={isAnnual}
                        onCheckedChange={setIsAnnual}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-600 data-[state=checked]:to-teal-600"
                    />
                    <span className={`text-sm font-semibold transition-colors ${isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-gray-400'}`}>
                        Annual
                    </span>
                    {isAnnual && (
                        <span className="ml-2 rounded-full bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-500/20 dark:to-green-500/20 border-2 border-emerald-600/60 dark:border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 animate-fade-in shadow-sm">
                            💰 Save 20%
                        </span>
                    )}
                </div>

                {/* Pricing Cards */}
                <div className="grid gap-8 lg:grid-cols-3">
                    {plans.map((plan, i) => (
                        <div
                            key={plan.id}
                            className={`animate-slide-up relative rounded-2xl border-2 p-8 cursor-pointer
                                transition-all duration-300 ease-out
                                hover:scale-105 hover:-translate-y-3
                                ${plan.id === 'starter'
                                    ? 'border-orange-200 dark:border-orange-500/30 bg-gradient-to-br from-orange-50 via-white to-rose-50 dark:from-slate-900/80 dark:to-slate-900/50 hover:border-orange-400 dark:hover:border-orange-400 hover:shadow-[0_20px_50px_rgba(251,146,60,0.3)] dark:hover:shadow-[0_20px_50px_rgba(251,146,60,0.2)]'
                                    : plan.popular
                                        ? 'border-emerald-400 dark:border-emerald-500/50 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 shadow-2xl shadow-emerald-200/60 dark:shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:border-emerald-500 hover:shadow-[0_25px_60px_rgba(16,185,129,0.35)] dark:hover:shadow-[0_20px_60px_rgba(16,185,129,0.3)]'
                                        : 'border-indigo-200 dark:border-indigo-500/30 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900/80 dark:to-slate-900/50 hover:border-indigo-400 dark:hover:border-indigo-400 hover:shadow-[0_20px_50px_rgba(129,140,248,0.3)] dark:hover:shadow-[0_20px_50px_rgba(129,140,248,0.2)]'
                                }`}
                            style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-2xl shadow-emerald-400/50 ring-2 ring-white dark:ring-transparent">
                                        ⭐ Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">{plan.description}</p>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">{getPrice(plan.monthlyPrice)}</span>
                                    {plan.monthlyPrice !== null && plan.monthlyPrice > 0 && (
                                        <span className="text-slate-600 dark:text-gray-400 font-medium">/{isAnnual ? 'month' : 'mo'}</span>
                                    )}
                                </div>
                                {plan.monthlyPrice !== null && plan.monthlyPrice > 0 && isAnnual && (
                                    <p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                        💵 Billed annually (${Math.round(plan.monthlyPrice * 0.8 * 12)}/year)
                                    </p>
                                )}
                            </div>

                            <ul className="mb-8 space-y-3">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm font-medium text-slate-700 dark:text-gray-300">
                                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={`w-full py-6 text-base font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${plan.id === 'starter'
                                    ? 'bg-gradient-to-r from-orange-500 to-rose-500 dark:from-orange-500 dark:to-rose-500 text-white shadow-lg hover:shadow-xl hover:shadow-orange-300/50 dark:hover:shadow-orange-500/30 border-0'
                                    : plan.popular
                                        ? 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white shadow-2xl hover:shadow-[0_10px_40px_rgba(16,185,129,0.5)] dark:hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] border-0'
                                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white shadow-lg hover:shadow-xl hover:shadow-indigo-300/50 dark:hover:shadow-indigo-500/30 border-0'
                                    }`}
                                variant="default"
                                disabled={plan.current || loading === plan.id}
                                onClick={() => !plan.current && handleSubscribe(plan.id)}
                            >
                                {loading === plan.id ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Processing...
                                    </span>
                                ) : plan.current ? (
                                    '✓ Current Plan'
                                ) : plan.id === 'enterprise' ? (
                                    '📞 Contact Sales'
                                ) : (
                                    '🚀 Start Free Trial'
                                )}
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Trust badges */}
                <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-slate-600 dark:text-gray-400 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                    {[
                        { icon: Lock, text: 'SOC 2 Type II Certified' },
                        { icon: Shield, text: 'GDPR Compliant' },
                        { icon: Star, text: '4.9/5 on G2 Reviews' },
                        { icon: Users, text: '24/7 Support' },
                    ].map((badge) => (
                        <div key={badge.text} className="flex items-center gap-2 transition-colors hover:text-slate-900 dark:hover:text-gray-300">
                            <badge.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            {badge.text}
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout >
    );
}
