import { http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { createConfig } from '@privy-io/wagmi';

// ─── Testnet: Sepolia ───────────────────────────────────────────────────────
// To switch back to Polygon mainnet, replace `sepolia` with `polygon` here
// and update defaultChain in main.tsx + the addresses in the hooks.
// ───────────────────────────────────────────────────────────────────────────
const alchemyRpc = import.meta.env.VITE_ALCHEMY_API_KEY
  ? `https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`
  : 'https://rpc.sepolia.org';

export const wagmiConfig = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(alchemyRpc),
  },
});
