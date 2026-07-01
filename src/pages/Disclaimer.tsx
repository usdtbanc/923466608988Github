import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const sections = [
  {
    title: "Platform Role",
    paragraphs: [
      `USDT Banc ("USDT Banc," "we," "our," or "us") operates as a technology platform that connects users with trusted third-party service providers offering cryptocurrency-related services.`,
      `USDT Banc does not act as a cryptocurrency exchange, money transmitter, broker-dealer, bank, custodian, investment advisor, or financial institution. We do not buy, sell, exchange, hold, custody, or control customer funds or digital assets.`,
    ],
  },
  {
    title: "Third-Party Services",
    paragraphs: [
      `The cryptocurrency on-ramp and off-ramp services available through our platform are provided by independent third-party partners, including but not limited to Paybis, along with other licensed providers that may be added from time to time. Wallet creation and embedded wallet technology are provided through third-party wallet infrastructure providers, including Privy and other future partners.`,
    ],
  },
  {
    title: "No Access to Keys or Credentials",
    paragraphs: [
      `USDT Banc does not have access to, store, control, or recover users' private keys, seed phrases, passwords, or wallet credentials. Users remain solely responsible for safeguarding their wallet access and for all transactions initiated from their wallets.`,
    ],
  },
  {
    title: "Third-Party Transaction Responsibility",
    paragraphs: [
      `All purchases, sales, transfers, deposits, withdrawals, and other cryptocurrency transactions are processed by the applicable third-party provider under that provider's own terms of service, privacy policy, compliance procedures, and applicable laws. USDT Banc is not responsible for any delays, transaction failures, pricing differences, blockchain network congestion, technical issues, service interruptions, or losses resulting from the use of third-party services.`,
    ],
  },
  {
    title: "Investment Risk",
    paragraphs: [
      `Cryptocurrency investments involve significant risk and may result in the loss of some or all of your investment. Digital asset values are highly volatile. Nothing on this website constitutes legal, financial, tax, accounting, or investment advice, nor should any information on this website be interpreted as a recommendation to buy, sell, or hold any digital asset.`,
    ],
  },
  {
    title: "User Compliance",
    paragraphs: [
      `Users are responsible for complying with all applicable laws and regulations in their jurisdiction, including tax reporting obligations and any restrictions relating to cryptocurrency transactions.`,
    ],
  },
  {
    title: "Acknowledgement",
    paragraphs: [
      `By accessing or using USDT Banc, you acknowledge that you understand this disclaimer and agree that your use of any third-party services is at your own risk and subject to the terms and conditions of the applicable service provider.`,
    ],
  },
  {
    title: "Right to Change Partners",
    paragraphs: [
      `USDT Banc reserves the right to add, remove, or replace third-party partners and service providers at any time without prior notice in order to improve or expand the services available through the platform.`,
    ],
  },
];

export const Disclaimer = () => {
  useEffect(() => {
    document.title = "Disclaimer • USDT BANC";
    const desc = "USDT Banc Disclaimer: platform role, third-party services, and user responsibilities.";
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", desc);
    else {
      const m = document.createElement("meta");
      m.name = "description"; m.content = desc; document.head.appendChild(m);
    }
  }, []);

  return (
    <main>
      <section className="relative mb-6 overflow-hidden rounded-2xl border border-primary/20 bg-card/90 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="relative p-6 lg:p-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Disclaimer</h1>
          <p className="text-muted-foreground max-w-3xl">
            Important information about USDT Banc's role as a technology platform and your responsibilities as a user.
          </p>
        </div>
      </section>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="space-y-4">
          {sections.map(({ title, paragraphs }) => (
            <Card key={title} className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {paragraphs.map((p, i) => (
                  <p key={i} className="text-sm text-muted-foreground leading-relaxed">{p}</p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </main>
  );
};
