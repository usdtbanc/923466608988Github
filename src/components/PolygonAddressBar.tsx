import { useState } from 'react';
import { Copy, Check, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEvmWallet } from '@/hooks/useEvmWallet';
import { useToast } from '@/hooks/use-toast';

interface PolygonAddressBarProps {
  onAddress: (address: string) => void;
}

/**
 * Resolves the user's Polygon EVM address.
 * - If already unlocked in this session, surfaces it immediately.
 * - If wallet exists but locked, shows an inline passkey field.
 * - If no wallet yet, links to the Wallet page to create one.
 * Calls onAddress() whenever an address becomes available.
 */
export default function PolygonAddressBar({ onAddress }: PolygonAddressBarProps) {
  const { state, actions } = useEvmWallet('polygon');
  const { toast } = useToast();
  const [passkey, setPasskey] = useState('');
  const [copied, setCopied] = useState(false);

  // Already unlocked this session
  if (state.address) {
    // Fire callback once
    onAddress(state.address);

    const copy = () => {
      navigator.clipboard.writeText(state.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-muted/40 border-b border-primary/10 flex-shrink-0">
        <Unlock className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
        <span className="text-xs text-muted-foreground flex-shrink-0">Your Polygon address:</span>
        <code className="text-xs font-mono truncate flex-1 text-foreground">{state.address}</code>
        <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={copy}>
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
        </Button>
      </div>
    );
  }

  // No wallet set up yet
  if (!state.hasVaultForChain) {
    return (
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 flex-shrink-0">
        <Lock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
        <span className="text-xs text-amber-700 dark:text-amber-300 flex-1">
          No Polygon wallet found.{' '}
          <a href="/wallet" className="underline font-medium">Set up your wallet</a>{' '}
          first to receive USDT.
        </span>
      </div>
    );
  }

  // Wallet exists but locked — show inline unlock
  const unlock = async () => {
    if (!passkey) return;
    const ok = await actions.ensureVault(passkey);
    if (!ok) {
      toast({ title: 'Wrong passkey', description: 'Could not unlock wallet.', variant: 'destructive' });
    }
    setPasskey('');
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 px-3 sm:px-4 py-2 bg-muted/40 border-b border-primary/10 flex-shrink-0">
      <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
      <span className="text-xs text-muted-foreground flex-shrink-0">Unlock wallet to auto-fill your Polygon address:</span>
      <div className="flex gap-2 flex-1 w-full sm:w-auto">
        <Input
          type="password"
          placeholder="Wallet passkey"
          value={passkey}
          onChange={(e) => setPasskey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && unlock()}
          className="h-7 text-xs flex-1"
        />
        <Button size="sm" className="h-7 text-xs px-3" onClick={unlock} disabled={state.loading}>
          Unlock
        </Button>
      </div>
    </div>
  );
}
