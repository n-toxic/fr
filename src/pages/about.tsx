import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Shield, Server, Globe, Award, Users, Zap } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const values = [
  { icon: Shield, title: "Security First", desc: "We treat every customer's data as if it were our own. Strict isolation, encrypted credentials, and zero cross-tenant access." },
  { icon: Zap, title: "Performance", desc: "High-performance hardware, SSD storage, and optimized hypervisors ensure your workloads run at peak efficiency." },
  { icon: Globe, title: "Transparency", desc: "Honest pricing, no hidden fees, real-time status pages, and clear communication when incidents happen." },
  { icon: Users, title: "Customer Success", desc: "A dedicated support team that genuinely cares. We measure ourselves by your uptime and satisfaction." },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative pt-24 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background" />
        <div className="max-w-4xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">About Us</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Cloud Infrastructure Built on <span className="text-primary">Trust</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Techofy Cloud was founded with one mission: make professional cloud infrastructure accessible to developers, businesses, and individuals — without complexity or compromise.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl font-bold mb-4">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Techofy Cloud started as a response to a gap in the market: reliable, affordable Windows RDP and Linux VPS servers with the kind of professional tooling typically reserved for enterprise customers.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, we serve thousands of customers across India and beyond — from developers running automation scripts to businesses hosting mission-critical applications. Our automated provisioning system, wallet-based billing, and AWS-style console set us apart from traditional hosting providers.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl font-bold mb-4">What We Offer</h2>
              <ul className="space-y-3">
                {["Windows Server 2022 RDP with full GUI access", "Ubuntu 22.04 LTS VPS with root SSH", "Custom hostname subdomains for every server", "Automated credential provisioning", "Razorpay-powered wallet billing", "24/7 support ticket system"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.h2 className="text-2xl font-bold text-center mb-10" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            Our Core Values
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                className="glass rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <v.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <Award className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-white/80 mb-8">Join thousands of customers who trust Techofy Cloud for their infrastructure needs.</p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold" data-testid="button-about-cta">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-border text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Server className="w-4 h-4 text-primary" />
          <span className="font-semibold">Techofy Cloud</span>
        </div>
        <p>&copy; {new Date().getFullYear()} Techofy Cloud. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
          <Link href="/refund" className="hover:text-foreground">Refund Policy</Link>
        </div>
      </footer>
    </div>
  );
}
