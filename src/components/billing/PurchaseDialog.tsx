import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";

interface PurchaseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    price?: string;
    featureName?: string;
}

export function PurchaseDialog({
    open,
    onOpenChange,
    onSuccess,
    price = "$49.00",
    featureName = "Compliance Rewrite"
}: PurchaseDialogProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handlePurchase = async () => {
        setIsProcessing(true);
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsProcessing(false);
        setIsSuccess(true);
        // Wait a moment to show success state before closing
        setTimeout(() => {
            setIsSuccess(false);
            onSuccess();
            onOpenChange(false);
        }, 1500);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] border-emerald-500/20 bg-slate-900/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-white">Unlock {featureName}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        One-time purchase to generate a fully compliant version of this document.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 flex flex-col items-center justify-center space-y-4">
                    {isSuccess ? (
                        <div className="rounded-full bg-emerald-500/20 p-3 animate-in zoom-in border border-emerald-500/30">
                            <Check className="h-8 w-8 text-emerald-400" />
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-4 rounded-xl w-full text-center">
                            <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{price}</span>
                        </div>
                    )}

                    <div className="text-sm text-gray-400 text-center">
                        {isSuccess ? (
                            <span className="text-emerald-400 font-medium">Payment Successful!</span>
                        ) : (
                            "Secure payment via Stripe (Test Mode)"
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isProcessing || isSuccess}
                        className="border-slate-700 bg-slate-800/50 text-gray-300 hover:bg-slate-700 hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handlePurchase}
                        disabled={isProcessing || isSuccess}
                        className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-emerald-500/25"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : isSuccess ? (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Success
                            </>
                        ) : (
                            <>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Pay {price}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
