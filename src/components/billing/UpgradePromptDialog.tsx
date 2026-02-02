import { Link } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

interface UpgradePromptDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    auditsUsed?: number;
}

export function UpgradePromptDialog({ open, onOpenChange, auditsUsed = 10 }: UpgradePromptDialogProps) {
    const benefits = [
        'Unlimited audit analyses',
        'Advanced gap analysis',
        'Priority support',
        'Custom compliance standards',
        'Export to multiple formats',
        'Team collaboration features',
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-cyan-500/20 bg-gradient-to-br from-slate-900 to-slate-800">
                {/* Decorative elements */}
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

                <DialogHeader className="relative">
                    <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-3">
                            <Sparkles className="h-8 w-8 text-cyan-400" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-2xl font-bold">
                        You've reached your free tier limit
                    </DialogTitle>
                    <DialogDescription className="text-center text-base text-gray-300">
                        You've completed <span className="font-semibold text-cyan-400">{auditsUsed} audit analyses</span>.
                        Upgrade to Professional to continue analyzing documents without limits.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative mt-6 space-y-4">
                    {/* Benefits */}
                    <div className="rounded-xl border border-cyan-500/20 bg-slate-900/50 p-6 backdrop-blur-sm">
                        <h4 className="mb-4 font-semibold text-white">What you'll get with Professional:</h4>
                        <ul className="space-y-3">
                            {benefits.map((benefit) => (
                                <li key={benefit} className="flex items-start gap-3 text-sm text-gray-300">
                                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pricing highlight */}
                    <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-4 text-center">
                        <div className="mb-1 text-sm text-gray-300">Starting at</div>
                        <div className="mb-1 flex items-baseline justify-center gap-1">
                            <span className="text-3xl font-bold text-white">$39</span>
                            <span className="text-gray-400">/month</span>
                        </div>
                        <div className="text-xs text-emerald-400">Save 20% with annual billing</div>
                    </div>

                    {/* CTA Button */}
                    <Button
                        asChild
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 py-6 text-lg font-semibold text-white shadow-lg hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
                    >
                        <Link to="/billing">
                            Upgrade Now
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>

                    <Button
                        variant="ghost"
                        className="w-full text-gray-400 hover:text-white"
                        onClick={() => onOpenChange(false)}
                    >
                        Maybe later
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
