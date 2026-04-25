import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, FileText, MessageSquare } from 'lucide-react';

/**
 * Animated browser mockup that shows a looping demo of the audit process.
 * Phases:
 *   1. Contract text appearing (typing effect)
 *   2. Risk highlights animating in
 *   3. Health score gauge filling up
 *   4. Gap cards sliding in
 */
export default function HeroDemo() {
  const [phase, setPhase] = useState(0); // 0=idle, 1=typing, 2=scanning, 3=results, 4=hold
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timeline = [
      { phase: 1, delay: 800 },    // Start typing
      { phase: 2, delay: 2500 },   // Start scanning
      { phase: 3, delay: 4500 },   // Show results
      { phase: 4, delay: 8000 },   // Hold results
      { phase: 0, delay: 10500 },  // Reset
    ];

    const timers: NodeJS.Timeout[] = [];
    const runCycle = () => {
      timeline.forEach(({ phase: p, delay }) => {
        timers.push(setTimeout(() => setPhase(p), delay));
      });
      // Restart the cycle
      timers.push(setTimeout(runCycle, 11000));
    };

    runCycle();
    return () => timers.forEach(clearTimeout);
  }, []);

  // Animate progress bar during scanning phase
  useEffect(() => {
    if (phase === 2) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 2, 100));
      }, 30);
      return () => clearInterval(interval);
    }
    if (phase === 3 || phase === 4) {
      setProgress(100);
    }
  }, [phase]);

  const gaps = [
    { risk: 'critical', title: 'Missing Data Subject Rights', ref: 'GDPR Art. 12-23', liability: '$800K' },
    { risk: 'critical', title: 'No Transfer Safeguards', ref: 'GDPR Art. 44-49', liability: '$1.2M' },
    { risk: 'high', title: 'Vague Consent Basis', ref: 'GDPR Art. 6-7', liability: '$500K' },
    { risk: 'medium', title: 'Weak Security Terms', ref: 'GDPR Art. 32', liability: '$100K' },
  ];

  const riskColor = (r: string) =>
    r === 'critical' ? 'bg-red-500' : r === 'high' ? 'bg-orange-500' : 'bg-yellow-500';
  const riskText = (r: string) =>
    r === 'critical' ? 'text-red-400' : r === 'high' ? 'text-orange-400' : 'text-yellow-400';

  return (
    <div className="relative mx-auto mt-16 w-full max-w-4xl animate-slide-up" style={{ animationDelay: '0.5s' }}>
      {/* Glow effect behind the window */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-emerald-500/20 blur-2xl" />
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-emerald-500/30 to-transparent opacity-60" />

      {/* Browser window */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-slate-700/60 bg-slate-800/80 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 mx-8">
            <div className="flex items-center gap-2 rounded-lg bg-slate-700/50 px-3 py-1.5 text-xs text-gray-400">
              <Shield className="h-3 w-3 text-emerald-400" />
              <span>app.auditease.ai/audit/results</span>
              <span className="ml-auto rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-400">Secure</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-5 min-h-[340px] sm:min-h-[380px]">
          {/* Left panel - Contract */}
          <div className="md:col-span-2 border-r border-slate-700/40 p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-medium text-gray-300">TechCorp SaaS Agreement</span>
            </div>

            {/* Contract text with highlights */}
            <div className="space-y-2 text-[10px] sm:text-[11px] leading-relaxed text-gray-500 font-mono">
              <p className={`transition-all duration-500 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <span className="text-gray-400">1. SERVICE DESCRIPTION</span><br />
                Provider grants Customer a non-exclusive right to access the Service...
              </p>
              <p className={`transition-all duration-700 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: '200ms' }}>
                <span className="text-gray-400">2. DATA HANDLING</span><br />
                <span className={`transition-all duration-500 ${phase >= 3 ? 'bg-red-500/20 text-red-300 px-0.5 rounded' : ''}`}>
                  Data may be stored on servers located in the US, Singapore, and other jurisdictions.
                </span>
              </p>
              <p className={`transition-all duration-700 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: '400ms' }}>
                <span className="text-gray-400">3. USER ACCOUNTS</span><br />
                <span className={`transition-all duration-500 ${phase >= 3 ? 'bg-yellow-500/20 text-yellow-300 px-0.5 rounded' : ''}`}>
                  Provider stores passwords using industry-standard methods.
                </span>
              </p>
              <p className={`transition-all duration-700 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: '600ms' }}>
                <span className="text-gray-400">6. LIABILITY</span><br />
                Total liability shall not exceed amounts paid in the preceding 12 months.
              </p>
              <p className={`transition-all duration-700 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`} style={{ transitionDelay: '800ms' }}>
                <span className="text-gray-400">8. WARRANTY</span><br />
                <span className={`transition-all duration-500 ${phase >= 3 ? 'bg-orange-500/20 text-orange-300 px-0.5 rounded' : ''}`}>
                  Service provided "AS IS" without warranty of any kind.
                </span>
              </p>
            </div>
          </div>

          {/* Right panel - Analysis Results */}
          <div className="md:col-span-3 p-4 sm:p-5">
            {/* Scanning overlay */}
            {phase === 2 && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2 text-emerald-400">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-sm font-medium">Analyzing contract against GDPR...</span>
                </div>
                <div className="w-48 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-75"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="mt-2 text-xs text-gray-500">{progress}% complete</span>
              </div>
            )}

            {/* Results header */}
            <div className={`mb-4 flex items-center justify-between transition-all duration-500 ${phase >= 3 ? 'opacity-100' : 'opacity-30'}`}>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-semibold text-gray-200">GDPR Compliance Audit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[10px] text-emerald-400 font-medium">Chat with Contract</span>
              </div>
            </div>

            {/* Score + Liability row */}
            <div className={`mb-4 grid grid-cols-2 gap-3 transition-all duration-700 ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {/* Health Score */}
              <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-3 text-center">
                <div className="text-[10px] text-gray-400 mb-1">Health Score</div>
                <div className="relative mx-auto h-16 w-16">
                  <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(140, 20%, 17%)" strokeWidth="5" />
                    <circle
                      cx="32" cy="32" r="28" fill="none"
                      stroke="url(#score-gradient)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={`${175.9}`}
                      strokeDashoffset={phase >= 3 ? 175.9 * (1 - 0.42) : 175.9}
                      className="transition-all duration-[1500ms] ease-out"
                    />
                    <defs>
                      <linearGradient id="score-gradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-lg font-bold transition-all duration-1000 ${phase >= 3 ? 'text-amber-400' : 'text-gray-600'}`}>
                      {phase >= 3 ? '42' : '--'}
                    </span>
                  </div>
                </div>
                <div className={`text-[10px] mt-1 font-medium transition-colors duration-700 ${phase >= 3 ? 'text-amber-400' : 'text-gray-600'}`}>
                  {phase >= 3 ? 'High Risk' : 'Pending'}
                </div>
              </div>

              {/* Liability */}
              <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-3 text-center">
                <div className="text-[10px] text-gray-400 mb-1">Est. Liability</div>
                <div className={`text-xl sm:text-2xl font-bold transition-all duration-1000 ${phase >= 3 ? 'text-red-400' : 'text-gray-600'}`}>
                  {phase >= 3 ? '$2.6M' : '--'}
                </div>
                <div className="mt-1 flex items-center justify-center gap-1">
                  {phase >= 3 && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-red-400 animate-fade-in">
                      <AlertTriangle className="h-3 w-3" /> 5 gaps found
                    </span>
                  )}
                </div>
                <div className={`mt-2 grid grid-cols-3 gap-1 text-[9px] transition-all duration-700 ${phase >= 3 ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="rounded bg-red-500/20 px-1 py-0.5 text-red-400">2 Critical</div>
                  <div className="rounded bg-orange-500/20 px-1 py-0.5 text-orange-400">1 High</div>
                  <div className="rounded bg-yellow-500/20 px-1 py-0.5 text-yellow-400">2 Medium</div>
                </div>
              </div>
            </div>

            {/* Gap Cards */}
            <div className="space-y-2">
              {gaps.map((gap, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-lg border border-slate-700/40 bg-slate-800/40 px-3 py-2 transition-all duration-500 
                    ${phase >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                  style={{ transitionDelay: phase >= 3 ? `${300 + i * 150}ms` : '0ms' }}
                >
                  <div className={`h-2 w-2 rounded-full ${riskColor(gap.risk)} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium text-gray-200 truncate">{gap.title}</div>
                    <div className="text-[9px] text-gray-500">{gap.ref}</div>
                  </div>
                  <span className={`text-[10px] font-semibold ${riskText(gap.risk)} flex-shrink-0`}>{gap.liability}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges around the demo */}
      <div className="absolute -left-4 top-1/3 hidden lg:flex animate-float-slow">
        <div className="rounded-xl border border-emerald-500/30 bg-slate-900/90 backdrop-blur-sm px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span className="text-[11px] font-medium text-gray-300">GDPR Compliant</span>
          </div>
        </div>
      </div>
      <div className="absolute -right-4 top-1/4 hidden lg:flex animate-float-delayed">
        <div className="rounded-xl border border-red-500/30 bg-slate-900/90 backdrop-blur-sm px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-400" />
            <span className="text-[11px] font-medium text-gray-300">5 Gaps Found</span>
          </div>
        </div>
      </div>
    </div>
  );
}
