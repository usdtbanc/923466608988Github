import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';

// ─── Testnet: USDT on Sepolia ────────────────────────────────────────────────
// Mainnet switch: replace with 0xc2132D05D31c914a87C6611C10748AEb04B58e8F (Polygon USDT)
export const USDT_POLYGON_ADDRESS = '0x6fEA2f1b82aFC40030520a6C49B0d3b652A65915' as const;

const BALANCE_OF_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

/**
 * Returns the real on-chain USDT balance for the Privy Smart Account on Polygon.
 * The smart account address is different from the EOA — it's the ERC-4337 account
 * that Alchemy sponsors gas for.
 */
export function usePolygonUsdtBalance() {
  const { client } = useSmartWallets();
  const smartAddress = client?.account?.address as `0x${string}` | undefined;

  const { data, isLoading, refetch } = useReadContract({
    address: USDT_POLYGON_ADDRESS,
    abi: BALANCE_OF_ABI,
    functionName: 'balanceOf',
    args: smartAddress ? [smartAddress] : undefined,
    query: { enabled: !!smartAddress },
  });

  return {
    // USDT has 6 decimals on Polygon
    balance: data !== undefined ? formatUnits(data, 6) : '0',
    smartAddress,
    isLoading,
    refetch,
  };
}
