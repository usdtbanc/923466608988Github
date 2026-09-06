import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Layout } from "./components/Layout";
import { WalletActivationGate } from "./components/WalletActivationGate";
import { useAuth } from "./hooks/useAuth";
import { PublicPageShell } from "./components/PublicPageShell";
import { Auth } from "./pages/Auth";
import { Landing } from "./pages/Landing";
import { Home } from "./pages/Home";
import { Market } from "./pages/Market";
import { Wallet } from "./pages/Wallet";
import { Profile } from "./pages/Profile";
import { About } from "./pages/About";
import { Terms } from "./pages/Terms";
import { Privacy } from "./pages/Privacy";
import { Disclaimer } from "./pages/Disclaimer";
import { RefundPolicy } from "./pages/RefundPolicy";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  );
};

const AppRoutes = () => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/about" element={<PublicPageShell><About /></PublicPageShell>} />
        <Route path="/terms" element={<PublicPageShell><Terms /></PublicPageShell>} />
        <Route path="/privacy" element={<PublicPageShell><Privacy /></PublicPageShell>} />
        <Route path="/disclaimer" element={<PublicPageShell><Disclaimer /></PublicPageShell>} />
        <Route path="/refund-policy" element={<PublicPageShell><RefundPolicy /></PublicPageShell>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <WalletActivationGate>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/market" element={<Market />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
        </Route>
        {/* /auth only exists in the signed-out route table above — without this, a user
            who just logged in (moving from /auth to /) and hits Back lands on /auth here,
            which doesn't exist in this table, and falls through to the *, showing a real
            404 instead of just bouncing them back to Home where they already belong. */}
        <Route path="/auth" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </WalletActivationGate>
  );
};

export default App;
