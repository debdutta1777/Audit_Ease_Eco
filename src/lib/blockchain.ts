// Blockchain payment utilities for AuditEase
// Uses Ethereum Sepolia testnet by default

// ====== Configuration ======
const NETWORK_CONFIG = {
    sepolia: {
        chainId: '0xaa36a7', // 11155111
        chainName: 'Sepolia Testnet',
        nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://rpc.sepolia.org'],
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
    },
} as const;

// Receiver wallet address — replace with your own production wallet
const RECEIVER_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD68';

// Static ETH/USD rate for demo purposes
// In production, integrate CoinGecko or Chainlink price feeds
const ETH_USD_RATE = 3500;

// ====== Types ======
export interface WalletState {
    connected: boolean;
    address: string | null;
    balance: string | null;
    chainId: string | null;
    networkName: string | null;
}

export interface TransactionResult {
    success: boolean;
    txHash: string | null;
    error: string | null;
}

export type TransactionStatus = 'idle' | 'connecting' | 'sending' | 'confirming' | 'confirmed' | 'failed';

// ====== Detection ======
export function isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined' && Boolean(window.ethereum?.isMetaMask);
}

// ====== Network Helpers ======
export function getNetworkName(chainId: string | null): string {
    switch (chainId) {
        case '0x1': return 'Ethereum Mainnet';
        case '0xaa36a7': return 'Sepolia Testnet';
        case '0x89': return 'Polygon';
        case '0xa4b1': return 'Arbitrum';
        default: return 'Unknown Network';
    }
}

export function isCorrectNetwork(chainId: string | null): boolean {
    return chainId === NETWORK_CONFIG.sepolia.chainId;
}

export async function switchToSepolia(): Promise<boolean> {
    if (!window.ethereum) return false;

    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: NETWORK_CONFIG.sepolia.chainId }],
        });
        return true;
    } catch (switchError: unknown) {
        // Chain not added, try to add it
        const err = switchError as { code?: number };
        if (err.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [NETWORK_CONFIG.sepolia],
                });
                return true;
            } catch {
                return false;
            }
        }
        return false;
    }
}

// ====== Wallet Connection ======
export async function connectWallet(): Promise<WalletState> {
    if (!isMetaMaskInstalled()) {
        return { connected: false, address: null, balance: null, chainId: null, networkName: null };
    }

    try {
        const accounts = await window.ethereum!.request({
            method: 'eth_requestAccounts',
        }) as string[];

        const chainId = await window.ethereum!.request({
            method: 'eth_chainId',
        }) as string;

        const balance = await window.ethereum!.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest'],
        }) as string;

        const balanceInEth = parseInt(balance, 16) / 1e18;

        return {
            connected: true,
            address: accounts[0],
            balance: balanceInEth.toFixed(4),
            chainId,
            networkName: getNetworkName(chainId),
        };
    } catch {
        return { connected: false, address: null, balance: null, chainId: null, networkName: null };
    }
}

// ====== Price Conversion ======
export function usdToEth(usdAmount: number): number {
    return usdAmount / ETH_USD_RATE;
}

export function formatEthAmount(ethAmount: number): string {
    return ethAmount.toFixed(6);
}

export function getEthPriceDisplay(usdAmount: number): string {
    const eth = usdToEth(usdAmount);
    return `${formatEthAmount(eth)} ETH`;
}

// ====== Transactions ======
export async function sendPayment(amountUsd: number): Promise<TransactionResult> {
    if (!window.ethereum) {
        return { success: false, txHash: null, error: 'MetaMask not installed' };
    }

    try {
        const accounts = await window.ethereum.request({
            method: 'eth_accounts',
        }) as string[];

        if (!accounts || accounts.length === 0) {
            return { success: false, txHash: null, error: 'No wallet connected' };
        }

        const ethAmount = usdToEth(amountUsd);
        const weiAmount = Math.floor(ethAmount * 1e18);
        const hexValue = '0x' + weiAmount.toString(16);

        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
                from: accounts[0],
                to: RECEIVER_WALLET,
                value: hexValue,
                gas: '0x5208', // 21000 gas for simple transfer
            }],
        }) as string;

        return { success: true, txHash, error: null };
    } catch (err: unknown) {
        const error = err as { message?: string; code?: number };
        if (error.code === 4001) {
            return { success: false, txHash: null, error: 'Transaction rejected by user' };
        }
        return { success: false, txHash: null, error: error.message || 'Transaction failed' };
    }
}

export async function waitForConfirmation(txHash: string, maxAttempts = 30): Promise<boolean> {
    if (!window.ethereum) return false;

    for (let i = 0; i < maxAttempts; i++) {
        try {
            const receipt = await window.ethereum.request({
                method: 'eth_getTransactionReceipt',
                params: [txHash],
            }) as { status: string } | null;

            if (receipt && receipt.status === '0x1') {
                return true;
            }
            if (receipt && receipt.status === '0x0') {
                return false; // Transaction reverted
            }
        } catch {
            // Receipt not available yet
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    return false;
}

// ====== Utilities ======
export function truncateAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getEtherscanUrl(txHash: string): string {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
}

export function getReceiverWallet(): string {
    return RECEIVER_WALLET;
}

export function getCurrentEthRate(): number {
    return ETH_USD_RATE;
}
