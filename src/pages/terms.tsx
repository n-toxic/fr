import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ScrollText } from "lucide-react";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using Techofy Cloud's services, you agree to be bound by these Terms and Conditions. If you do not agree to all of these terms, you may not use our services. These terms apply to all visitors, users, and others who access or use the Service.`,
  },
  {
    title: "2. Description of Services",
    content: `Techofy Cloud provides virtual private server (VPS) and Remote Desktop Protocol (RDP) hosting services. Services are provided on a monthly subscription basis, billed from your Techofy Wallet. We reserve the right to modify, suspend, or discontinue any service at any time with reasonable notice.`,
  },
  {
    title: "3. Account Registration",
    content: `To use our services, you must create an account and verify your email address via OTP. You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate, complete, and current information. You may not use another user's account without permission. You must notify us immediately of any unauthorized use of your account.`,
  },
  {
    title: "4. Billing and Payment",
    content: `All payments are processed through Razorpay and credited to your Techofy Wallet. Server deployment costs are deducted directly from your wallet balance. Monthly charges are deducted at the time of deployment for the first month. If your wallet balance is insufficient for renewal, your server may be suspended. All prices are in Indian Rupees (INR) inclusive of applicable taxes.`,
  },
  {
    title: "5. Acceptable Use Policy",
    content: `You agree not to use Techofy Cloud services to: send unsolicited bulk emails or spam; host illegal content or engage in illegal activities; conduct DDoS attacks or any form of network abuse; mine cryptocurrency without explicit written approval; resell or sublicense server resources without authorization; violate any applicable local, national, or international laws.`,
  },
  {
    title: "6. Resource Usage",
    content: `Servers are provisioned with the RAM, CPU, and storage as specified in your plan. You may not exceed the allocated resources. We monitor resource usage and reserve the right to throttle or suspend servers causing disproportionate impact on our infrastructure or other customers.`,
  },
  {
    title: "7. Data Privacy and Security",
    content: `We implement strict tenant isolation — your data is never accessible to other users. Your server credentials (IP, username, password) are stored encrypted and only accessible to you. We do not sell, trade, or transfer your personal data to third parties except as required by law.`,
  },
  {
    title: "8. Service Level Agreement",
    content: `We strive for 99.9% network uptime, excluding scheduled maintenance windows. Scheduled maintenance will be communicated at least 24 hours in advance. For unplanned outages exceeding 1 hour, customers may request service credits at our discretion.`,
  },
  {
    title: "9. Termination",
    content: `We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason at our sole discretion. Upon termination, your right to use the Service ceases immediately.`,
  },
  {
    title: "10. Limitation of Liability",
    content: `To the maximum extent permitted by law, Techofy Cloud shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services. Our total liability to you for any claims shall not exceed the amount you paid us in the three months preceding the claim.`,
  },
  {
    title: "11. Changes to Terms",
    content: `We reserve the right to modify these terms at any time. We will notify users of material changes via email or a prominent notice on our website. Continued use of the service after any changes constitutes your acceptance of the new terms.`,
  },
  {
    title: "12. Contact Information",
    content: `If you have any questions about these Terms, please contact us through our support ticket system at Techofy Cloud. We typically respond within 24 hours on business days.`,
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-2">
            <ScrollText className="w-6 h-6 text-primary" />
            <span className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Legal</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Terms and Conditions</h1>
          <p className="text-muted-foreground mb-1">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
          <p className="text-muted-foreground mb-10">Please read these terms carefully before using Techofy Cloud services.</p>

          <div className="space-y-8">
            {sections.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <h2 className="text-lg font-semibold mb-3 text-foreground">{s.title}</h2>
                <p className="text-muted-foreground leading-relaxed text-sm">{s.content}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 p-4 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground">
            Questions about our terms? <Link href="/dashboard/support" className="text-primary hover:underline font-medium">Contact our support team</Link>.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
