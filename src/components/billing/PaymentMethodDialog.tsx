import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Check,
    CreditCard,
    Loader2,
    Smartphone,
    Building2,
    Wallet,
    Link2,
    Lock,
    ChevronRight,
    ArrowLeft,
    Sparkles,
    Shield,
} from 'lucide-react';
import { CryptoPaymentDialog } from './CryptoPaymentDialog';

type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet' | 'crypto' | null;

interface PaymentMethodDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (paymentMethod: string, txHash?: string) => void;
    amount: number;
    planName: string;
    billingPeriod: 'monthly' | 'annual';
}

const PAYMENT_METHODS = [
    {
        id: 'card' as const,
        name: 'Credit / Debit Card',
        description: 'Visa, Mastercard, Amex, RuPay',
        icon: CreditCard,
        color: 'from-blue-500 to-cyan-500',
        iconBg: 'bg-blue-500/10 border-blue-500/20',
        iconColor: 'text-blue-400',
    },
    {
        id: 'upi' as const,
        name: 'UPI',
        description: 'Google Pay, PhonePe, Paytm, BHIM',
        icon: Smartphone,
        color: 'from-green-500 to-emerald-500',
        iconBg: 'bg-green-500/10 border-green-500/20',
        iconColor: 'text-green-400',
    },
    {
        id: 'netbanking' as const,
        name: 'Net Banking',
        description: 'All major Indian & international banks',
        icon: Building2,
        color: 'from-amber-500 to-orange-500',
        iconBg: 'bg-amber-500/10 border-amber-500/20',
        iconColor: 'text-amber-400',
    },
    {
        id: 'wallet' as const,
        name: 'Wallets',
        description: 'Amazon Pay, Freecharge, MobiKwik',
        icon: Wallet,
        color: 'from-pink-500 to-rose-500',
        iconBg: 'bg-pink-500/10 border-pink-500/20',
        iconColor: 'text-pink-400',
    },
    {
        id: 'crypto' as const,
        name: 'Pay with Crypto',
        description: 'Ethereum (ETH) via MetaMask — Sepolia Testnet',
        icon: Link2,
        color: 'from-purple-500 to-indigo-500',
        iconBg: 'bg-purple-500/10 border-purple-500/20',
        iconColor: 'text-purple-400',
    },
];

const BANKS = [
    'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
    'Kotak Mahindra', 'Bank of Baroda', 'Punjab National Bank', 'Yes Bank',
];

const WALLETS = [
    'Amazon Pay', 'Freecharge', 'MobiKwik', 'Ola Money',
];

export function PaymentMethodDialog({
    open,
    onOpenChange,
    onSuccess,
    amount,
    planName,
    billingPeriod,
}: PaymentMethodDialogProps) {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showCryptoDialog, setShowCryptoDialog] = useState(false);

    // Card form state
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');
    const [cardName, setCardName] = useState('');

    // UPI state
    const [upiId, setUpiId] = useState('');

    // Net Banking state
    const [selectedBank, setSelectedBank] = useState('');

    // Wallet state
    const [selectedWallet, setSelectedWallet] = useState('');

    const resetState = () => {
        setSelectedMethod(null);
        setIsProcessing(false);
        setIsSuccess(false);
        setCardNumber('');
        setCardExpiry('');
        setCardCvc('');
        setCardName('');
        setUpiId('');
        setSelectedBank('');
        setSelectedWallet('');
    };

    const handleClose = (isOpen: boolean) => {
        if (isProcessing) return;
        if (!isOpen) resetState();
        onOpenChange(isOpen);
    };

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\D/g, '').slice(0, 16);
        return v.replace(/(\d{4})(?=\d)/g, '$1 ');
    };

    const formatExpiry = (value: string) => {
        const v = value.replace(/\D/g, '').slice(0, 4);
        if (v.length >= 3) return v.slice(0, 2) + '/' + v.slice(2);
        return v;
    };

    const simulatePayment = async (method: string) => {
        setIsProcessing(true);
        // Simulate payment gateway processing
        await new Promise(resolve => setTimeout(resolve, 2500));
        setIsProcessing(false);
        setIsSuccess(true);
        setTimeout(() => {
            onSuccess(method);
            handleClose(false);
        }, 1500);
    };

    const handlePay = () => {
        if (selectedMethod === 'crypto') {
            setShowCryptoDialog(true);
            return;
        }
        if (selectedMethod) {
            simulatePayment(selectedMethod);
        }
    };

    const handleCryptoSuccess = (txHash: string) => {
        setShowCryptoDialog(false);
        onSuccess('crypto', txHash);
        handleClose(false);
    };

    const canPay = () => {
        switch (selectedMethod) {
            case 'card':
                return cardNumber.replace(/\s/g, '').length === 16 && cardExpiry.length === 5 && cardCvc.length >= 3 && cardName.length > 0;
            case 'upi':
                return upiId.includes('@');
            case 'netbanking':
                return selectedBank.length > 0;
            case 'wallet':
                return selectedWallet.length > 0;
            case 'crypto':
                return true;
            default:
                return false;
        }
    };

    const renderPaymentForm = () => {
        switch (selectedMethod) {
            case 'card':
                return (
                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <Label className="text-sm text-gray-300">Card Number</Label>
                            <div className="relative">
                                <Input
                                    placeholder="1234 5678 9012 3456"
                                    value={cardNumber}
                                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                                    className="bg-slate-800/50 border-slate-700 text-white pl-10 font-mono tracking-wider focus:border-blue-500 focus:ring-blue-500/20"
                                    maxLength={19}
                                />
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-300">Expiry</Label>
                                <Input
                                    placeholder="MM/YY"
                                    value={cardExpiry}
                                    onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                                    className="bg-slate-800/50 border-slate-700 text-white font-mono focus:border-blue-500 focus:ring-blue-500/20"
                                    maxLength={5}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-300">CVC</Label>
                                <Input
                                    placeholder="123"
                                    value={cardCvc}
                                    onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    className="bg-slate-800/50 border-slate-700 text-white font-mono focus:border-blue-500 focus:ring-blue-500/20"
                                    maxLength={4}
                                    type="password"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm text-gray-300">Cardholder Name</Label>
                            <Input
                                placeholder="John Doe"
                                value={cardName}
                                onChange={e => setCardName(e.target.value)}
                                className="bg-slate-800/50 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>
                );

            case 'upi':
                return (
                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <Label className="text-sm text-gray-300">UPI ID</Label>
                            <Input
                                placeholder="yourname@upi"
                                value={upiId}
                                onChange={e => setUpiId(e.target.value)}
                                className="bg-slate-800/50 border-slate-700 text-white focus:border-green-500 focus:ring-green-500/20"
                            />
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            {['@okicici', '@oksbi', '@okaxis', '@ybl', '@paytm'].map(suffix => (
                                <button
                                    key={suffix}
                                    onClick={() => setUpiId(prev => {
                                        const base = prev.split('@')[0] || 'user';
                                        return base + suffix;
                                    })}
                                    className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs text-gray-400 hover:border-green-500/40 hover:text-green-400 transition-colors"
                                >
                                    {suffix}
                                </button>
                            ))}
                        </div>
                        <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-green-400 flex-shrink-0" />
                            <p className="text-xs text-green-300">A payment request will be sent to your UPI app</p>
                        </div>
                    </div>
                );

            case 'netbanking':
                return (
                    <div className="space-y-3 animate-in slide-in-from-right-4 duration-300">
                        <Label className="text-sm text-gray-300">Select Your Bank</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                            {BANKS.map(bank => (
                                <button
                                    key={bank}
                                    onClick={() => setSelectedBank(bank)}
                                    className={`rounded-lg border p-3 text-left text-sm transition-all duration-200 ${selectedBank === bank
                                            ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                                            : 'border-slate-700 bg-slate-800/30 text-gray-400 hover:border-slate-600 hover:text-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{bank}</span>
                                        {selectedBank === bank && <Check className="h-3.5 w-3.5 text-amber-400" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'wallet':
                return (
                    <div className="space-y-3 animate-in slide-in-from-right-4 duration-300">
                        <Label className="text-sm text-gray-300">Select Wallet</Label>
                        <div className="space-y-2">
                            {WALLETS.map(wallet => (
                                <button
                                    key={wallet}
                                    onClick={() => setSelectedWallet(wallet)}
                                    className={`w-full rounded-lg border p-3 text-left transition-all duration-200 ${selectedWallet === wallet
                                            ? 'border-pink-500/50 bg-pink-500/10 text-pink-300'
                                            : 'border-slate-700 bg-slate-800/30 text-gray-400 hover:border-slate-600 hover:text-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{wallet}</span>
                                        {selectedWallet === wallet && <Check className="h-3.5 w-3.5 text-pink-400" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'crypto':
                return (
                    <div className="space-y-3 animate-in slide-in-from-right-4 duration-300">
                        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 text-center space-y-3">
                            <div className="inline-flex rounded-full bg-purple-500/10 p-2.5 ring-1 ring-purple-500/20">
                                <Link2 className="h-6 w-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Ethereum Payment</p>
                                <p className="text-xs text-gray-400 mt-1">Pay with ETH via MetaMask on Sepolia Testnet</p>
                            </div>
                            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
                                <span className="text-xs text-amber-300">🛡️ Testnet — No real funds required</span>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const selectedMethodInfo = PAYMENT_METHODS.find(m => m.id === selectedMethod);

    return (
        <>
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[520px] p-0 border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 backdrop-blur-xl overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />

                    {/* Header */}
                    <div className="relative border-b border-slate-800 px-6 pt-6 pb-4">
                        <div className="flex items-center gap-3">
                            {selectedMethod && !isSuccess && (
                                <button
                                    onClick={() => setSelectedMethod(null)}
                                    className="rounded-lg p-1.5 text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </button>
                            )}
                            <div className="flex-1">
                                <DialogHeader className="p-0 space-y-1">
                                    <DialogTitle className="text-lg font-bold text-white">
                                        {isSuccess ? 'Payment Successful!' : selectedMethod ? `Pay with ${selectedMethodInfo?.name}` : 'Choose Payment Method'}
                                    </DialogTitle>
                                    <DialogDescription className="text-sm text-gray-400">
                                        {planName} Plan — {billingPeriod === 'annual' ? 'Annual' : 'Monthly'} Billing
                                    </DialogDescription>
                                </DialogHeader>
                            </div>
                        </div>

                        {/* Amount badge */}
                        <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-emerald-400" />
                                <span className="text-sm text-gray-400">Total</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-white">${amount}</span>
                                <span className="text-sm text-gray-500">/{billingPeriod === 'annual' ? 'yr' : 'mo'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-4 max-h-[400px] overflow-y-auto">
                        {isSuccess ? (
                            <div className="py-8 text-center space-y-4 animate-in zoom-in duration-300">
                                <div className="inline-flex rounded-full bg-emerald-500/20 p-4 ring-2 ring-emerald-500/30">
                                    <Check className="h-8 w-8 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-white">Payment Successful!</p>
                                    <p className="text-sm text-gray-400 mt-1">Your {planName} plan is now active</p>
                                </div>
                            </div>
                        ) : !selectedMethod ? (
                            /* Payment methods list */
                            <div className="space-y-2">
                                {PAYMENT_METHODS.map((method, i) => (
                                    <button
                                        key={method.id}
                                        onClick={() => setSelectedMethod(method.id)}
                                        className="w-full group rounded-xl border border-slate-700/50 bg-slate-800/20 p-4 text-left transition-all duration-200 hover:border-slate-600 hover:bg-slate-800/40 hover:scale-[1.01] active:scale-[0.99]"
                                        style={{ animationDelay: `${i * 50}ms` }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`rounded-xl border p-2.5 ${method.iconBg} transition-colors`}>
                                                <method.icon className={`h-5 w-5 ${method.iconColor}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white group-hover:text-white transition-colors">
                                                    {method.name}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                    {method.description}
                                                </p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            /* Selected payment method form */
                            <div>
                                {renderPaymentForm()}
                            </div>
                        )}
                    </div>

                    {/* Footer - Pay button */}
                    {selectedMethod && !isSuccess && (
                        <div className="border-t border-slate-800 px-6 py-4 space-y-3">
                            <Button
                                onClick={handlePay}
                                disabled={!canPay() || isProcessing}
                                className={`w-full py-6 text-base font-semibold shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] border-0 ${selectedMethodInfo
                                        ? `bg-gradient-to-r ${selectedMethodInfo.color} text-white hover:shadow-lg`
                                        : 'bg-emerald-600 text-white'
                                    }`}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Processing Payment...
                                    </>
                                ) : selectedMethod === 'crypto' ? (
                                    <>
                                        <Link2 className="mr-2 h-5 w-5" />
                                        Open MetaMask Wallet
                                    </>
                                ) : (
                                    <>
                                        <Lock className="mr-2 h-4 w-4" />
                                        Pay ${amount}.00
                                    </>
                                )}
                            </Button>

                            {/* Security badge */}
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                                <Shield className="h-3 w-3" />
                                <span>Secured with 256-bit SSL encryption</span>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Crypto Payment Dialog */}
            <CryptoPaymentDialog
                open={showCryptoDialog}
                onOpenChange={setShowCryptoDialog}
                onSuccess={handleCryptoSuccess}
                amountUsd={amount}
                planName={planName}
                description={`${planName} Plan — ${billingPeriod === 'annual' ? 'Annual' : 'Monthly'} Subscription`}
            />
        </>
    );
}
