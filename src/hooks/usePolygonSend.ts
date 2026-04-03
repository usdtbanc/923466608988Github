import { useState } from 'react';
import { encodeFunctionData, getAddress, isAddress, parseUnits } from 'viem';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { USDT_POLYGON_ADDRESS } from './usePolygonUsdtBalance';

const TRANSFER_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

/**
 * Sends USDT on Polygon via the Privy Smart Account.
 *
 * Gas is sponsored by Alchemy Gas Manager — the policy is configured in:
 *   Privy Dashboard → Smart Wallets → Alchemy App ID + Gas Policy ID
 *
 * No MATIC needed in the wallet. The smart account pays no gas fees.
 */
export function usePolygonSend() {
  const { client } = useSmartWallets();
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendUsdt = async (to: string, amount: string): Promise<`0x${string}`> => {
    if (!client) throw new Error('Smart wallet not ready. Enable Smart Wallets in Privy Dashboard.');
    if (!isAddress(to)) throw new Error('Invalid recipient address');
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) throw new Error('Invalid amount');

    setSending(true);
    setError(null);
    setTxHash(null);

    try {
      const data = encodeFunctionData({
        abi: TRANSFER_ABI,
        functionName: 'transfer',
        args: [getAddress(to), parseUnits(amount, 6)],
      });

      // client.sendTransaction goes through the ERC-4337 bundler.
      // Alchemy Gas Manager policy (set in Privy dashboard) sponsors the gas,
      // so the smart account needs zero MATIC.
      // Privy's smart account client has chain + account baked in from
      // the Privy dashboard config — no need to pass them explicitly.
      const hash = await client.sendTransaction({
        to: USDT_POLYGON_ADDRESS,
        data,
      });

      setTxHash(hash);
      return hash;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Transaction failed';
      setError(msg);
      throw e;
    } finally {
      setSending(false);
    }
  };

  return {
    sendUsdt,
    sending,
    txHash,
    error,
    // The smart account address — fund this address with USDT on Polygon
    smartAddress: client?.account?.address as `0x${string}` | undefined,
  };
}
