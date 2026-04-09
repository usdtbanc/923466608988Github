import { Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PaybisWidget from "@/components/PaybisWidget";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useWallets } from "@privy-io/react-auth";

export default function AmericasWidget() {
  const { client } = useSmartWallets();
  const { wallets } = useWallets();
  // Prefer Smart Account address — this is the wallet used to send USDT gaslessly
  const address: string | undefined =
    client?.account?.address ??
    wallets.find((w) => w.walletClientType === 'privy')?.address;

  return (
    <div className="w-full h-full flex flex-col relative bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4
                   bg-card border-b border-primary/20 flex-shrink-0"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-0">
          <div className="p-1.5 sm:p-2 rounded-full bg-gradient-to-r from-blue-500 to-red-500">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-500 via-red-500 to-blue-500 bg-clip-text text-transparent">
              🇺🇸 Americas Trading Platform
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Buy ETH on Sepolia • USD
              {address && (
                <span className="ml-2 font-mono text-xs text-green-600 dark:text-green-400">
                  → {address.slice(0, 6)}…{address.slice(-4)}
                </span>
              )}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800 text-xs">
          Live
        </Badge>
      </div>

      {/* Paybis iframe — address pre-filled from Privy wallet */}
      <div className="flex-1 p-0">
        <PaybisWidget fromCurrency="USD" toAddress={address} />
      </div>
    </div>
  );
}
