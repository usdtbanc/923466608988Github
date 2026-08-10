import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Lock, ShieldCheck, Globe, CheckCircle2, BookOpen, UserCog, Layers, Wallet, KeyRound, Coins, Receipt, Ban, Mail } from "lucide-react";
import { jsPDF } from "jspdf";

export const Terms = () => {
  // SEO basics
  useEffect(() => {
    document.title = "Terms & Conditions • USDT BANC";
    const desc = "USDT Banc Terms: eligibility, services, responsibilities, risks, and contact.";
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", desc); else {
      const m = document.createElement("meta");
      m.name = "description"; m.content = desc; document.head.appendChild(m);
    }
    const existing = document.querySelector('link[rel="canonical"]');
    const href = window.location.href;
    if (existing) existing.setAttribute("href", href); else {
      const l = document.createElement("link"); l.rel = "canonical"; l.href = href; document.head.appendChild(l);
    }
    // JSON-LD WebPage
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Terms and Conditions",
      description: desc,
      url: href,
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  const intro = "These Terms of Service (\"Terms\") govern your access to and use of the website located at https://www.usdtbanc.com, the USDT Banc application, embedded wallet functionality, and all related products and services (collectively, the \"Platform\" or \"Services\") made available by USDT Banc Inc., a California stock corporation with its principal place of business at 5482 Wilshire Blvd, Suite 1915, Los Angeles, CA 90036 (entity number B20260213455) (\"USDT Banc,\" \"Company,\" \"we,\" \"us,\" or \"our\"). Please read these Terms carefully. They contain important information regarding the non-custodial nature of the Platform, the role of independent third-party providers, mandatory arbitration, and limitations on Company's liability.";

  const effectiveDate = "July 30, 2026";

  const sections = useMemo(() => ([
    {
      title: "Acceptance of Terms",
      points: [
        "By creating an Account, accessing the Platform, or using any Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and by our Privacy Policy, which is incorporated into these Terms by reference. If you do not agree to these Terms, you must not access or use the Platform.",
        "If you are using the Platform on behalf of an entity, you represent that you have authority to bind that entity, and \"you\" refers to that entity as well as to you individually.",
        "These Terms may be updated from time to time as described in Section 27. Your continued use of the Platform after an update becomes effective constitutes your acceptance of the revised Terms.",
      ],
      icon: CheckCircle2,
    },
    {
      title: "Definitions",
      points: [
        "\"Platform\" or \"Services\" means the USDT Banc website, mobile and web applications, embedded wallet functionality, and all related software, features, and services made available by the Company.",
        "\"Digital Assets\" means Bitcoin (BTC), Ethereum (ETH), Tether (USDT), XRP, and Solana (SOL), together with any additional cryptocurrency or digital asset that the Company may support on the Platform from time to time, and any digital asset the Company may discontinue supporting.",
        "\"Embedded Wallet\" means a non-custodial digital asset wallet made available to you through the Platform using wallet infrastructure provided by Privy, as further described in Section 6.",
        "\"Third-Party Provider\" means an independent third party that provides services integrated with or accessible through the Platform, including Paybis (fiat on-ramp and off-ramp processing), Privy (embedded wallet infrastructure), Supabase (backend data infrastructure), and Namecheap (hosting and domain services), together with any additional, substitute, or replacement provider the Company may engage from time to time.",
        "\"Fiat On-Ramp Transaction\" means a transaction in which fiat currency is converted into a Digital Asset through a Third-Party Provider.",
        "\"Fiat Off-Ramp Transaction\" means a transaction in which a Digital Asset is converted into fiat currency through a Third-Party Provider.",
        "\"Account\" means the user profile you create on the Platform, associated with a unique internal user/profile identifier, username, and email address.",
        "\"Blockchain\" means the distributed ledger network associated with a given Digital Asset, including the Bitcoin, Ethereum, XRP Ledger, and Solana networks, and any other network the Company may support.",
      ],
      icon: BookOpen,
    },
    {
      title: "Eligibility",
      points: [
        "To use the Platform, you represent and warrant that you:",
        "Are at least 18 years of age or the age of majority in your jurisdiction of residence, whichever is greater.",
        "Have the legal capacity to enter into a binding contract.",
        "Are not located in, organized under the laws of, or a resident of any country, region, or territory that is subject to comprehensive U.S. or applicable regional sanctions, and are not otherwise identified on any restricted party, denied person, or sanctioned party list maintained by the U.S. Department of the Treasury's Office of Foreign Assets Control (OFAC), the United Nations, the European Union, or any other applicable governmental authority.",
        "Are accessing the Platform from within the Americas or the Eurozone, or another jurisdiction the Company has expressly made the Platform available in.",
        "Will provide true, current, and complete information during registration and will promptly update such information if it changes.",
        "Will comply with these Terms and all applicable laws in connection with your use of the Platform.",
        "The Company may restrict, suspend, or decline to make the Platform available in any country, state, or region at its discretion, including in response to changes in applicable law or the requirements of a Third-Party Provider.",
      ],
      icon: ShieldCheck,
    },
    {
      title: "Account Registration and User Accounts",
      points: [
        "To use most Services, you must register for an Account by providing certain personal information, which currently includes your first name, last name, username, email address, country, telephone number, password, and a separate withdrawal password used to authorize outbound transfers. You may also be assigned an internal user/profile identifier for account administration purposes.",
        "Creating an Embedded Wallet through the Platform does not, by itself, require identity verification. Identity verification requirements applicable to buying or selling Digital Assets are addressed in Section 15.",
        "You are solely responsible for maintaining the confidentiality of your password, your withdrawal password, and any other Account credentials, and for all activity that occurs under your Account. You must notify us promptly at the contact address in Section 28 if you suspect unauthorized access to your Account. The Company is not liable for any loss arising from your failure to safeguard your credentials, except to the extent caused by the Company's own gross negligence or willful misconduct.",
        "You may not create more than one Account, transfer your Account to another person, or permit another person to access the Platform using your Account, except with the Company's prior written consent.",
        "The Company reserves the right to refuse to open, or to suspend or close, an Account at its discretion, including where required to comply with applicable law, to prevent fraud, or in accordance with Section 18.",
      ],
      icon: UserCog,
    },
    {
      title: "Platform Services",
      points: [
        "Through the Platform, you may be able to: (a) create an Embedded Wallet; (b) buy Digital Assets using fiat currency; (c) sell Digital Assets for fiat currency; (d) store supported Digital Assets; (e) send Digital Assets to other wallet addresses; and (f) otherwise view and manage your Digital Assets. The Company currently supports USDT, BTC, ETH, XRP, and SOL, and makes the Platform available to users in the Americas and the Eurozone, subject to Section 3.",
        "The Company may add, remove, or modify supported Digital Assets, supported networks, supported jurisdictions, and Platform features at any time, with or without notice, and is under no obligation to continue supporting any particular Digital Asset, network, or feature. If support for a Digital Asset you hold is discontinued, the Company will use commercially reasonable efforts to provide advance notice and a reasonable opportunity to withdraw or transfer that Digital Asset before discontinuation takes effect, except where doing so is not reasonably practicable, such as in response to a security incident or a Third-Party Provider's own discontinuation of support.",
        "The Company does not guarantee that the Platform will be available at all times, uninterrupted, or free of errors, and may suspend the Platform for maintenance, security, or other operational reasons.",
      ],
      icon: Layers,
    },
    {
      title: "Non-Custodial Nature of the Platform",
      points: [
        "USDT Banc operates solely as a technology platform. USDT Banc is not a cryptocurrency exchange, a money transmitter, a broker-dealer, a bank, a financial institution, a custodian, or an investment adviser. The Company does not buy or sell Digital Assets on its own account, does not execute cryptocurrency transactions, does not hold customer funds or Digital Assets, does not control customer wallets, and does not access, store, or have the ability to recover users' private keys or seed phrases.",
        "Embedded Wallets are created and operated using non-custodial wallet infrastructure provided by Privy. Private key material associated with your Embedded Wallet is generated and secured at the user level, and the Company does not have independent access to, custody of, or control over your private keys or seed phrases.",
        "Because Embedded Wallets are provisioned in connection with your Account and its associated authentication credentials, suspension, restriction, or termination of your Account may affect your practical ability to access your Embedded Wallet through the Platform, even though the Company itself never takes custody of your private keys. You are strongly encouraged to independently export, back up, and securely store your wallet recovery information where the Platform makes such export available, so that your access to your Digital Assets does not depend solely on your Account remaining active.",
        "Nothing in this Section 6 is intended to constitute, and should not be relied upon as, a determination of the Company's regulatory status under the laws of any specific jurisdiction. The Company reserves the right to modify, restrict, or suspend any Service in any jurisdiction as necessary to comply with applicable law.",
      ],
      icon: Wallet,
    },
    {
      title: "Third-Party Services",
      points: [
        "Fiat on-ramp and off-ramp transactions available through the Platform are processed by Paybis, an independent Third-Party Provider. Embedded Wallet infrastructure is provided by Privy. Backend data infrastructure is provided by Supabase. Hosting and domain services are provided by Namecheap. The Company may engage additional Third-Party Providers, or replace or remove any existing Thder's services, including Paybis's buy and sell functionality, is subject to that Third-Party Provider's own terms of service, privacy policy, and compliance procedures, which you are responsible for reviewing and accepting separately. [NOTE: this sentence appears to have text missing in the source — please confirm the intended wording.] The Company is not a party to your relationship with any Third-Party Provider and is not responsible or liable for any Third-Party Provider's acts, omissions, errors, delays, fees, exchange rates, service interruptions, or compliance decisions, including decisions to decline, delay, freeze, or reverse a transaction.",
        "The Company may share information about you with Third-Party Providers to the extent necessary to facilitate the Services, as described in our Privacy Policy.",
      ],
      icon: Globe,
    },
    {
      title: "Wallet Responsibilities",
      points: [
        "You are solely responsible for: (a) the accuracy of any wallet address you enter or provide; (b) selecting the correct Blockchain network for any transaction; (c) the accuracy of recipient details; and (d) any transfer instructions you submit. Blockchain transactions are generally irreversible once broadcast and confirmed on the applicable network, and the Company has no ability to cancel, reverse, or recover a transaction once it has been submitted to a Blockchain.",
        "You are responsible for maintaining the security of your Account credentials, your withdrawal password, your device, and, where applicable, any exported wallet recovery information. Loss of your password, withdrawal password, device access, or exported recovery information may result in permanent loss of access to your Digital Assets, and the Company has no ability to reset, recover, or restore access to a non-custodial wallet on your behalf.",
        "We strongly recommend enabling two-factor authentication, safeguarding any exported recovery information offline, and never disclosing your password, withdrawal password, or recovery information to any third party, including anyone claiming to represent USDT Banc.",
      ],
      icon: KeyRound,
    },
    {
      title: "Fees",
      points: [
        "The Company charges a fee of 2.9% on every Fiat On-Ramp Transaction and a fee of 2.9% on every Fiat Off-Ramp Transaction processed through the Platform. The Company does not charge spreads, withdrawal fees, custody fees, or any other platform fee beyond the fees described in this Section 9.",
        "Third-Party Providers, including Paybis, may separately charge their own processing fees, apply their own foreign exchange rates or spreads, and pass through Blockchain network fees, gas fees, or other third-party charges. These amounts are set and collected by the applicable Third-Party Provider, not by the Company, and are disclosed to you by that provider before you confirm a transaction.",
        "The Company will present applicable Company fees to you before you confirm a Fiat On-Ramp or Fiat Off-Ramp Transaction. The Company may change its fees at any time by posting updated fee information on the Platform or updating these Terms; changes will apply prospectively to transactions initiated after the change takes effect.",
      ],
      icon: Coins,
    },
    {
      title: "Taxes",
      points: [
        "You are solely responsible for determining what, if any, taxes apply to your transactions on the Platform, including any purchase, sale, transfer, or other disposition of Digital Assets, and for reporting and remitting the correct amount of tax to the appropriate tax authority. The Company does not withhold taxes on your behalf and does not provide tax reporting to any tax authority except to the extent required by applicable law.",
        "Nothing on the Platform or in these Terms constitutes tax advice. You should consult your own tax professional regarding the tax consequences of your use of the Platform.",
      ],
      icon: Receipt,
    },
    {
      title: "Transaction Finality",
      points: [
        "Digital Asset transactions submitted to a Blockchain are generally irreversible once confirmed. The Company is not responsible for, and will have no liability arising from, losses resulting from: (a) incorrect wallet addresses; (b) selection of an incorrect Blockchain network; (c) other user error; (d) Blockchain failures, forks, or protocol errors; (e) network congestion or delay; (f) market volatility or fluctuations in the value of any Digital Asset; (g) the acts, omissions, or failures of any Third-Party Provider; or (h) unauthorized access to your wallet resulting from your failure to safeguard your credentials or recovery information.",
      ],
      icon: Ban,
    },
    {
      title: "Contact Information",
      points: [
        "USDT Banc Inc.",
        "5482 Wilshire Blvd, Suite 1915",
        "Los Angeles, CA 90036",
        "General inquiries: support@usdtbanc.com",
      ],
      icon: Mail,
    },
  ]), []);

  const fullText = useMemo(() => {
    const header = `USDT Banc – Terms of Service\nLast Updated Date: ${effectiveDate}`;
    const blocks = sections.map(s => `${s.title}\n- ${s.points.join("\n- ")}`);
    return [header, intro, ...blocks].join("\n\n");
  }, [sections, intro, effectiveDate]);

  const downloadTxt = () => {
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "usdtbanc-terms.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFontSize(16);
    doc.text("USDT BANC — Terms & Conditions", 40, 48);
    doc.setFontSize(11.5);
    const maxWidth = 515; // 595 - 2*40
    let y = 80;
    const lines = doc.splitTextToSize(fullText, maxWidth);
    lines.forEach(line => {
      if (y > 780) { doc.addPage(); y = 40; }
      doc.text(line, 40, y);
      y += 16.5;
    });
    doc.save("usdtbanc-terms.pdf");
  };

  return (
    <main>
      <section className="relative mb-6 overflow-hidden rounded-2xl border border-primary/20 bg-card/90 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="relative p-6 lg:p-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground max-w-3xl">{intro}</p>
          <div className="mt-2 text-xs text-muted-foreground">Last Updated Date: {effectiveDate}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">KYC/AML</Badge>
            <Badge variant="secondary">Risk Disclosure</Badge>
            <Badge variant="secondary">Custody</Badge>
          </div>
        </div>
      </section>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="space-y-4">
          {sections.map(({ title, points, icon: Icon }) => (
            <Card key={title} className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  {points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={downloadPdf} className="bg-gradient-to-r from-primary to-secondary glow-effect">
          <Download className="h-4 w-4 mr-2" /> Download PDF
        </Button>
        <Button variant="outline" onClick={downloadTxt}>
          <Download className="h-4 w-4 mr-2" /> Download TXT
        </Button>
        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" /> Your acknowledgment is required to use the platform
        </div>
      </div>
    </main>
  );
};
