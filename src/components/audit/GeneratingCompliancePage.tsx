import { Sparkles, Shield, FileCheck } from 'lucide-react';

export function GeneratingCompliancePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            {/* Animated icon */}
            <div className="relative mb-8">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur-2xl animate-pulse" />
                <div className="relative bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-full p-8">
                    <Sparkles className="h-12 w-12 text-emerald-400 animate-pulse" />
                </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 mb-3">
                Generating Your Fully Compliant Contract
            </h2>
            <p className="text-muted-foreground text-center max-w-md mb-10">
                Our AI is analyzing every clause and rewriting non-compliant sections to meet the standard. This may take a moment.
            </p>

            {/* Progress steps */}
            <div className="space-y-4 w-full max-w-sm">
                <Step icon={<FileCheck className="h-5 w-5" />} label="Analyzing original contract" delay="0s" />
                <Step icon={<Shield className="h-5 w-5" />} label="Checking compliance gaps" delay="1s" />
                <Step icon={<Sparkles className="h-5 w-5" />} label="Rewriting non-compliant clauses" delay="2s" />
            </div>

            {/* Loading bar */}
            <div className="mt-10 w-full max-w-sm">
                <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-loading-bar" />
                </div>
            </div>
        </div>
    );
}

function Step({ icon, label, delay }: { icon: React.ReactNode; label: string; delay: string }) {
    return (
        <div
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30 animate-fade-in"
            style={{ animationDelay: delay }}
        >
            <div className="text-emerald-400 animate-pulse">{icon}</div>
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="ml-auto flex gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    );
}
