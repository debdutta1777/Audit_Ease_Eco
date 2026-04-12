import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Check,
    Loader2,
    Wallet,
    ExternalLink,
    AlertTriangle,
    Shield,
    Link2,
    ArrowRight,
} from 'lucide-react';
import {
    isMetaMaskInstalled,
    connectWallet,
    sendPayment,
    waitForConfirmation,
    truncateAddress,
    getEthPriceDisplay,
    usdToEth,
    formatEthAmount,
    isCorrectNetwork,
    switchToSepolia,
    getNetworkName,
    getEtherscanUrl,
    type WalletState,
    type TransactionStatus,
} from '@/lib/blockchain';

interface CryptoPaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (txHash: string) => void;
    amountUsd: number;
    planName: string;
    description?: string;
}

export function CryptoPaymentDialog({
    open,
    onOpenChange,
    onSuccess,
    amountUsd,
    planName,
    description,
}: CryptoPaymentDialogProps) {
    const [wallet, setWallet] = useState<WalletState>({
        connected: false,
        address: null,
        balance: null,
        chainId: null,
        networkName: null,
    });
    const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleConnect = async () => {
        if (!isMetaMaskInstalled()) {
            window.open('https://metamask.io/download/', '_blank');
            return;
        }

        setTxStatus('connecting');
        setError(null);
        try {
            const walletState = await connectWallet();
            setWallet(walletState);

            if (walletState.connected && !isCorrectNetwork(walletState.chainId)) {
                const switched = await switchToSepolia();
                if (switched) {
                    const updated = await connectWallet();
                    setWallet(updated);
                }
            }

            setTxStatus('idle');
        } catch {
            setError('Failed to connect wallet');
            setTxStatus('failed');
        }
    };

    const handlePayment = async () => {
        if (!wallet.connected) return;

        setTxStatus('sending');
        setError(null);

        try {
            const result = await sendPayment(amountUsd);

            if (!result.success || !result.txHash) {
                setError(result.error || 'Transaction failed');
                setTxStatus('failed');
                return;
            }

            setTxHash(result.txHash);
            setTxStatus('confirming');

            const confirmed = await waitForConfirmation(result.txHash);

            if (confirmed) {
                setTxStatus('confirmed');
                setTimeout(() => {
                    onSuccess(result.txHash!);
                }, 2000);
            } else {
                setError('Transaction was not confirmed in time. Please check Etherscan.');
                setTxStatus('failed');
            }
        } catch {
            setError('Transaction failed unexpectedly');
            setTxStatus('failed');
        }
    };

    const handleClose = (isOpen: boolean) => {
        if (txStatus === 'sending' || txStatus === 'confirming') return; // Don't close during tx
        if (!isOpen) {
            // Reset state on close
            setTxStatus('idle');
            setTxHash(null);
            setError(null);
        }
        onOpenChange(isOpen);
    };

    const ethAmount = usdToEth(amountUsd);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[480px] border-purple-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/50 backdrop-blur-xl overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-purple-600/5 blur-3xl" />

                <DialogHeader className="relative">
                    <div className="mb-3 flex justify-center">
                        <div className="relative">
                            <div className="rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 p-3 ring-1 ring-purple-500/20">
                                <Link2 className="h-7 w-7 text-purple-400" />
                            </div>
                            <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-purple-400 animate-pulse" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-xl font-bold text-white">
                        Pay with Crypto
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-400">
                        {description || `Purchase ${planName} with Ethereum on Sepolia Testnet`}
                    </DialogDescription>
                </DialogHeader>

                <div className="relative mt-2 space-y-4">
                    {/* Price Display */}
                    <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Due</p>
                                <p className="text-2xl font-bold text-white mt-1">${amountUsd.toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">ETH Equivalent</p>
                                <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mt-1">
                                    {formatEthAmount(ethAmount)} ETH
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
                            <Shield className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                            <span className="text-xs text-amber-300">Sepolia Testnet — No real funds required</span>
                        </div>
                    </div>

                    {/* Wallet Section */}
                    {!wallet.connected ? (
                        <div className="space-y-3">
                            {!isMetaMaskInstalled() ? (
                                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center space-y-3">
                                    <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto" />
                                    <div>
                                        <p className="text-sm font-medium text-white">MetaMask Required</p>
                                        <p className="text-xs text-gray-400 mt-1">Install the MetaMask browser extension to continue</p>
                                    </div>
                                    <Button
                                        onClick={() => window.open('https://metamask.io/download/', '_blank')}
                                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 hover:shadow-amber-500/25"
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Install MetaMask
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    onClick={handleConnect}
                                    disabled={txStatus === 'connecting'}
                                    className="w-full py-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-base font-semibold shadow-lg hover:shadow-purple-500/30 border-0 transition-all duration-300 hover:scale-[1.01]"
                                >
                                    {txStatus === 'connecting' ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Connecting to MetaMask...
                                        </>
                                    ) : (
                                        <>
                                            <Wallet className="mr-2 h-5 w-5" />
                                            Connect MetaMask Wallet
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Connected Wallet Info */}
                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-sm font-medium text-emerald-300">Connected</span>
                                    </div>
                                    <span className="font-mono text-sm text-gray-300">
                                        {wallet.address ? truncateAddress(wallet.address) : ''}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-500">Balance</span>
                                    <span className="text-sm font-medium text-white">{wallet.balance} ETH</span>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-gray-500">Network</span>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`h-1.5 w-1.5 rounded-full ${isCorrectNetwork(wallet.chainId) ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                        <span className={`text-xs ${isCorrectNetwork(wallet.chainId) ? 'text-emerald-400' : 'text-amber-400'}`}>
                                            {getNetworkName(wallet.chainId)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Wrong Network Warning */}
                            {!isCorrectNetwork(wallet.chainId) && (
                                <Button
                                    onClick={async () => {
                                        const switched = await switchToSepolia();
                                        if (switched) {
                                            const updated = await connectWallet();
                                            setWallet(updated);
                                        }
                                    }}
                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0"
                                >
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                    Switch to Sepolia Testnet
                                </Button>
                            )}

                            {/* Transaction Status */}
                            {txStatus === 'confirmed' && txHash && (
                                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center space-y-2 animate-in zoom-in">
                                    <div className="inline-flex rounded-full bg-emerald-500/20 p-2">
                                        <Check className="h-6 w-6 text-emerald-400" />
                                    </div>
                                    <p className="text-sm font-semibold text-emerald-300">Payment Confirmed!</p>
                                    <a
                                        href={getEtherscanUrl(txHash)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                                    >
                                        View on Etherscan <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            )}

                            {/* Error */}
                            {error && txStatus === 'failed' && (
                                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-center">
                                    <p className="text-sm text-red-400">{error}</p>
                                    <Button
                                        onClick={() => { setTxStatus('idle'); setError(null); }}
                                        variant="ghost"
                                        size="sm"
                                        className="mt-2 text-gray-400 hover:text-white"
                                    >
                                        Try Again
                                    </Button>
                                </div>
                            )}

                            {/* Confirming spinner */}
                            {txStatus === 'confirming' && (
                                <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 text-center space-y-2">
                                    <Loader2 className="h-6 w-6 text-purple-400 animate-spin mx-auto" />
                                    <p className="text-sm font-medium text-purple-300">Waiting for confirmation...</p>
                                    {txHash && (
                                        <a
                                            href={getEtherscanUrl(txHash)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-purple-300 transition-colors"
                                        >
                                            Track on Etherscan <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Pay Button — only show when connected, on correct network, and not already processing */}
                {wallet.connected && isCorrectNetwork(wallet.chainId) && txStatus !== 'confirmed' && txStatus !== 'confirming' && (
                    <DialogFooter className="mt-2 gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => handleClose(false)}
                            disabled={txStatus === 'sending'}
                            className="border-slate-700 bg-slate-800/50 text-gray-300 hover:bg-slate-700 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handlePayment}
                            disabled={txStatus === 'sending'}
                            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-purple-500/30 border-0 transition-all duration-300"
                        >
                            {txStatus === 'sending' ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Confirm in MetaMask...
                                </>
                            ) : (
                                <>
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    Pay {formatEthAmount(ethAmount)} ETH
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
