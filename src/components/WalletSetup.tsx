import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLoginWithEmail } from '@privy-io/react-auth';
import { useToast } from '@/hooks/use-toast';

interface WalletSetupProps {
  email: string;
}

/**
 * Shown once after Supabase login when Privy has not yet created the embedded wallet.
 * Sends an OTP to the user's email and verifies it to activate the Privy wallet.
 * Once loginWithCode succeeds, privyAuthenticated becomes true and AppRoutes
 * automatically advances the user into the app.
 */
export const WalletSetup = ({ email }: WalletSetupProps) => {
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const { sendCode, loginWithCode } = useLoginWithEmail();

  useEffect(() => {
    // Auto-send OTP as soon as this screen mounts
    sendCode({ email })
      .then(() => setCodeSent(true))
      .catch(() => {
        toast({ title: 'Could not send code', description: 'Please try again.', variant: 'destructive' });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const verify = async () => {
    if (code.length < 6) return;
    setLoading(true);
    try {
      await loginWithCode({ code });
      // privyAuthenticated in AppRoutes will flip to true → app renders automatically
    } catch {
      toast({ title: 'Invalid code', description: 'Check the code and try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    await sendCode({ email });
    toast({ title: 'Code resent', description: `Check ${email}` });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 cyber-grid">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm sm:max-w-md relative z-10"
      >
        <Card className="backdrop-blur-xl bg-card/80 border border-primary/20 neon-border">
          <CardHeader className="text-center space-y-3 p-4 sm:p-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto w-14 h-14 rounded-full bg-gradient-to-r from-primary to-secondary p-0.5"
            >
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary" />
              </div>
            </motion.div>
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Activate your wallet
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-muted-foreground mt-1">
                {codeSent
                  ? <>Enter the code sent to <span className="font-medium text-foreground">{email}</span></>
                  : 'Sending code to your email…'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-4">
            {!codeSent ? (
              <div className="flex justify-center py-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                />
              </div>
            ) : (
              <>
                <Input
                  autoFocus
                  placeholder="6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => e.key === 'Enter' && verify()}
                  className="text-center tracking-widest text-lg bg-background/50 border-primary/20 focus:border-primary"
                  maxLength={6}
                />
                <Button
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 glow-effect py-2 sm:py-3"
                  onClick={verify}
                  disabled={loading || code.length < 6}
                >
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>Enter app <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
                <button
                  type="button"
                  className="w-full text-xs text-muted-foreground hover:underline"
                  onClick={resend}
                >
                  Resend code
                </button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
