import { Buffer } from 'buffer';
(globalThis as typeof globalThis & { Buffer: typeof Buffer }).Buffer = Buffer;

import { createRoot } from 'react-dom/client'
import { PrivyProvider } from '@privy-io/react-auth'
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets'
import { WagmiProvider } from '@privy-io/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { sepolia } from 'viem/chains'
import { wagmiConfig } from '@/lib/wagmi/config'
import App from './App.tsx'
import './index.css'

// Shared QueryClient — must live above WagmiProvider
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 300000,
      gcTime: 600000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <PrivyProvider
    appId={import.meta.env.VITE_PRIVY_APP_ID}
    config={{
      loginMethods: ['email', 'wallet'],
      appearance: {
        theme: 'dark',
        accentColor: '#3b82f6',
      },
      defaultChain: sepolia,
      supportedChains: [sepolia],
      embeddedWallets: {
        ethereum: { createOnLogin: 'users-without-wallets' },
      },
    }}
  >
    {/* QueryClientProvider must wrap WagmiProvider — wagmi v2 requires it */}
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <SmartWalletsProvider>
          <App />
        </SmartWalletsProvider>
      </WagmiProvider>
    </QueryClientProvider>
  </PrivyProvider>
);
