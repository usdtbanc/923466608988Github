import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";

const sections = [
  {
    title: "1. Refund Policy",
    paragraphs: [
      `Completed Digital Asset transactions are final. The Company does not provide refunds, chargebacks, exchanges, or cancellations for completed transactions. Once a Digital Asset transaction has been transferred or confirmed on the applicable Blockchain, it generally cannot be reversed by the Company, by any Third-Party Provider, or by any other party.`,
      `If a refund, reversal, or cancellation is available to you under applicable law, or under the terms of the Third-Party Provider that processed your transaction, such a request must be directed to that Third-Party Provider and will be governed exclusively by that provider's own terms and procedures. The Company will direct you to the appropriate Third-Party Provider upon request but has no independent obligation to provide, fund, or guarantee any refund.`,
    ],
  },
  {
    title: "2. Cryptocurrency Risk Disclosure",
    paragraphs: [
      `Digital Assets involve significant risk, and you should not transact in Digital Assets unless you understand and can bear these risks, including that:`,
      `Digital Assets can be extremely volatile, and their value can decline rapidly and substantially, including to zero.`,
      `Digital Assets are not legal tender, are not backed by any government, and are not insured by the FDIC, SIPC, or any similar deposit or investor protection scheme.`,
      `The regulatory treatment of Digital Assets is uncertain and evolving, and future legal or regulatory developments could adversely affect the value, transferability, or legality of a given Digital Asset.`,
      `Blockchain networks may be subject to protocol changes, forks, congestion, or attacks that could affect the availability or integrity of your Digital Assets.`,
      `Cybersecurity threats, including phishing, malware, and social engineering, can result in irreversible loss of Digital Assets.`,
      `Transactions, once confirmed, generally cannot be reversed, and loss of access credentials can result in permanent, unrecoverable loss.`,
      `You should only transact in amounts you can afford to lose and should independently evaluate the suitability of any Digital Asset for your circumstances.`,
    ],
  },
  {
    title: "3. Acceptable Use and Prohibited Activities",
    paragraphs: [
      `You agree to use the Platform only for lawful purposes and in accordance with these Terms. You must not, and must not attempt to:`,
      `Use the Platform for any illegal purpose, including money laundering, terrorist financing, fraud, or evasion of sanctions.`,
      `Access or use the Platform if you are located in, or ordinarily resident in, a jurisdiction subject to comprehensive sanctions, or if you are identified on any sanctions or restricted party list.`,
      `Circumvent, disable, or interfere with any security-related feature of the Platform.`,
      `Access the Platform through automated means, scrape data from the Platform, or reverse engineer, decompile, or disassemble any part of the Platform, except to the extent such restriction is prohibited by applicable law.`,
      `Impersonate any person or entity, or misrepresent your affiliation with any person or entity.`,
      `Create multiple Accounts to evade a restriction, suspension, or geographic limitation imposed under these Terms.`,
      `Use the Platform in a manner that violates the terms of service of any Third-Party Provider integrated with the Platform.`,
      `Engage in any activity that could damage, disable, or impair the Platform or interfere with any other user's use of the Platform.`,
      `Violation of this Section 3 may result in suspension or termination of your Account under Section 7, in addition to any other remedy available to the Company.`,
    ],
  },
  {
    title: "4. Regulatory Compliance; KYC/AML",
    paragraphs: [
      `Creating an Embedded Wallet on the Platform does not require identity verification from the Company. However, if you buy Digital Assets through Stripe, or through any future Third-Party Provider engaged for that purpose, you may be required to complete identity verification, Know Your Customer (KYC) checks, Anti-Money Laundering (AML) review, sanctions screening, or other compliance procedures imposed by that Third-Party Provider and applicable law.`,
      `The Company does not perform KYC in connection with Embedded Wallet creation and is not responsible for the compliance procedures, decisions, or determinations made by any Third-Party Provider, including decisions to decline, delay, restrict, or reverse a transaction based on that provider's own compliance program.`,
      `The Company may independently request information from you, restrict your access to the Platform, or report information to governmental authorities where required to comply with applicable law, to respond to legal process, or to prevent fraud or other harm.`,
    ],
  },
  {
    title: "5. Intellectual Property",
    paragraphs: [
      `The Platform, including its software, design, text, graphics, logos, and the USDT Banc name and marks, is owned by the Company or its licensors and is protected by intellectual property laws. Subject to your compliance with these Terms, the Company grants you a limited, personal, non-exclusive, non-transferable, revocable license to access and use the Platform for its intended purpose.`,
      `You may not copy, modify, distribute, sell, lease, reverse engineer, or create derivative works based on the Platform, except as expressly permitted by applicable law notwithstanding this restriction. Any feedback or suggestions you provide regarding the Platform may be used by the Company without restriction or compensation to you.`,
    ],
  },
  {
    title: "6. Privacy",
    paragraphs: [
      `Our collection, use, and disclosure of your personal information is described in our Privacy Policy, available at https://www.usdtbanc.com/privacy, which is incorporated into these Terms by reference. By using the Platform, you consent to the collection and use of your information as described in the Privacy Policy.`,
    ],
  },
  {
    title: "7. Suspension and Termination",
    paragraphs: [
      `The Company may suspend, restrict, or terminate your access to the Platform, in whole or in part, at any time, with or without notice, including where: (a) you breach these Terms; (b) the Company reasonably suspects fraud, illegal activity, or a violation of applicable law; (c) suspension or termination is required to comply with applicable law or legal process; (d) a Third-Party Provider restricts, suspends, or terminates services relevant to your Account; or (e) your Account has been inactive for an extended period.`,
      `Because Embedded Wallets rely in part on Account-level authentication, suspension or termination of your Account may affect your practical ability to access your Embedded Wallet, as described in Section 6. Where reasonably practicable and not inconsistent with a legal or security requirement, the Company will provide you an opportunity to export your wallet recovery information before finalizing termination.`,
      `You may stop using the Platform at any time. Termination of these Terms does not relieve you of any obligation that accrued prior to termination, including payment of any outstanding fees.`,
    ],
  },
];

export const RefundPolicy = () => {
  useEffect(() => {
    document.title = "Refund Policy & Transaction Finality • USDT BANC";
    const desc = "USDT Banc Refund Policy & Transaction Terms: refunds, risk disclosure, acceptable use, compliance, IP, privacy, and account termination.";
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
            Refund policy, cryptocurrency risk disclosure, acceptable use, regulatory compliance, intellectual property, privacy, and account suspension/termination terms.
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
