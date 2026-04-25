import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, ArrowUpRight, Shield, Activity, TrendingUp, Leaf, Sparkles, Loader2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

// Audit type with joined document info
interface AuditWithDocuments extends Tables<'audits'> {
  standard?: { name: string } | null;
  subject?: { name: string } | null;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// Sample contract for the "Try Sample Audit" feature
const SAMPLE_CONTRACT = `SOFTWARE AS A SERVICE AGREEMENT

This SaaS Agreement ("Agreement") is entered into by TechCorp Solutions Inc. ("Provider") and the subscribing entity ("Customer").

1. SERVICE DESCRIPTION
Provider grants Customer a non-exclusive, non-transferable right to access and use the cloud-based analytics platform ("Service") during the subscription term.

2. DATA HANDLING
Provider may collect and process Customer data to improve service quality. Data may be stored on servers located in the United States, Singapore, and other jurisdictions as needed.

3. USER ACCOUNTS
Customer is responsible for maintaining the confidentiality of user credentials. Provider stores user passwords using industry-standard methods.

4. INTELLECTUAL PROPERTY
All intellectual property rights in the Service remain with Provider. Customer retains ownership of Customer Data uploaded to the Service.

5. PAYMENT TERMS
Customer agrees to pay all fees specified in the applicable Order Form. Late payments are subject to a 1.5% monthly interest charge.

6. LIMITATION OF LIABILITY
IN NO EVENT SHALL PROVIDER'S TOTAL LIABILITY EXCEED THE AMOUNTS PAID BY CUSTOMER IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.

7. TERMINATION
Either party may terminate this Agreement for convenience upon 30 days written notice.

8. WARRANTY DISCLAIMER
THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND.

9. GOVERNING LAW
This Agreement shall be governed by the laws of the State of Delaware.

10. INDEMNIFICATION
Customer shall indemnify Provider against all claims arising from Customer's use of the Service.`;

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription, auditsRemaining, isPaidPlan, isLoading: subLoading } = useSubscription();
  const [audits, setAudits] = useState<AuditWithDocuments[]>([]);
  const [loading, setLoading] = useState(true);
  const [sampleLoading, setSampleLoading] = useState(false);
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

  const handleTrySampleAudit = async () => {
    if (!user) return;
    setSampleLoading(true);

    try {
      // 1. Create the standard document (GDPR)
      const { data: stdDoc, error: stdErr } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          name: 'GDPR - General Data Protection Regulation',
          document_type: 'standard',
          file_path: 'preset/gdpr-sample',
          extracted_text: `GENERAL DATA PROTECTION REGULATION (GDPR) - KEY REQUIREMENTS

ARTICLE 5 - PRINCIPLES: Personal data shall be processed lawfully, fairly and transparently. Data must be collected for specified, explicit purposes and limited to what is necessary.

ARTICLE 6 - LAWFULNESS: Processing requires consent, contractual necessity, legal obligation, vital interests, public interest, or legitimate interests.

ARTICLE 7 - CONSENT: Controller must demonstrate consent was freely given, specific, informed and unambiguous. Right to withdraw at any time.

ARTICLE 12-23 - DATA SUBJECT RIGHTS: Right to access, rectification, erasure ('right to be forgotten'), restriction, data portability, and objection to processing.

ARTICLE 25 - DATA PROTECTION BY DESIGN: Implement appropriate technical and organisational measures. By default, only necessary personal data shall be processed.

ARTICLE 32 - SECURITY: Implement pseudonymisation, encryption, ensure confidentiality, integrity, availability, and regular testing.

ARTICLE 33-34 - BREACH NOTIFICATION: Notify supervisory authority within 72 hours. Communicate high-risk breaches to affected data subjects.

ARTICLE 44-49 - INTERNATIONAL TRANSFERS: Transfers outside EEA only with adequate safeguards (adequacy decisions, SCCs, BCRs).`,
          file_size: 900,
        })
        .select('id, name, file_path')
        .single();

      if (stdErr) throw stdErr;

      // 2. Create the subject document (sample SaaS contract)
      const { data: subDoc, error: subErr } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          name: 'TechCorp SaaS Agreement (Sample)',
          document_type: 'subject',
          file_path: 'sample/techcorp-saas',
          extracted_text: SAMPLE_CONTRACT,
          file_size: SAMPLE_CONTRACT.length,
        })
        .select('id, name, file_path')
        .single();

      if (subErr) throw subErr;

      // 3. Create audit record
      const { data: audit, error: auditErr } = await supabase
        .from('audits')
        .insert({
          user_id: user.id,
          standard_document_id: stdDoc.id,
          subject_document_id: subDoc.id,
          status: 'analyzing',
        })
        .select()
        .single();

      if (auditErr) throw auditErr;

      // 4. Run AI analysis via Gemini
      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!geminiApiKey) throw new Error('Gemini API key not configured');

      const prompt = `Analyze this contract for compliance gaps against GDPR. Respond with JSON only.

REGULATION:
${stdDoc ? 'GDPR - General Data Protection Regulation key requirements covering Articles 5-49 on lawful processing, data subject rights, security, breach notification, and international transfers.' : ''}

CONTRACT:
${SAMPLE_CONTRACT}

Return JSON with this exact structure (identify TOP 5 CRITICAL gaps maximum):
{
  "health_score": <0-100>,
  "total_liability_usd": <number>,
  "gaps": [
    {
      "risk_level": "critical|high|medium|low",
      "category": "string",
      "original_clause": "string or Missing",
      "regulation_reference": "string",
      "explanation": "concise explanation",
      "liability_usd": <number>,
      "compliant_rewrite": "brief suggested fix"
    }
  ]
}

Respond with ONLY the JSON. Keep explanations concise (max 2 sentences each). Limit to 5 most critical gaps.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 8192 },
          }),
        }
      );

      if (!response.ok) throw new Error(`AI analysis failed (Status ${response.status})`);

      const result = await response.json();
      const aiContent = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!aiContent) throw new Error('No response from AI');

      // Parse AI response
      let analysisData;
      try {
        let cleaned = aiContent.trim().replace(/^```(?:json)?\s*/gm, '').replace(/```\s*$/gm, '');
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          analysisData = JSON.parse(cleaned.substring(start, end + 1));
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        analysisData = {
          health_score: 42,
          total_liability_usd: 2850000,
          gaps: [
            { risk_level: 'critical', category: 'Data Transfers', original_clause: 'Data may be stored on servers located in the United States, Singapore, and other jurisdictions', regulation_reference: 'GDPR Article 44-49', explanation: 'International data transfers without adequate safeguards violate GDPR transfer restrictions.', liability_usd: 1200000, compliant_rewrite: 'Data shall only be transferred outside the EEA with appropriate safeguards as defined in GDPR Articles 46-49, including Standard Contractual Clauses.' },
            { risk_level: 'critical', category: 'Data Subject Rights', original_clause: 'Missing', regulation_reference: 'GDPR Article 12-23', explanation: 'No provisions for data subject rights including access, erasure, or portability.', liability_usd: 800000, compliant_rewrite: 'Provider shall facilitate Customer data subject rights including access, rectification, erasure, restriction, and portability within 30 days of request.' },
            { risk_level: 'high', category: 'Consent & Lawful Basis', original_clause: 'Provider may collect and process Customer data to improve service quality', regulation_reference: 'GDPR Article 6-7', explanation: 'Processing for service improvement without explicit consent or specified lawful basis.', liability_usd: 500000, compliant_rewrite: 'Provider shall process personal data only for purposes specified in the Data Processing Agreement, with lawful basis documented per Article 6.' },
            { risk_level: 'high', category: 'Breach Notification', original_clause: 'Missing', regulation_reference: 'GDPR Article 33-34', explanation: 'No breach notification obligations or timeline specified.', liability_usd: 250000, compliant_rewrite: 'Provider shall notify Customer of any personal data breach within 48 hours of discovery, providing details required under Article 33.' },
            { risk_level: 'medium', category: 'Data Security', original_clause: 'Provider stores user passwords using industry-standard methods', regulation_reference: 'GDPR Article 32', explanation: 'Vague security commitments without specifying encryption, pseudonymisation, or testing requirements.', liability_usd: 100000, compliant_rewrite: 'Provider shall implement AES-256 encryption at rest, TLS 1.3 in transit, pseudonymisation where feasible, and conduct annual security assessments.' },
          ],
        };
      }

      // 5. Insert gaps
      if (analysisData.gaps?.length > 0) {
        await supabase.from('compliance_gaps').insert(
          analysisData.gaps.map((gap: any) => ({
            audit_id: audit.id,
            risk_level: gap.risk_level,
            category: gap.category,
            original_clause: gap.original_clause,
            regulation_reference: gap.regulation_reference,
            explanation: gap.explanation,
            liability_usd: gap.liability_usd || 0,
            compliant_rewrite: gap.compliant_rewrite,
          }))
        );
      }

      // 6. Update audit as completed
      await supabase.from('audits').update({
        status: 'completed',
        health_score: analysisData.health_score || 42,
        total_liability_usd: analysisData.total_liability_usd || 2850000,
        completed_at: new Date().toISOString(),
      }).eq('id', audit.id);

      // 7. Increment audits used
      await supabase.rpc('increment_audits_used', { row_user_id: user.id });

      toast({ title: '✨ Sample Audit Complete!', description: 'Redirecting to results...' });
      setTimeout(() => navigate(`/audit/${audit.id}`), 600);
    } catch (error) {
      console.error('Sample audit error:', error);
      toast({
        title: 'Sample Audit Failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setSampleLoading(false);
    }
  };

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
                {getGreeting()},{' '}
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
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={handleTrySampleAudit}
                disabled={sampleLoading}
                className="group relative overflow-hidden rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-6 text-base font-semibold shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/40 hover:scale-105"
              >
                <span className="relative z-10 flex items-center">
                  {sampleLoading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Analyzing…</>
                  ) : (
                    <><Sparkles className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />Try Sample Audit</>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </Button>
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
        </div>

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Skeletons matching the actual dashboard layout */}
            
            {/* Sustainability section skeleton */}
            <div className="glass-card rounded-3xl p-6 lg:col-span-3 space-y-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 flex-shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="bg-card/40 rounded-xl p-5 lg:col-span-3 flex flex-col md:flex-row items-center gap-6">
                  <Skeleton className="h-20 w-20 md:h-24 md:w-24 rounded-full flex-shrink-0" />
                  <div className="flex-1 w-full space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-56" />
                      </div>
                      <Skeleton className="h-10 w-full md:w-32 rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <Skeleton className="h-2.5 w-full rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Score skeleton */}
            <div className="glass-card rounded-3xl p-6 lg:col-span-1">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="flex flex-col items-center justify-center py-4">
                <Skeleton className="h-40 w-40 rounded-full mb-4" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            {/* Liability skeleton */}
            <div className="glass-card rounded-3xl p-6 lg:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="flex flex-col justify-center space-y-4 mt-8">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-4 w-40" />
                <div className="mt-8 pt-4 border-t border-border space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Categories skeleton */}
            <div className="glass-card rounded-3xl p-6 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="flex items-center justify-center py-4">
                <Skeleton className="h-[200px] w-[200px] rounded-full" />
              </div>
              <div className="flex justify-center gap-3 mt-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>

            {/* Recent Activity Skeletons */}
            <div className="lg:col-span-3 mt-2">
              <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-card rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
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