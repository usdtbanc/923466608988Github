import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Shield, Zap, Globe, Lock, TrendingUp, Wallet, ArrowRight,
  CheckCircle, ChevronRight, Coins, FileText, ExternalLink,
  Building2, MessageCircle, Menu, X, Phone, Hash, AlertTriangle, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─── Dashboard UI Mockup ─────────────────────────────────────────────────── */
const DashboardMockup = () => (
  <div className="relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden border border-primary/30 shadow-2xl neon-border bg-card">
    {/* Sidebar strip */}
    <div className="flex h-[340px] sm:h-[400px]">
      <div className="w-14 sm:w-20 bg-card border-r border-border/60 flex flex-col items-center pt-4 gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary/70 flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xs">U</span>
        </div>
        {[Home, TrendingUp, Wallet, Lock].map((Icon, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded-lg flex items-center justify-center mt-${i === 0 ? 4 : 0} ${i === 0 ? 'bg-primary' : 'bg-muted/40'}`}
          >
            <Icon className={`w-4 h-4 ${i === 0 ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 p-3 sm:p-4 overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs sm:text-sm font-bold text-foreground">Home</span>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-[8px] font-bold text-primary-foreground">UB</span>
          </div>
        </div>

        {/* Hero text */}
        <h2 className="text-sm sm:text-base font-black bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent leading-tight mb-1">
          Welcome to USDT BANC
        </h2>
        <p className="text-[10px] sm:text-xs text-muted-foreground mb-3 leading-tight">
          Your non-custodial crypto wallet — USDT, BTC, XRP, SOL
        </p>

        {/* Region buttons */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 rounded-lg bg-primary py-2 text-center">
            <span className="text-primary-foreground text-[10px] sm:text-xs font-bold">AMERICAS</span>
          </div>
          <div className="flex-1 rounded-lg bg-primary py-2 text-center">
            <span className="text-primary-foreground text-[10px] sm:text-xs font-bold">EUROZONE</span>
          </div>
        </div>

        {/* Crypto price cards */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'USDT', price: '$1.00', change: '+0.01%', color: 'text-green-400' },
            { label: 'BTC', price: '$67,420', change: '+2.3%', color: 'text-green-400' },
            { label: 'ETH', price: '$3,512', change: '-0.8%', color: 'text-red-400' },
            { label: 'SOL', price: '$182', change: '+4.1%', color: 'text-green-400' },
          ].map((coin) => (
            <div key={coin.label} className="rounded-lg bg-muted/40 border border-border/50 p-2">
              <div className="text-[10px] font-bold text-foreground">{coin.label}</div>
              <div className="text-[10px] sm:text-xs font-semibold text-foreground">{coin.price}</div>
              <div className={`text-[9px] ${coin.color}`}>{coin.change}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="border-t border-border/60 bg-muted/20 px-4 py-2 flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      <span className="text-[10px] text-muted-foreground">Secure • Encrypted • Non-custodial</span>
    </div>
  </div>
);

/* Dummy icons for the mockup sidebar (re-use lucide) */
function Home(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

/* ─── Landing Page ────────────────────────────────────────────────────────── */
export const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-shadow">
              <span className="text-primary-foreground font-black text-base">U</span>
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent hidden sm:block">
              USDT BANC
            </span>
          </Link>

          {/* Nav links (desktop) — right-aligned */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground ml-auto">
            <a href="#services" className="hover:text-foreground transition-colors">Services</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
            <a href="#company-overview" className="hover:text-foreground transition-colors">Company Overview</a>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden ml-auto p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-border/40 bg-background/95 backdrop-blur-xl"
            >
              <div className="flex flex-col px-4 py-3 gap-1 text-sm font-medium text-muted-foreground">
                {(['services', 'how-it-works', 'about', 'company-overview'] as const).map((id) => (
                  <button
                    key={id}
                    className="py-2.5 text-left hover:text-foreground transition-colors"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setTimeout(() => {
                        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                      }, 150);
                    }}
                  >
                    {id === 'services' ? 'Services' : id === 'how-it-works' ? 'How It Works' : id === 'about' ? 'About' : 'Company Overview'}
                  </button>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden cyber-grid">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: copy */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 sm:space-y-8 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs sm:text-sm font-semibold">
                <Zap className="h-3.5 w-3.5" />
                Non-custodial · Multi-chain · Instant
              </div>

              <h1 className="font-black leading-tight text-foreground">
                Buy, store, and manage{' '}
                <span className="bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent text-glow">
                  crypto in one place
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                USDT BANC gives you a secure, self-custody wallet supporting USDT, Bitcoin, XRP, and Solana — with built-in fiat on-ramp for the Americas and Eurozone.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button size="lg" asChild className="bg-gradient-to-r from-blue-500 to-blue-400  hover:from-blue-600 hover:to-blue-500 text-white glow-effect font-bold text-base px-8">
                  <Link to="/auth?tab=signup">
                    Open Free Account <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-primary/30 hover:border-primary font-semibold text-base">
                  <Link to="/auth?tab=login">Sign In</Link>
                </Button>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-xs text-muted-foreground">
                {['No KYC for wallet setup', 'Client-side encryption', '2FA protected', 'Multi-chain support'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right: dashboard mockup */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <DashboardMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Company Overview ─────────────────────────────────────────────────── */}
      <section className="bg-card/50 border-y border-border py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed">
            USDT BANC is a non-custodial crypto banking platform serving users across the Americas and Eurozone. We make it simple for anyone to buy, hold, and transfer digital assets — without ever holding your private keys on our servers.
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10">
            {[
              { value: '4+', label: 'Supported Chains' },
              { value: '10', label: 'Fiat Regions' },
              { value: '256-bit', label: 'AES Encryption' },
              { value: '100%', label: 'Non-custodial' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── About the Company ────────────────────────────────────────────────── */}
      <section id="about" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Company Overview Box */}
            <motion.div
            id='company-overview'
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="rounded-2xl border border-primary/20 bg-card p-6 sm:p-8 neon-border space-y-6 h-full flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                      <span className="text-primary-foreground font-black text-2xl">U</span>
                    </div>
                    <div>
                      <div className="text-xl font-black bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">Company Overview</div>
                      <div className="text-sm text-muted-foreground">Your Crypto Banking Platform</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    USDT Banc is a digital asset platform designed to make cryptocurrency simple, fast, and accessible. Our platform enables users to buy, store, send, and invest in crypto securely, all in one place.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    We focus on delivering a seamless user experience with strong security, transparent processes, and global accessibility.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* {['Non-custodial', 'Multi-chain', 'TOTP 2FA', 'AES-GCM Encryption', 'Client-side vault'].map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 font-medium">
                      {tag}
                    </span>
                  ))} */}
                </div>
              </div>
            </motion.div>

            {/* About USDT BANC Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="rounded-2xl border border-primary/20 bg-card p-6 sm:p-8 neon-border space-y-6 h-full flex flex-col">
                <div>
                  <div className="text-xl font-black text-foreground mb-1">About USDT BANC</div>
                  <div className="h-1 w-12 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                </div>
                <div className="space-y-4 flex-1">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    USDT Banc is a technology-driven company focused on simplifying access to digital assets worldwide. Our mission is to bridge the gap between traditional finance and the crypto economy by providing a user-friendly and secure platform.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We believe that cryptocurrency should be accessible to everyone, regardless of technical experience. That’s why we built a platform that allows users to easily buy, store, send, and invest in digital assets with confidence.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Our goal is to create a reliable ecosystem where users can manage their crypto assets efficiently while benefiting from innovative financial solutions. We are committed to transparency, compliance, and continuous improvement as we expand our services globally.
                  </p>
                </div>
                {/* <ul className="space-y-3 text-sm">
                  {[
                    'Private keys never leave your device',
                    'Fiat on-ramp with bank-grade compliance',
                    'TOTP two-factor authentication on every withdrawal',
                    'Open architecture — no lock-in',
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {point}
                    </li>
                  ))}
                </ul> */}
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 cyber-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/5 pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="font-black bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent text-glow">
              Ready to take control of your crypto?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Join USDT BANC today — free to open, nothing to install, and your keys stay yours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">

            {/* Brand — spans 2 cols on large screens */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-primary-foreground font-black text-sm">U</span>
                </div>
                <span className="text-lg font-black bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">USDT BANC</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                Your secure, non-custodial crypto banking platform. Buy, store, and manage digital assets with confidence.
              </p>
              {/* Social media */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">Follow Us</p>
                <div className="flex items-center gap-3">
                  {/* X / Twitter */}
                  <a href="https://x.com/usdtbanc" target="_blank" rel="noopener noreferrer"
                    aria-label="X (Twitter)"
                    className="w-8 h-8 rounded-lg bg-muted/60 border border-border hover:border-primary/40 flex items-center justify-center transition-colors group">
                    <svg className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 5.897 5.45-5.897Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  {/* Telegram */}
                  <a href="https://t.me/usdtbanc" target="_blank" rel="noopener noreferrer"
                    aria-label="Telegram"
                    className="w-8 h-8 rounded-lg bg-muted/60 border border-border hover:border-primary/40 flex items-center justify-center transition-colors group">
                    <svg className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </a>
                  {/* Instagram */}
                  <a href="https://instagram.com/usdtbanc" target="_blank" rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-8 h-8 rounded-lg bg-muted/60 border border-border hover:border-primary/40 flex items-center justify-center transition-colors group">
                    <svg className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                    </svg>
                  </a>
                  {/* LinkedIn */}
                  <a href="https://linkedin.com/company/usdtbanc" target="_blank" rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="w-8 h-8 rounded-lg bg-muted/60 border border-border hover:border-primary/40 flex items-center justify-center transition-colors group">
                    <svg className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-sm font-bold text-foreground mb-3">Platform</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {/* <li><Link to="/auth?tab=signup" className="hover:text-primary transition-colors">Create Account</Link></li> */}
                {/* <li><Link to="/auth?tab=login" className="hover:text-primary transition-colors">Sign In</Link></li> */}
                <li><a href="#services" className="hover:text-primary transition-colors">Services</a></li>
                <li><a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
                <li><a href="#about" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#about" className="hover:text-primary transition-colors">Company Overview</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-bold text-foreground mb-3">Support</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <a href="https://api.whatsapp.com/send?phone=16464204646" target="_blank" rel="noopener noreferrer"
                    className="hover:text-primary transition-colors flex items-center gap-1">
                    WhatsApp Support <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a href="https://www.usdtbanc.com" target="_blank" rel="noopener noreferrer"
                    className="hover:text-primary transition-colors flex items-center gap-1">
                    www.usdtbanc.com <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-bold text-foreground mb-3">Legal</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <Link to="/terms" className="hover:text-primary transition-colors flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-primary transition-colors flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/disclaimer" className="hover:text-primary transition-colors flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Disclaimer
                  </Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="hover:text-primary transition-colors flex items-center gap-1">
                    <RotateCcw className="h-3 w-3" /> Refund Policy & Transaction Finality
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Company details — required by Paybis compliance */}
          <div className="border-t border-border/60 pt-6 mb-4">
            <div className="rounded-2xl border border-primary/20 bg-card p-6 neon-border space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-3 w-3 text-primary-foreground" />
                </div>
                <span className="text-xs font-semibold text-foreground uppercase tracking-widest">Company Information</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Legal Name */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Legal Name</p>
                    <p className="text-xs font-semibold text-foreground">USDT Banc</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">DBA: USDT Banc</p>
                  </div>
                </div>
                {/* Entity Registration */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Hash className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Entity Registration</p>
                    <p className="text-xs font-semibold text-foreground">B20260213455</p>
                  </div>
                </div>
                {/* Address */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Address</p>
                    <p className="text-xs font-semibold text-foreground leading-relaxed">5482 Wilshire Blvd, Suite 1915<br />Los Angeles, CA 90035</p>
                  </div>
                </div>
                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Tel</p>
                    <p className="text-xs font-semibold text-foreground">310-890-5604</p>
                  </div>
                </div>
                {/* WhatsApp */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageCircle className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">WhatsApp</p>
                    <p className="text-xs font-semibold text-foreground">310-890-5604</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer + copyright */}
          <div className="space-y-3">
            <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
              <strong className="text-muted-foreground">Disclaimer:</strong> Cryptocurrency investments are subject to market risks. USDT BANC does not provide investment, tax, or legal advice. All transactions are made at your own risk. You must be at least 18 years old to use this service. By using USDT BANC you agree to our{' '}
              <Link to="/terms" className="underline hover:text-primary">Terms & Conditions</Link>{' '}
              and{' '}
              <Link to="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground/60">
              <span>© {new Date().getFullYear()} USDT BANC. All rights reserved.</span>
              <span>Secure • Decentralized • Future-Ready</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
