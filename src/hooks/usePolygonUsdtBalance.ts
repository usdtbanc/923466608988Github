import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { usePrivy } from '@privy-io/react-auth';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';

export const USDT_POLYGON_ADDRESS = (
  import.meta.env.VITE_USDT_CONTRACT_ADDRESS ?? '0x6fEA2f1b82aFC40030520a6C49B0d3b652A65915'
) as `0x${string}`;

const BALANCE_OF_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export function usePolygonUsdtBalance() {
  const { user } = usePrivy();
  const { client } = useSmartWallets();

  // Prefer smart account address; fall back to embedded EOA
  const address = (
    client?.account?.address ??
    user?.smartWallet?.address ??
    user?.wallet?.address
  ) as `0x${string}` | undefined;

  const { data, isLoading, refetch } = useReadContract({
    address: USDT_POLYGON_ADDRESS,
    abi: BALANCE_OF_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return {
    balance: data !== undefined ? formatUnits(data, 6) : '0',
    isLoading,
    refetch,
  };
}
