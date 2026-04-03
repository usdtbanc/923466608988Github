import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Copy, 
  Eye, 
  EyeOff, 
  Plus, 
  Scan, 
  TrendingUp, 
  Download, 
  MoreHorizontal,
  QrCode
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { COIN_LOGOS } from '@/hooks/useCoinGecko';
import { useEvmWallet } from '@/hooks/useEvmWallet';
import { TwoFactorVerifyModal } from '@/components/TwoFactorVerifyModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePrivy, useCreateWallet } from '@privy-io/react-auth';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { sepolia } from 'viem/chains';
import { usePolygonUsdtBalance } from '@/hooks/usePolygonUsdtBalance';
import { usePolygonSend } from '@/hooks/usePolygonSend';
import { useTransactions } from '@/hooks/useTransactions';

const supportedTokens = [
  { symbol: 'USDT', name: 'Tether', networks: ['TRC-20', 'ERC-20', 'BEP-20'], color: 'bg-green-500', coingeckoId: 'tether' },
  { symbol: 'BTC', name: 'Bitcoin', networks: ['Bitcoin'], color: 'bg-orange-500', coingeckoId: 'bitcoin' },
  { symbol: 'ETH', name: 'Ethereum', networks: ['ERC-20'], color: 'bg-blue-500', coingeckoId: 'ethereum' },
  { symbol: 'BNB', name: 'BNB', networks: ['BEP-20'], color: 'bg-yellow-500', coingeckoId: 'binancecoin' },
  { symbol: 'SOL', name: 'Solana', networks: ['Solana'], color: 'bg-purple-500', coingeckoId: 'solana' },
  { symbol: 'ADA', name: 'Cardano', networks: ['Cardano'], color: 'bg-blue-700', coingeckoId: 'cardano' },
  { symbol: 'MATIC', name: 'Polygon', networks: ['Polygon'], color: 'bg-purple-600', coingeckoId: 'matic-network' },
];

export const Wallet = () => {
  const [showAllTokens, setShowAllTokens] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState('TRC-20');
  const [selectedToken, setSelectedToken] = useState('USDT');
  const [showQR, setShowQR] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [walletVerified, setWalletVerified] = useState(false);
  const [activeTab, setActiveTab] = useState('tokens');
  const [sendDestTab, setSendDestTab] = useState<'default' | 'external'>('default');
  const [toAddress, setToAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  // On-chain USDT balance
  const { balance: usdtOnChainBalance, refetch: refetchUsdtBalance } = usePolygonUsdtBalance();
  const { sendUsdt, sending } = usePolygonSend();
  const { transactions, loading: txLoading, addTransaction } = useTransactions();

  const { user } = usePrivy();
  const { createWallet } = useCreateWallet();
  const { client } = useSmartWallets();
  const smartAddress: string | undefined =
    client?.account?.address ?? user?.smartWallet?.address ?? user?.wallet?.address;

  // Auto-create embedded wallet for users who have no wallet yet
  useEffect(() => {
    if (!user?.wallet && !user?.smartWallet) {
      createWallet().catch(() => {/* already exists */});
    }
  }, [user?.wallet, user?.smartWallet]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async () => {
    const destination =
      sendDestTab === 'default'
        ? (import.meta.env.VITE_DEFAULT_WITHDRAWAL_ADDRESS as string | undefined) ?? ''
        : toAddress;

    if (!destination) {
      toast({ title: 'No destination', description: 'Enter a recipient address.', variant: 'destructive' });
      return;
    }
    if (!sendAmount || parseFloat(sendAmount) <= 0) {
      toast({ title: 'Invalid amount', description: 'Enter an amount greater than 0.', variant: 'destructive' });
      return;
    }

    try {
      const hash = await sendUsdt(destination, sendAmount);
      await addTransaction({
        type: 'withdrawal',
        crypto_type: 'USDT',
        amount: parseFloat(sendAmount),
        status: 'completed',
        timestamp: new Date().toISOString(),
      });
      setSendAmount('');
      setToAddress('');
      refetchUsdtBalance();
      toast({
        title: 'USDT Sent',
        description: `Tx: ${hash.slice(0, 10)}…${hash.slice(-6)}`,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Transaction failed';
      toast({ title: 'Send failed', description: msg, variant: 'destructive' });
    }
  };

  // Check for 2FA requirement on wallet page load
  useEffect(() => {
    const check2FA = async () => {
      try {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        if (factors?.totp && factors.totp.length > 0) {
          setShow2FAModal(true);
        } else {
          setWalletVerified(true);
        }
      } catch (error) {
        console.error('Error checking 2FA status:', error);
        setWalletVerified(true);
      }
    };

    check2FA();
  }, []);

  const handle2FASuccess = () => {
    setWalletVerified(true);
    toast({
      title: 'Wallet Access Granted',
      description: 'Two-factor authentication verified successfully.',
    });
  };

  const handle2FACancel = () => {
    setShow2FAModal(false);
    navigate('/');
  };
  
  // Mock wallet data - Trust Wallet style with more tokens
  const walletData = {
    USDT: { balance: 1250.50, usdValue: 1250.50, change24h: 0.02 },
    BTC: { balance: 0.045, usdValue: 2850.75, change24h: 2.45 },
    ETH: { balance: 1.25, usdValue: 4125.00, change24h: -1.23 },
    BNB: { balance: 8.5, usdValue: 2975.50, change24h: 1.87 },
    XRP: { balance: 125.5, usdValue: 89.25, change24h: -0.65 },
    SOL: { balance: 5.25, usdValue: 1102.50, change24h: 3.21 },
    MATIC: { balance: 125.0, usdValue: 112.50, change24h: -2.15 },
  };

  // Real on-chain USDT balance (USDT = $1 peg, so balance === usdValue)
  const realUsdtValue = parseFloat(usdtOnChainBalance) || 0;

  // Calculate total balance using real USDT + mock other tokens
  const totalBalance = showAllTokens
    ? realUsdtValue + Object.entries(walletData)
        .filter(([k]) => k !== 'USDT')
        .reduce((sum, [, token]) => sum + token.usdValue, 0)
    : realUsdtValue;
  
  const getCoinGeckoLogo = (symbol: string) => COIN_LOGOS[symbol];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Address copied to clipboard" });
  };

  if (!walletVerified) {
    return (
      <>
        <TwoFactorVerifyModal
          isOpen={show2FAModal}
          onSuccess={handle2FASuccess}
          onCancel={handle2FACancel}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-primary to-secondary p-0.5">
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                    <QrCode className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Wallet Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Verifying your identity to access wallet features...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
          {/* Trust Wallet Header */}
          <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                  <span className="text-white font-bold text-lg">W</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">Wallet</h1>
                  <p className="text-sm text-muted-foreground">Multi-Coin Wallet</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setShowBalances(!showBalances)}>
                  {showBalances ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Total Balance Card - Trust Wallet Style */}
            <Card className="bg-gradient-to-r from-primary to-secondary text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="text-center space-y-2">
                  <p className="text-sm opacity-90">Total Balance</p>
                  <h2 className="text-3xl font-bold">
                    {showBalances ? `$${totalBalance.toLocaleString()}` : '••••••••'}
                  </h2>
                  <p className="text-sm opacity-90">
                    {showBalances ? `${realUsdtValue.toFixed(2)} USDT` : '••••••••'}
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-center gap-4 mt-6">
                  <Button 
                    variant="secondary" 
                    className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                    onClick={() => setActiveTab('receive')}
                  >
                    <ArrowDownLeft className="w-4 h-4 mr-2" />
                    Receive
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                    onClick={() => setActiveTab('send')}
                  >
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                    onClick={() => navigate('/')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Buy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tab Navigation */}
          <div className="px-4 py-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted/30">
                <TabsTrigger value="tokens">Tokens</TabsTrigger>
                <TabsTrigger value="receive">Receive</TabsTrigger>
                <TabsTrigger value="send">Send</TabsTrigger>
              </TabsList>

              {/* Tokens Tab - Trust Wallet Style Grid */}
              <TabsContent value="tokens" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">My Tokens</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowAllTokens(!showAllTokens)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showAllTokens ? 'Hide Others' : 'Show All'}
                  </Button>
                </div>

                <div className="space-y-2">
                  {/* Always show USDT first */}
                  {(() => {
                    const usdtToken = supportedTokens.find(t => t.symbol === 'USDT');
                    const usdtData = walletData.USDT;
                    if (!usdtToken || !usdtData) return null;

                    return (
                      <motion.div
                        key="USDT"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 bg-card rounded-xl border-2 border-primary/30 hover:border-primary/50 transition-all cursor-pointer shadow-sm"
                        onClick={() => setSelectedToken('USDT')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {getCoinGeckoLogo('USDT') ? (
                              <img 
                                src={getCoinGeckoLogo('USDT')} 
                                alt="USDT logo" 
                                className="w-12 h-12 rounded-full"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                                <span className="text-white font-bold">U</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">Tether</h4>
                            <p className="text-sm text-muted-foreground">
                              {showBalances ? `${realUsdtValue.toFixed(2)} USDT` : '••••••••'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {showBalances ? `$${realUsdtValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••••'}
                          </p>
                          <div className="flex items-center justify-end text-sm text-green-500">
                            +{usdtData.change24h.toFixed(2)}%
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()}

                  {/* Show other tokens only if showAllTokens is true */}
                  {showAllTokens && supportedTokens.filter(token => token.symbol !== 'USDT').map((token) => {
                    const tokenData = walletData[token.symbol as keyof typeof walletData];
                    if (!tokenData) return null;

                    return (
                      <motion.div
                        key={token.symbol}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 bg-card rounded-xl border border-border/50 hover:border-primary/30 transition-all cursor-pointer shadow-sm"
                        onClick={() => setSelectedToken(token.symbol)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {getCoinGeckoLogo(token.symbol) ? (
                              <img 
                                src={getCoinGeckoLogo(token.symbol)} 
                                alt={`${token.name} logo`} 
                                className="w-12 h-12 rounded-full"
                              />
                            ) : (
                              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", token.color)}>
                                <span className="text-white font-bold">{token.symbol[0]}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">{token.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {showBalances ? `${tokenData.balance} ${token.symbol}` : '••••••••'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {showBalances ? `$${tokenData.usdValue.toLocaleString()}` : '••••••••'}
                          </p>
                          <div className={cn(
                            "flex items-center justify-end text-sm",
                            tokenData.change24h >= 0 ? "text-green-500" : "text-red-500"
                          )}>
                            {tokenData.change24h >= 0 ? '+' : ''}{tokenData.change24h.toFixed(2)}%
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Receive Tab */}
              <TabsContent value="receive" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowDownLeft className="w-5 h-5 text-green-500" />
                      Receive Crypto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Token Selection */}
                    <div className="space-y-2">
                      <Label>Select Token</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {(showAllTokens ? supportedTokens : supportedTokens.filter(t => t.symbol === 'USDT')).map((token) => (
                          <Button
                            key={token.symbol}
                            variant={selectedToken === token.symbol ? "default" : "outline"}
                            className="h-auto p-3 flex flex-col gap-2"
                            onClick={() => {
                              setSelectedToken(token.symbol);
                              setSelectedNetwork(token.networks[0]);
                            }}
                          >
                            {getCoinGeckoLogo(token.symbol) ? (
                              <img 
                                src={getCoinGeckoLogo(token.symbol)} 
                                alt={`${token.name} logo`} 
                                className="w-6 h-6 rounded-full mx-auto"
                              />
                            ) : (
                              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center mx-auto", token.color)}>
                                <span className="text-white text-xs font-bold">{token.symbol[0]}</span>
                              </div>
                            )}
                            <span className="text-xs">{token.symbol}</span>
                          </Button>
                        ))}
                        {!showAllTokens && (
                          <Button
                            variant="outline"
                            className="h-auto p-3 flex flex-col gap-2 border-dashed border-primary/50"
                            onClick={() => setShowAllTokens(true)}
                          >
                            <Plus className="w-6 h-6 mx-auto text-primary" />
                            <span className="text-xs text-primary">More</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Network Selection */}
                    <div className="space-y-2">
                      <Label>Network</Label>
                      <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {supportedTokens
                            .find(t => t.symbol === selectedToken)
                            ?.networks.map((network) => (
                              <SelectItem key={network} value={network}>
                                {network}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* QR Code and Address */}
                    <div className="space-y-4">
                      <div className="bg-white p-6 rounded-xl border-2 border-dashed border-muted-foreground/30">
                        {smartAddress ? (
                          <QRCodeCanvas
                            value={smartAddress}
                            size={200}
                            className="mx-auto"
                            includeMargin
                          />
                        ) : (
                          <div className="w-[200px] h-[200px] mx-auto flex items-center justify-center text-muted-foreground text-sm">
                            Loading address…
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Your {selectedToken} Address (Sepolia Smart Account)</Label>
                        <div className="flex gap-2">
                          <Input
                            value={smartAddress ?? 'Loading…'}
                            readOnly
                            className="font-mono text-sm bg-muted/50"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => smartAddress && copyToClipboard(smartAddress)}
                            disabled={!smartAddress}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
                        <h4 className="font-bold text-amber-800 dark:text-amber-200 mb-2">⚠️ Important</h4>
                        <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                          <li>• Only send {selectedToken} to this address</li>
                          <li>• Use {selectedNetwork} network only</li>
                          <li>• Minimum deposit: 10 {selectedToken}</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Send Tab */}
              <TabsContent value="send" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowUpRight className="w-5 h-5 text-red-500" />
                      Send Crypto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Token Selection for Send */}
                    <div className="space-y-2">
                      <Label>Select Token to Send</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {(showAllTokens ? supportedTokens : supportedTokens.filter(t => t.symbol === 'USDT')).map((token) => {
                          const tokenData = walletData[token.symbol as keyof typeof walletData];
                          if (!tokenData) return null;
                          return (
                            <Button
                              key={token.symbol}
                              variant={selectedToken === token.symbol ? "default" : "outline"}
                              className="h-auto p-3 flex flex-col gap-2"
                              onClick={() => setSelectedToken(token.symbol)}
                            >
                              {getCoinGeckoLogo(token.symbol) ? (
                                <img 
                                  src={getCoinGeckoLogo(token.symbol)} 
                                  alt={`${token.name} logo`} 
                                  className="w-6 h-6 rounded-full mx-auto"
                                />
                              ) : (
                                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center mx-auto", token.color)}>
                                  <span className="text-white text-xs font-bold">{token.symbol[0]}</span>
                                </div>
                              )}
                              <span className="text-xs">{token.symbol}</span>
                              <span className="text-xs text-muted-foreground">
                                {showBalances ? tokenData.balance.toFixed(4) : '••••'}
                              </span>
                            </Button>
                          );
                        })}
                        {!showAllTokens && (
                          <Button
                            variant="outline"
                            className="h-auto p-3 flex flex-col gap-2 border-dashed border-primary/50"
                            onClick={() => setShowAllTokens(true)}
                          >
                            <Plus className="w-6 h-6 mx-auto text-primary" />
                            <span className="text-xs text-primary">More</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Withdrawal Destination Selection */}
                    <div className="space-y-2">
                      <Label className="text-base font-bold">Send To</Label>
                      <Tabs value={sendDestTab} onValueChange={(v) => setSendDestTab(v as 'default' | 'external')} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="default">Default Wallet</TabsTrigger>
                          <TabsTrigger value="external">External Address</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="default" className="mt-3">
                          <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-base">Default Withdrawal Wallet</h4>
                              <Badge variant="secondary" className="text-xs">Verified</Badge>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                                <span className="text-white text-xs font-bold">UB</span>
                              </div>
                              <div className="flex-1">
                                <span className="text-base font-bold">USDT BANC Secure Wallet</span>
                                <p className="text-sm text-muted-foreground font-mono">
                                  {import.meta.env.VITE_DEFAULT_WITHDRAWAL_ADDRESS ?? 'Not configured'}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-green-500">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span>Instant transfer • No fees</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="external" className="mt-3">
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label className="text-base font-bold">External Wallet Address</Label>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Enter 0x… Polygon address"
                                  className="flex-1 font-mono text-base"
                                  value={toAddress}
                                  onChange={(e) => setToAddress(e.target.value.trim())}
                                />
                                <Button variant="outline" size="icon">
                                  <Scan className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                              <div className="flex items-start gap-2">
                                <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center mt-0.5">
                                  <span className="text-white text-xs">!</span>
                                </div>
                                <div className="space-y-1">
                                  <h5 className="text-base font-bold text-amber-800 dark:text-amber-200">External Transfer Notice</h5>
                                  <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-0.5">
                                    <li>• Network fees apply for external transfers</li>
                                    <li>• Processing time: 5-30 minutes depending on network</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                    {/* Send Form */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-base font-bold">Amount</Label>
                        <div className="space-y-2">
                          <Input
                            type="number"
                            placeholder="0.00"
                            className="text-xl font-bold"
                            value={sendAmount}
                            onChange={(e) => setSendAmount(e.target.value)}
                            min="0"
                          />
                          <div className="flex justify-between text-base text-muted-foreground">
                            <span>
                              Available:{' '}
                              {selectedToken === 'USDT'
                                ? `${parseFloat(usdtOnChainBalance).toFixed(2)} USDT`
                                : `${walletData[selectedToken as keyof typeof walletData]?.balance || 0} ${selectedToken}`}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-primary"
                              onClick={() => {
                                if (selectedToken === 'USDT') setSendAmount(usdtOnChainBalance);
                              }}
                            >
                              Max
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base font-bold">Network Fee</Label>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <span className="text-base font-bold">Sponsored</span>
                          <span className="text-base font-bold text-green-500">Free (Alchemy Gas Manager)</span>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 py-3 text-base font-bold"
                        onClick={handleSend}
                        disabled={sending || !sendAmount }
                      >
                        {sending ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending…
                          </span>
                        ) : (
                          'Send USDT'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Quick Actions - Trust Wallet Style */}
          <div className="px-4 pb-6">
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold mb-1">DeFi</h4>
                  <p className="text-xs text-muted-foreground">Earn with DeFi</p>
                </CardContent>
              </Card>

              <Card className="border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold mb-1">NFTs</h4>
                  <p className="text-xs text-muted-foreground">Collect NFTs</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="px-4 pb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Activity
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {txLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : transactions.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-6">No transactions yet</p>
                ) : (
                  transactions.slice(0, 10).map((tx) => {
                    const isReceived = tx.type === 'deposit' || tx.type === 'receive' || tx.type === 'received';
                    const label = isReceived ? 'Received' : 'Sent';
                    const amountStr = isReceived ? `+${tx.amount}` : `-${tx.amount}`;
                    const timeAgo = (() => {
                      const diff = Date.now() - new Date(tx.timestamp || tx.created_at).getTime();
                      const mins = Math.floor(diff / 60000);
                      if (mins < 60) return `${mins}m ago`;
                      const hrs = Math.floor(mins / 60);
                      if (hrs < 24) return `${hrs}h ago`;
                      return `${Math.floor(hrs / 24)}d ago`;
                    })();
                    return (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            isReceived ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
                          )}>
                            {isReceived ? (
                              <ArrowDownLeft className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{label} {tx.crypto_type}</p>
                            <p className="text-xs text-muted-foreground">{timeAgo}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            "font-semibold",
                            isReceived ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          )}>
                            {amountStr} {tx.crypto_type}
                          </p>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
  );
};