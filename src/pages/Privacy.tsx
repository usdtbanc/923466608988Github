import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Shield, Lock } from "lucide-react";
import { jsPDF } from "jspdf";

export const Privacy = () => {
  useEffect(() => {
    document.title = "Privacy Policy • USDT BANC";
    const desc = "USDT Banc Privacy Policy: how we collect, use, and protect your data.";
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
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "PrivacyPolicy",
      name: "Privacy Policy — USDT Banc",
      description: desc,
      url: href,
    } as const;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  const effectiveDate = "July 30, 2026";

  const intro = "This Privacy Policy describes how USDT Banc Inc., a California stock corporation, with its principal place of business at 5482 Wilshire Blvd., Suite 1915, Los Angeles, California 90036 (entity registration number B20260213455) (\"USDT Banc,\" \"Company,\" \"we,\" \"us,\" or \"our\"), collects, uses, discloses, and protects personal information in connection with the website located at https://www.usdtbanc.com, the USDT Banc application, and related services (collectively, the \"Platform\"). This Privacy Policy is incorporated into, and should be read together with, our Terms of Service. Capitalized terms not defined in this Privacy Policy have the meaning given to them in the Terms of Service.";

  const sections = useMemo(() => ([
    {
      title: "1. Information We Collect",
      points: [
        "When you register for and use an Account, we collect the following categories of personal information directly from you:",
        "First name and last name.",
        "Username.",
        "Email address.",
        "Country.",
        "Telephone number.",
        "Password (stored using industry-standard hashing techniques, never in plaintext).",
        "Withdrawal password (stored using industry-standard encryption techniques, never in plaintext).",
        "Internal user/profile identifier assigned by the Platform for account administration.",
        "Because Fiat On-Ramp and Fiat Off-Ramp Transactions are processed by Paybis, any identity verification documents or KYC information you provide in connection with such a transaction (for example, a government-issued ID or proof of address) are collected and processed directly by Paybis under its own privacy policy, not by USDT Banc. We may receive limited transaction status information from Paybis (such as whether a transaction was completed, declined, or flagged) for customer support, recordkeeping, and fraud-prevention purposes.",
      ],
    },
    {
      title: "2. Information Automatically Collected",
      points: [
        "When you visit or use the Platform, we and our service providers automatically collect certain technical information, including:",
        "IP address and approximate location derived from your IP address.",
        "Browser type and version.",
        "Device information, including device type and identifiers.",
        "Operating system.",
        "Log files, including access times, pages viewed, and referring/exit pages.",
        "Usage information, such as features used and actions taken on the Platform.",
        "Information collected through cookies and similar tracking technologies, as described in Section 3.",
      ],
    },
    {
      title: "3. Cookies and Tracking Technologies",
      points: [
        "We use cookies and similar tracking technologies to operate, secure, and improve the Platform. We use the following categories of cookies:",
        "Strictly necessary cookies, which are required for core functionality such as authentication and session management, and cannot be disabled without affecting the Platform's operation.",
        "Functional cookies, which remember your preferences and settings.",
        "Analytics cookies, which help us understand how the Platform is used so that we can improve it.",
        "You can control cookies through your browser settings, including by blocking or deleting cookies; however, disabling strictly necessary cookies may prevent you from using certain parts of the Platform. Where required by applicable law, including for users located in the Eurozone, we will present a cookie consent mechanism before placing non-essential cookies and will honor your choices made through that mechanism.",
      ],
    },
    {
      title: "4. How We Use Your Information",
      points: [
        "We use the personal information described above to:",
        "Register and authenticate your Account.",
        "Operate, maintain, and provide the Platform and its features.",
        "Communicate with you, including sending service notices, security alerts, and responding to support requests.",
        "Improve and develop the Platform and our services.",
        "Detect, investigate, and prevent fraud, abuse, and security incidents.",
        "Maintain the security and integrity of the Platform.",
        "Comply with applicable laws, regulations, and legal process, and enforce our Terms of Service.",
        "We do not sell your personal information.",
      ],
    },
    {
      title: "5. Sharing of Information; Third-Party Service Providers",
      points: [
        "We share personal information with the following categories of recipients, only to the extent necessary to provide the Platform:",
        "Paybis, to facilitate Fiat On-Ramp and Fiat Off-Ramp Transactions, including identity verification information you provide directly to Paybis.",
        "Privy, to provide embedded wallet infrastructure and authentication services.",
        "Supabase, which hosts our backend database infrastructure.",
        "Namecheap, which provides hosting and domain services for the Platform.",
        "Other service providers that support our operations, such as cloud infrastructure, email and communication tools, analytics, and customer support platforms, each bound by contractual obligations to protect your information and use it only to provide services to us.",
        "We may also disclose personal information: (a) to comply with applicable law, regulation, legal process, or governmental request; (b) to protect the rights, property, or safety of USDT Banc, our users, or others, including to detect and prevent fraud; and (c) in connection with a merger, acquisition, financing, or sale of some or all of our assets, in which case personal information may be among the transferred assets.",
        "We do not sell personal information, and we do not share personal information with third parties for cross-context behavioral advertising as currently practiced. If this changes, we will update this Privacy Policy and provide any opt-out mechanism required by applicable law.",
      ],
    },
    {
      title: "6. Data Security",
      points: [
        "We implement technical and organizational security measures designed to protect personal information, including client-side encryption, AES-256 encryption for data at rest, and two-factor authentication (2FA) for Account access. Passwords and withdrawal passwords are protected using industry-standard cryptographic techniques, including hashing and encryption, and are never stored or transmitted in plaintext.",
        "Because the Platform operates on a non-custodial wallet architecture, private keys and seed phrases associated with your Embedded Wallet are not accessible to, and are not stored by, the Company.",
        "No method of transmission or storage is completely secure, and we cannot guarantee the absolute security of your information. If we become aware of a security incident affecting your personal information, we will notify you and any applicable regulator as required by law.",
      ],
    },
    {
      title: "7. Data Retention",
      points: [
        "We retain personal information for as long as your Account remains active and for a reasonable period afterward as necessary to comply with legal, tax, accounting, and recordkeeping obligations, to resolve disputes, to prevent fraud, and to enforce our agreements. Absent a longer legal retention requirement or an ongoing dispute or legal hold, we generally retain closed-account records for up to seven years, after which we delete or anonymize the information.",
      ],
    },
    {
      title: "8. International Data Transfers",
      points: [
        "The Company is based in the United States, and our service providers may process personal information in the United States and other countries. If you are located in the Eurozone or elsewhere in the European Economic Area or the United Kingdom, your personal information may be transferred to, and processed in, a country that has not been deemed to provide an adequate level of data protection by your local authority. Where such transfers occur, we implement appropriate safeguards, such as the European Commission's Standard Contractual Clauses, and take other measures required by applicable law to protect your information.",
      ],
    },
    {
      title: "9. Your Privacy Rights",
      points: [
        "Depending on your location, you may have the right to:",
        "(a) request access to the personal information we hold about you.",
        "(b) request correction of inaccurate information.",
        "(c) request deletion of your personal information.",
        "(d) request that we restrict or object to certain processing.",
        "(e) request a copy of your information in a portable format.",
        "(f) withdraw consent where processing is based on consent.",
        "To exercise these rights, contact us using the information in Section 13. We may need to verify your identity before responding, and we will respond within the timeframe required by applicable law (generally within 30 to 45 days, subject to extension where permitted). We will not discriminate against you for exercising your privacy rights.",
      ],
    },
    {
      title: "10. California Privacy Rights",
      points: [
        "If you are a California resident, the California Consumer Privacy Act, as amended by the California Privacy Rights Act (collectively, \"CCPA\"), gives you the right to: know the categories and specific pieces of personal information we have collected about you; know the categories of sources, the purposes of collection, and the categories of third parties with whom we have disclosed personal information; request deletion of your personal information; request correction of inaccurate personal information; and opt out of the sale or sharing of personal information. As described in Sections 4 and 5, we do not sell personal information and do not share personal information for cross-context behavioral advertising.",
        "You may exercise your CCPA rights by contacting us using the information in Section 13, or by having an authorized agent submit a request on your behalf, subject to our ability to verify the agent's authority and your identity. We will not discriminate against you for exercising any right under the CCPA.",
      ],
    },
    {
      title: "11. European Users (GDPR)",
      points: [
        "If you are located in the Eurozone or elsewhere in the European Economic Area or the United Kingdom, we process your personal information under the following legal bases: performance of our contract with you (for example, to operate your Account), our legitimate interests (for example, to secure the Platform and prevent fraud), compliance with our legal obligations, and, where applicable, your consent (for example, for certain cookies or marketing communications).",
        "You have the rights described in Section 9, along with the right to lodge a complaint with your local data protection supervisory authority. Where required by applicable law, we will identify or appoint a representative for European users and will implement the transfer safeguards described in Section 8.",
      ],
    },
    {
      title: "12. Children's Privacy",
      points: [
        "The Platform is not directed to, and is not intended for use by, individuals under 18 years of age or the age of majority in their jurisdiction of residence. We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child in violation of this Privacy Policy, we will delete that information promptly. If you believe a child has provided us with personal information, please contact us using the information in Section 13.",
      ],
    },
    {
      title: "13. Contact Information",
      points: [
        "USDT Banc Inc.",
        "5482 Wilshire Blvd, Suite 1915",
        "Los Angeles, CA 90036",
        "Privacy inquiries: privacy@usdtbanc.com",
        "General support: support@usdtbanc.com",
      ],
    },
    {
      title: "14. Changes to This Privacy Policy",
      points: [
        "We may update this Privacy Policy from time to time. If we make a material change, we will notify you by posting the updated Privacy Policy on the Platform, updating the effective date above, and, where reasonably practicable, notifying you by email. Your continued use of the Platform after a change takes effect constitutes your acceptance of the revised Privacy Policy.",
      ],
    },
  ]), []);

  const fullText = useMemo(() => {
    const header = `Privacy Policy\nLast Updated Date: ${effectiveDate}`;
    const blocks = sections.map(s => `${s.title}\n- ${s.points.join("\n- ")}`);
    return [header, intro, ...blocks].join("\n\n");
  }, [sections, intro]);

  const downloadTxt = () => {
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "usdtbanc-privacy.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFontSize(16);
    doc.text("USDT BANC — Privacy Policy", 40, 48);
    doc.setFontSize(11.5);
    const maxWidth = 515;
    let y = 80;
    const lines = doc.splitTextToSize(fullText, maxWidth);
    lines.forEach(line => {
      if (y > 780) { doc.addPage(); y = 40; }
      doc.text(line, 40, y);
      y += 16.5;
    });
    doc.save("usdtbanc-privacy.pdf");
  };

  return (
    <main>
      <section className="relative mb-6 overflow-hidden rounded-2xl border border-primary/20 bg-card/90 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="relative p-6 lg:p-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground max-w-3xl">{intro}</p>
          <div className="mt-2 text-xs text-muted-foreground">Last Updated Date: {effectiveDate}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary" className="hover-scale">Security</Badge>
            <Badge variant="secondary" className="hover-scale">Compliance</Badge>
            <Badge variant="secondary" className="hover-scale">Transparency</Badge>
          </div>
        </div>
      </section>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="space-y-4">
          {sections.map(({ title, points }) => (
            <Card key={title} className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
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
          <Lock className="h-3.5 w-3.5" /> We respect your privacy and safeguard your data
        </div>
      </div>
    </main>
  );
};
