import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Lock } from "lucide-react";
import { jsPDF } from "jspdf";
import {
  TERMS_INTRO as intro,
  TERMS_EFFECTIVE_DATE as effectiveDate,
  TERMS_SECTIONS as sections,
} from "@/lib/termsContent";

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
