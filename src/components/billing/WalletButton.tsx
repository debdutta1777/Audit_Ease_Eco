import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2, ExternalLink, ChevronDown } from 'lucide-react';
import {
    isMetaMaskInstalled,
    connectWallet,
    truncateAddress,
    getNetworkName,
    type WalletState,
} from '@/lib/blockchain';

interface WalletButtonProps {
    onConnect?: (wallet: WalletState) => void;
    compact?: boolean;
}

export function WalletButton({ onConnect, compact = false }: WalletButtonProps) {
    const [wallet, setWallet] = useState<WalletState>({
        connected: false,
        address: null,
        balance: null,
        chainId: null,
        networkName: null,
    });
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        if (window.ethereum) {
            const handleAccountsChanged = (...args: unknown[]) => {
                const accounts = args[0] as string[];
                if (accounts.length === 0) {
                    setWallet({ connected: false, address: null, balance: null, chainId: null, networkName: null });
                }
            };

            const handleChainChanged = () => {
                window.location.reload();
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);

            return () => {
                window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum?.removeListener('chainChanged', handleChainChanged);
            };
        }
    }, []);

    const handleConnect = async () => {
        if (!isMetaMaskInstalled()) {
            window.open('https://metamask.io/download/', '_blank');
            return;
        }

        setIsConnecting(true);
        try {
            const walletState = await connectWallet();
            setWallet(walletState);
            onConnect?.(walletState);
        } finally {
            setIsConnecting(false);
        }
    };

    if (wallet.connected && wallet.address) {
        return (
            <div className="flex items-center gap-2">
                <div className={`flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm ${compact ? 'px-3 py-1.5' : 'px-4 py-2'}`}>
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className={`font-mono font-medium text-purple-300 ${compact ? 'text-xs' : 'text-sm'}`}>
                        {truncateAddress(wallet.address)}
                    </span>
                    {!compact && wallet.balance && (
                        <>
                            <span className="text-slate-500">|</span>
                            <span className="text-sm text-slate-300">{wallet.balance} ETH</span>
                        </>
                    )}
                </div>
                {!compact && (
                    <span className="text-xs text-slate-500">
                        {getNetworkName(wallet.chainId)}
                    </span>
                )}
            </div>
        );
    }

    return (
        <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className={`bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border-0 ${compact ? 'text-xs px-3 py-1.5' : ''}`}
        >
            {isConnecting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                </>
            ) : isMetaMaskInstalled() ? (
                <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                </>
            ) : (
                <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Install MetaMask
                </>
            )}
        </Button>
    );
}
