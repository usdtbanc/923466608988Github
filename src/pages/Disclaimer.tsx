import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "1. Disclaimer",
    paragraphs: [
      `THE PLATFORM AND ALL SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR THAT THE PLATFORM WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.`,
      `USDT Banc operates solely as a technology platform. All Fiat On-Ramp and Fiat Off-Ramp Transactions are processed by independent Third-Party Providers. The Company does not execute trades, process payments, custody Digital Assets, hold private keys, or recover wallets. Nothing on the Platform constitutes investment advice, financial advice, tax advice, legal advice, or accounting advice, and no communication from the Company should be relied upon as such. You are solely responsible for complying with applicable laws, tax obligations, and regulatory requirements in your jurisdiction.`,
      `Some jurisdictions do not allow the exclusion of certain warranties, so some of the above exclusions may not apply to you.`,
    ],
  },
  {
    title: "2. Limitation of Liability",
    paragraphs: [
      `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL THE COMPANY, ITS AFFILIATES, OR ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, DATA, GOODWILL, OR DIGITAL ASSETS, ARISING FROM OR RELATED TO YOUR USE OF THE PLATFORM, EVEN IF THE COMPANY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.`,
      `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE COMPANY'S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THESE TERMS OR THE PLATFORM WILL NOT EXCEED THE GREATER OF (A) THE TOTAL FEES YOU PAID TO THE COMPANY IN THE TWELVE MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS ($100).`,
      `These limitations will not apply to the extent a claim arises from the Company's fraud, gross negligence, or willful misconduct, or to the extent such limitations are prohibited by applicable law.`,
    ],
  },
  {
    title: "3. Indemnification",
    paragraphs: [
      `You agree to indemnify, defend, and hold harmless the Company, its affiliates, and their respective officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with: (a) your access to or use of the Platform; (b) your breach of these Terms; (c) your violation of any applicable law; (d) your infringement of any third-party right; or (e) any Digital Asset transaction you initiate through the Platform or any Third-Party Provider.`,
    ],
  },
  {
    title: "4. Force Majeure",
    paragraphs: [
      `The Company will not be liable for any delay or failure to perform resulting from causes beyond its reasonable control, including natural disasters, acts of war or terrorism, labor disputes, internet, network, or Blockchain outages or congestion, governmental action, epidemic or pandemic, cyberattacks, or the failure or unavailability of any Third-Party Provider.`,
    ],
  },
  {
    title: "5. Governing Law",
    paragraphs: [
      `These Terms and any dispute arising out of or relating to these Terms or the Platform will be governed by the laws of the State of California, without regard to its conflict of laws principles.`,
    ],
  },
  {
    title: "6. Dispute Resolution; Arbitration Agreement",
    paragraphs: [
      `Please read this section carefully. It affects your legal rights, including your right to file a lawsuit in court.`,
      `Except for claims that qualify for small claims court or claims for injunctive or equitable relief relating to security, intellectual property, or unauthorized access, you and the Company agree that any dispute, claim, or controversy arising out of or relating to these Terms or the Platform will be resolved by binding arbitration administered by the American Arbitration Association under its Consumer Arbitration Rules, rather than in court, except as set forth below.`,
      `YOU AND THE COMPANY EACH WAIVE THE RIGHT TO A JURY TRIAL AND THE RIGHT TO PARTICIPATE IN A CLASS ACTION, CLASS ARBITRATION, OR REPRESENTATIVE PROCEEDING. Claims must be brought in an individual capacity, and the arbitrator may not consolidate claims or preside over any form of class or representative proceeding.`,
      `You may opt out of this arbitration agreement by sending written notice to the Company at the address in Section 28 within thirty (30) days of first accepting these Terms. Timely opt-out notices will not affect any other provision of these Terms.`,
      `Any claim not subject to arbitration, and any action to enforce an arbitration award or to seek interim injunctive relief, will be brought exclusively in the state or federal courts located in Los Angeles County, California, and you and the Company each consent to the personal jurisdiction of those courts.`,
    ],
  },
  {
    title: "7. Severability",
    paragraphs: [
      `If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the remaining provisions of these Terms remain in full force and effect.`,
    ],
  },
  {
    title: "8. Entire Agreement; Miscellaneous",
    paragraphs: [
      `These Terms, together with the Privacy Policy and any additional terms referenced herein, constitute the entire agreement between you and the Company regarding the Platform and supersede any prior agreements between you and the Company regarding the Platform.`,
      `The Company's failure to enforce any right or provision of these Terms will not be considered a waiver of that right or provision. The Company may assign these Terms, in whole or in part, at any time without notice to you. You may not assign these Terms without the Company's prior written consent.`,
      `Nothing in these Terms creates a partnership, joint venture, agency, or employment relationship between you and the Company. Except as expressly stated in Section 21, there are no third-party beneficiaries to these Terms.`,
    ],
  },
  {
    title: "9. Changes to the Terms",
    paragraphs: [
      `The Company may modify these Terms from time to time. If we make a material change, we will provide notice by posting the updated Terms on the Platform, updating the effective date above, and, where reasonably practicable, notifying you by email. Changes take effect thirty (30) days after notice unless a shorter period is required to address a security or legal issue.`,
      `If you do not agree to a revised version of these Terms, you must stop using the Platform before the change takes effect. Because the Platform is non-custodial, you retain the ability to export or transfer your Digital Assets independently of your Account, subject to Section 6.`,
    ],
  },
];

export const Disclaimer = () => {
  useEffect(() => {
    document.title = "Disclaimer • USDT BANC";
    const desc = "USDT Banc Disclaimer: warranty disclaimers, limitation of liability, indemnification, and dispute resolution.";
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
            Warranty disclaimers, limitation of liability, indemnification, and dispute resolution terms governing your use of the Platform.
          </p>
        </div>
      </section>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="space-y-4">
          {sections.map(({ title, paragraphs }) => (
            <Card key={title} className="border-primary/20">
              <CardHeader>
                <CardTitle>{title}</CardTitle>
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
