// TypeScript declarations for MetaMask / EIP-1193 provider
interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
  selectedAddress: string | null;
  chainId: string | null;
}

interface Window {
  ethereum?: EthereumProvider;
}
