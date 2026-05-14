import { Link } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useListPlans } from "@/lib/api";
import { useState } from "react";
import {
  Server, Shield, Zap, Globe, Clock, HeadphonesIcon,
  Check, Monitor, Terminal, ArrowRight, Star, ChevronDown,
  Mail, Phone, MapPin, Quote, Users, TrendingUp, Award
} from "lucide-react";

const features = [
  { icon: Shield, title: "Enterprise Security", desc: "Isolated tenant environments with strict data separation and encrypted credentials vault." },
  { icon: Zap, title: "Instant Provisioning", desc: "Auto-assign servers from our pool and provision with custom credentials in under 60 seconds." },
  { icon: Globe, title: "Global Hostnames", desc: "Every server gets a unique subdomain hostname — never expose raw IPs to your clients." },
  { icon: Clock, title: "99.9% Uptime SLA", desc: "High-availability infrastructure with real-time monitoring and automatic failover." },
  { icon: HeadphonesIcon, title: "24/7 Support", desc: "Dedicated support team with ticket management and guaranteed response times." },
  { icon: Server, title: "Full Root Access", desc: "Complete administrative control over your Windows RDP or Ubuntu VPS server." },
];

const testimonials = [
  { name: "Rahul Sharma", role: "Software Developer", rating: 5, text: "Techofy Cloud has been amazing for my work. Instant deployment, stable servers, and great support. Highly recommended!" },
  { name: "Priya Mehta", role: "Digital Marketer", rating: 5, text: "I run all my automation tools on Techofy RDP. The uptime is excellent and pricing is the best I've found in India." },
  { name: "Arjun Singh", role: "Freelancer", rating: 5, text: "Setup took less than 2 minutes. The servers are blazing fast and the control panel is very easy to use." },
];

const trustStats = [
  { icon: Users, value: "500+", label: "Happy Customers" },
  { icon: Server, value: "1000+", label: "Servers Deployed" },
  { icon: TrendingUp, value: "99.9%", label: "Uptime SLA" },
  { icon: Award, value: "24/7", label: "Expert Support" },
];

const STATIC_PLANS = [
  { id: "rdp-4", name: "RDP Starter", type: "RDP", os: "Windows Server 2022", ram: 4, cpu: 2, storage: 100, monthlyCost: 299, features: ["Full GUI Remote Desktop", "Admin Access", "4GB RAM", "2 vCPU", "100GB SSD", "Speed Up to 4 Gbps"], popular: false },
  { id: "rdp-8", name: "RDP Pro", type: "RDP", os: "Windows Server 2022", ram: 8, cpu: 4, storage: 200, monthlyCost: 599, features: ["Full GUI Remote Desktop", "Admin Access", "8GB RAM", "4 vCPU", "200GB SSD", "Speed Up to 4 Gbps", "Daily Backups"], popular: true },
  { id: "rdp-16", name: "RDP Business", type: "RDP", os: "Windows Server 2022", ram: 16, cpu: 8, storage: 320, monthlyCost: 1199, features: ["Full GUI Remote Desktop", "Admin Access", "16GB RAM", "8 vCPU", "320GB SSD", "Speed Up to 4 Gbps", "Daily Backups", "Priority Support"], popular: false },
  { id: "vps-4", name: "VPS Starter", type: "VPS", os: "Ubuntu 22.04 LTS", ram: 4, cpu: 2, storage: 80, monthlyCost: 249, features: ["Root SSH Access", "Ubuntu 22.04", "4GB RAM", "2 vCPU", "80GB SSD", "Speed Up to 4 Gbps"], popular: false },
  { id: "vps-8", name: "VPS Pro", type: "VPS", os: "Ubuntu 22.04 LTS", ram: 8, cpu: 4, storage: 160, monthlyCost: 499, features: ["Root SSH Access", "Ubuntu 22.04", "8GB RAM", "4 vCPU", "160GB SSD", "Speed Up to 4 Gbps", "Daily Backups"], popular: true },
  { id: "vps-16", name: "VPS Business", type: "VPS", os: "Ubuntu 22.04 LTS", ram: 16, cpu: 6, storage: 320, monthlyCost: 999, features: ["Root SSH Access", "Ubuntu 22.04", "16GB RAM", "6 vCPU", "320GB SSD", "Speed Up to 4 Gbps", "Daily Backups", "Priority Support"], popular: false },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  );
}

function PricingCard({ plan, isPopular }: { plan: { id: string; name: string; type: string; os: string; ram: number; cpu: number; storage: number; monthlyCost: number; features: string[]; popular?: boolean }; isPopular: boolean }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative rounded-2xl border p-6 flex flex-col gap-4 cursor-pointer ${
        isPopular
          ? "border-primary bg-primary/5 shadow-2xl shadow-primary/20"
          : "border-border bg-card shadow-lg hover:shadow-xl hover:shadow-primary/10"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
            <Star className="w-3 h-3 mr-1" /> Most Popular
          </Badge>
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.type === "RDP" ? "bg-blue-500/10" : "bg-emerald-500/10"}`}>
          {plan.type === "RDP" ? <Monitor className="w-5 h-5 text-blue-500" /> : <Terminal className="w-5 h-5 text-emerald-500" />}
        </div>
        <div>
          <p className="font-bold text-sm">{plan.name}</p>
          <p className="text-xs text-muted-foreground">{plan.os}</p>
        </div>
      </div>
      <div>
        <span className="text-3xl font-bold">₹{plan.monthlyCost.toLocaleString()}</span>
        <span className="text-sm text-muted-foreground">/month</span>
      </div>
      <div className="text-xs text-muted-foreground flex gap-4">
        <span>{plan.ram}GB RAM</span>
        <span>{plan.cpu} vCPU</span>
        <span>{plan.storage}GB SSD</span>
      </div>
      <ul className="space-y-2 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs">
            <Check className="w-3.5 h-3.5 text-secondary shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link href="/register">
        <Button
          className={`w-full ${isPopular ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/90"} text-white`}
        >
          Deploy Now <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </Link>
    </motion.div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"RDP" | "VPS">("RDP");
  const { data: apiPlans = [] } = useListPlans();
  const plans = apiPlans.length > 0 ? apiPlans : STATIC_PLANS;
  const filteredPlans = plans.filter((p) => p.type === activeTab);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero - starts immediately, no extra top padding */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute top-10 left-1/4 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-secondary/8 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="outline" className="mb-5 px-4 py-1.5 text-sm border-primary/30 text-primary">
              <Zap className="w-3 h-3 mr-1" /> Enterprise Cloud Infrastructure
            </Badge>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold tracking-tight mb-5"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          >
            Cloud Servers Built for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Professionals
            </span>
          </motion.h1>

          <motion.p
            className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          >
            Deploy Windows RDP and Ubuntu Linux VPS servers in seconds. Full root access, custom hostnames, and enterprise-grade security — starting at just ₹249/month.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 shadow-xl shadow-primary/25">
                Start Deploying <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#pricing">
              <Button size="lg" variant="outline" className="px-8">
                View Pricing <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </motion.div>

          {/* Trust Stats */}
          <motion.div
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
          >
            {trustStats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card border border-border/50">
                <Icon className="w-4 h-4 text-primary mb-1" />
                <div className="text-xl font-bold text-primary">{value}</div>
                <div className="text-xs text-muted-foreground text-center">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-3 text-primary border-primary/30">Why Choose Us</Badge>
            <h2 className="text-3xl font-bold mb-3">Everything You Need, Nothing You Don't</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Enterprise-grade features at affordable Indian pricing.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="glass rounded-xl p-5 hover:shadow-lg hover:shadow-primary/10 transition-all border border-border/50"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-3 text-primary border-primary/30">Pricing</Badge>
            <h2 className="text-3xl font-bold mb-3">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground">No hidden fees. Pay from your Techofy Wallet.</p>
          </motion.div>

          <div className="flex justify-center gap-2 mb-8">
            {(["RDP", "VPS"] as const).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "outline"}
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab ? "bg-primary text-white" : ""}
              >
                {tab === "RDP" ? <Monitor className="w-4 h-4 mr-2" /> : <Terminal className="w-4 h-4 mr-2" />}
                {tab === "RDP" ? "Windows RDP" : "Ubuntu VPS"}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredPlans.map((plan, i) => (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <PricingCard plan={plan} isPopular={!!plan.popular} />
              </motion.div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Need custom specs?{" "}
            <Link href="/dashboard/deploy" className="text-primary hover:underline font-medium">
              Configure your own server
            </Link>
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-3 text-primary border-primary/30">Reviews</Badge>
            <h2 className="text-3xl font-bold mb-3">Trusted by Professionals</h2>
            <p className="text-muted-foreground">See what our customers say about Techofy Cloud.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                className="glass rounded-xl p-6 border border-border/50 flex flex-col gap-4"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              >
                <Quote className="w-6 h-6 text-primary/40" />
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{t.text}"</p>
                <div>
                  <StarRating count={t.rating} />
                  <p className="font-semibold text-sm mt-2">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            className="text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            Ready to Deploy Your First Server?
          </motion.h2>
          <p className="text-white/80 mb-8">Create your account, fund your wallet, and deploy in under 2 minutes.</p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8">
              Create Free Account <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <img src="/favicon.svg" alt="Techofy" className="w-7 h-7 object-contain" />
                <span className="font-bold text-sm">Techofy Cloud</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Professional cloud infrastructure for everyone. Affordable, reliable, fast.</p>
              <div className="flex gap-1">
                <StarRating count={5} />
                <span className="text-xs text-muted-foreground ml-1">4.9/5 rating</span>
              </div>
            </div>

            {/* Products */}
            <div>
              <p className="font-semibold text-sm mb-3">Products</p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/register" className="hover:text-foreground transition-colors">Windows RDP</Link></li>
                <li><Link href="/register" className="hover:text-foreground transition-colors">Ubuntu VPS</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="font-semibold text-sm mb-3">Company</p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link href="/dashboard/support" className="hover:text-foreground transition-colors">Support</Link></li>
              </ul>
            </div>

            {/* Legal + Contact */}
            <div>
              <p className="font-semibold text-sm mb-3">Legal</p>
              <ul className="space-y-2 text-xs text-muted-foreground mb-4">
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/refund" className="hover:text-foreground transition-colors">Refund Policy</Link></li>
              </ul>
              <p className="font-semibold text-sm mb-3">Contact Us</p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 shrink-0" />
                  <a href="mailto:support@techofy.xyz" className="hover:text-foreground transition-colors">support@techofy.xyz</a>
                </li>
                <li className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 shrink-0" />
                  <span>Not Available</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>India</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Techofy Cloud. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
