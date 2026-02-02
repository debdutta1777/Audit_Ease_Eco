import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, ArrowUpRight, Shield, Activity, TrendingUp, Leaf } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { HealthScoreGauge } from '@/components/dashboard/HealthScoreGauge';
import { LiabilityCounter } from '@/components/dashboard/LiabilityCounter';
import { RiskClusterChart } from '@/components/dashboard/RiskClusterChart';
import { RecentAuditCard } from '@/components/dashboard/RecentAuditCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import type { Tables } from '@/integrations/supabase/types';

// Audit type with joined document info
interface AuditWithDocuments extends Tables<'audits'> {
  standard?: { name: string } | null;
  subject?: { name: string } | null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { subscription, auditsRemaining, isPaidPlan, isLoading: subLoading } = useSubscription();
  const [audits, setAudits] = useState<AuditWithDocuments[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ healthScore: 0, totalLiability: 0, auditCount: 0 });

  const fetchAudits = useCallback(async () => {
    const { data } = await supabase
      .from('audits')
      .select(`*, standard:documents!audits_standard_document_id_fkey(name), subject:documents!audits_subject_document_id_fkey(name)`)
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setAudits(data);
      const completed = data.filter(a => a.status === 'completed');
      if (completed.length > 0) {
        const avgHealth = completed.reduce((acc, a) => acc + (a.health_score || 0), 0) / completed.length;
        const totalLiab = completed.reduce((acc, a) => acc + (Number(a.total_liability_usd) || 0), 0);
        setStats({
          healthScore: Math.round(avgHealth),
          totalLiability: totalLiab,
          auditCount: data.length
        });
      }
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (user) fetchAudits();
  }, [user, fetchAudits]);

  const mockRiskData = [
    { name: 'Data Privacy', value: 40 },
    { name: 'Liability', value: 25 },
    { name: 'Termination', value: 20 },
    { name: 'IP Rights', value: 15 },
  ];

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        {/* Welcome Hero Section */}
        {/* Welcome Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-transparent border border-emerald-500/20 p-8 md:p-12 animate-fade-in">
          {/* Decorative background elements */}
          <div className="absolute right-0 top-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl filter" />
          <div className="absolute left-0 bottom-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-green-500/20 blur-3xl filter" />

          <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                Good evening,{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                  {user?.email?.split('@')[0]}
                </span>
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Your compliance posture is looking stable. You have{' '}
                {subLoading ? (
                  <span className="font-semibold text-foreground">...</span>
                ) : isPaidPlan ? (
                  <span className="font-semibold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent animate-pulse">
                    unlimited audits
                  </span>
                ) : (
                  <span className="font-semibold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                    {auditsRemaining} of {subscription?.free_audits_limit || 10} free audits
                  </span>
                )}{' '}
                {!isPaidPlan && 'remaining'}.
              </p>
            </div>
            <Link to="/audit/new">
              <Button
                size="lg"
                className="group relative overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 to-green-600 px-8 text-lg font-semibold shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105"
              >
                <span className="relative z-10 flex items-center">
                  <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" />
                  Start New Audit
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 opacity-0 transition-opacity group-hover:opacity-100" />
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
          </div>
        ) : audits.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-muted-foreground/25 bg-card/50 p-12 text-center">
            <div className="mb-6 rounded-full bg-primary/10 p-4">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">No audits yet</h2>
            <p className="mb-8 max-w-sm text-muted-foreground">Get started by uploading your first contract for AI-powered compliance analysis.</p>
            <Link to="/audit/new">
              <Button size="lg" className="rounded-full">Run Your First Audit</Button>
            </Link>
          </div>
        ) : (
          <div className="animate-slide-up grid gap-6 lg:grid-cols-3">
            {/* Towards a Sustainable Future - Unified Section */}
            <div className="glass-card relative overflow-hidden rounded-3xl p-6 lg:col-span-3 border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/5">

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 p-2 shadow-lg shadow-emerald-500/20">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-foreground">Towards a Sustainable Future</h3>
                  <p className="text-sm text-muted-foreground">Track your organization's ecological footprint</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {/* 1. The Shield / Badge Section (Prominently at the top/left) */}
                <div className="lg:col-span-3 bg-card/40 rounded-xl p-5 border border-emerald-500/10 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
                  <div className="absolute top-0 right-0 p-24 bg-emerald-500/10 blur-3xl rounded-full -mr-12 -mt-12 pointer-events-none" />

                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    {/* Shield Icon */}
                    <div className="relative">
                      <div className="h-20 w-20 md:h-24 md:w-24 bg-gradient-to-b from-emerald-400 to-teal-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30 ring-4 ring-white/10 relative z-10">
                        <Shield className="h-10 w-10 md:h-12 md:w-12 text-white fill-emerald-500/20" />
                        <div className="absolute -bottom-2 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm border border-emerald-500/30 text-emerald-600">
                          LVL {Math.floor(stats.auditCount / 10) + 1}
                        </div>
                      </div>
                      {/* Glow effect behind shield */}
                      <div className="absolute inset-0 bg-emerald-500/40 blur-2xl -z-10" />
                    </div>

                    {/* Progress & Info */}
                    <div className="flex-1 w-full text-center md:text-left space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <h4 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                            Sustainability Champion
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {stats.auditCount >= 100 ? "Maximum Impact Achieved" : "Your journey to a greener planet"}
                          </p>
                        </div>
                        {stats.auditCount >= 100 ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-lg animate-pulse">
                            💎 15% Lifetime Discount
                          </span>
                        ) : stats.auditCount >= 50 ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg animate-pulse">
                            🏆 10% Discount Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            🔒 Next Reward: 10% Off
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          <span>Current Progress</span>
                          <span>{stats.auditCount >= 100 ? '100+' : stats.auditCount % 50} / 50 Audits</span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 via-green-400 to-teal-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)] relative"
                            style={{
                              width: `${stats.auditCount >= 100 ? 100 : ((stats.auditCount % 50) / 50) * 100}%`
                            }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {stats.auditCount >= 100
                            ? "You are a top-tier sustainability leader!"
                            : `Complete ${50 - (stats.auditCount % 50)} more audits to unlock your next reward.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Environmental Metrics (Below/Grid) */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/50 dark:bg-card/40 border border-emerald-100 dark:border-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/5 transition-all">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-2">
                    <Leaf className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {(stats.auditCount * 0.45).toFixed(2)}
                  </span>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">Trees Saved</p>
                </div>

                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/50 dark:bg-card/40 border border-cyan-100 dark:border-cyan-500/10 hover:shadow-lg hover:shadow-cyan-500/5 transition-all">
                  <div className="h-10 w-10 rounded-full bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center mb-2">
                    <TrendingUp className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                    {(stats.auditCount * 12.5).toFixed(1)} kg
                  </span>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">CO₂ Prevented</p>
                </div>

                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/50 dark:bg-card/40 border border-blue-100 dark:border-blue-500/10 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mb-2">
                    <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.auditCount * 450} L
                  </span>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">Water Conserved</p>
                </div>

              </div>
            </div>

            {/* Health Score Card - Large (2 cols on large screens) */}
            <div className="glass-card relative overflow-hidden rounded-3xl p-6 lg:col-span-1 border-primary/20 bg-gradient-to-b from-card/80 to-card/40">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Health Score</h3>
                </div>
                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
                  +2.5% vs last week
                </span>
              </div>
              <div className="flex flex-col items-center justify-center py-4">
                <HealthScoreGauge score={stats.healthScore} />
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Based on {stats.auditCount} active audits
                </p>
              </div>
            </div>

            {/* Liability Exposure Card */}
            <div className="glass-card relative overflow-hidden rounded-3xl p-6 lg:col-span-1 border-destructive/20 bg-gradient-to-b from-card/80 to-card/40">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-destructive/10 p-2">
                    <TrendingUp className="h-5 w-5 text-destructive" />
                  </div>
                  <h3 className="font-semibold text-foreground">Liability Exposure</h3>
                </div>
              </div>
              <div className="flex h-full flex-col justify-center pb-8">
                <LiabilityCounter amount={stats.totalLiability} planTier={subscription?.plan_tier || 'free'} />
                <p className="mt-2 text-center text-sm text-muted-foreground">Potential financial risk detected</p>
              </div>
            </div>

            {/* Risk Distribution Card */}
            <div className="glass-card relative overflow-hidden rounded-3xl p-6 lg:col-span-1 border-border/50 bg-gradient-to-b from-card/80 to-card/40">
              <div className="mb-4 flex items-center gap-2">
                <div className="rounded-lg bg-orange-500/10 p-2">
                  <Shield className="h-5 w-5 text-orange-500" />
                </div>
                <h3 className="font-semibold text-foreground">Risk Categories</h3>
              </div>
              <RiskClusterChart data={mockRiskData} />
            </div>

            {/* Recent Audits List - Full Width */}
            <div className="lg:col-span-3">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
                <Link to="/vault" className="group flex items-center text-sm font-medium text-primary hover:text-primary/80">
                  View All Documents
                  <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {audits.map((audit) => (
                  <RecentAuditCard
                    key={audit.id}
                    id={audit.id}
                    standardName={audit.standard?.name || 'Unknown'}
                    subjectName={audit.subject?.name || 'Unknown'}
                    healthScore={audit.health_score}
                    status={audit.status}
                    createdAt={audit.created_at}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout >
  );
}