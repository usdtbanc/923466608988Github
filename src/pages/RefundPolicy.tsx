import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";

const sections = [
  {
    title: "No Direct Transactions",
    paragraphs: [
      `USDT Banc does not sell, custody, or process cryptocurrency transactions directly. All cryptocurrency purchases, sales, and fiat on-ramp and off-ramp services are provided by independent third-party service providers.`,
    ],
  },
  {
    title: "No Refunds or Cancellations",
    paragraphs: [
      `USDT Banc does not provide refunds, cancellations, chargebacks, or exchanges for completed cryptocurrency transactions. Any request relating to a transaction, including a refund where applicable under law or the policies of the service provider, must be submitted directly to the third-party provider that processed the transaction and will be governed by that provider's terms and conditions.`,
    ],
  },
  {
    title: "Transaction Finality",
    paragraphs: [
      `Due to the nature of blockchain technology, completed cryptocurrency transactions are generally irreversible. If you wish to convert your cryptocurrency back into fiat currency, you must initiate a separate sale through an available third-party off-ramp provider, subject to that provider's pricing, fees, verification requirements, and applicable laws.`,
    ],
  },
  {
    title: "Price Volatility",
    paragraphs: [
      `USDT Banc is not responsible for any loss resulting from cryptocurrency price fluctuations, market volatility, exchange rates, network congestion, or fees incurred between the purchase and subsequent sale of digital assets.`,
    ],
  },
  {
    title: "User Responsibility for Accuracy",
    paragraphs: [
      `Users are solely responsible for verifying the accuracy of wallet addresses, blockchain networks, and recipient information before confirming any transaction. Cryptocurrency sent to an incorrect wallet address, incompatible blockchain network, or unintended recipient is generally irreversible and may be permanently lost.`,
    ],
  },
  {
    title: "No Control Over Blockchain",
    paragraphs: [
      `USDT Banc does not control blockchain networks, does not have access to users' private keys or wallet credentials, and cannot reverse, cancel, recover, or retrieve cryptocurrency transactions once they have been processed by the applicable third-party provider or confirmed on the blockchain. Accordingly, USDT Banc shall not be liable for losses arising from user error, unauthorized access to a user's wallet, incorrect transfer instructions, or transactions completed through third-party service providers.`,
    ],
  },
  {
    title: "Acknowledgement",
    paragraphs: [
      `By using USDT Banc, you acknowledge and agree that you understand the irreversible nature of cryptocurrency transactions and that USDT Banc does not provide refunds for transactions processed through its platform.`,
    ],
  },
];

export const RefundPolicy = () => {
  useEffect(() => {
    document.title = "Refund Policy & Transaction Finality • USDT BANC";
    const desc = "USDT Banc Refund Policy: transaction finality, no-refund policy, and user responsibilities.";
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
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Refund Policy & Transaction Finality</h1>
          <p className="text-muted-foreground max-w-3xl">
            Understanding transaction finality, refund limitations, and your responsibilities when using USDT Banc.
          </p>
        </div>
      </section>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="space-y-4">
          {sections.map(({ title, paragraphs }) => (
            <Card key={title} className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-primary" />
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
