import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { RefreshCcw, AlertCircle, CheckCircle, XCircle } from "lucide-react";

export default function Refund() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-2">
            <RefreshCcw className="w-6 h-6 text-primary" />
            <span className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Legal</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Refund Policy</h1>
          <p className="text-muted-foreground mb-1">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
          <p className="text-muted-foreground mb-10">We want you to be satisfied with your Techofy Cloud experience. Please read our refund policy carefully.</p>

          <div className="space-y-8">
            <div className="p-5 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Important Notice</h3>
                  <p className="text-sm text-muted-foreground">All payments made to Techofy Cloud are for digital cloud infrastructure services. Due to the nature of these services (immediate server provisioning and resource allocation), our refund policy is structured as described below.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Eligible for Refund</h2>
              <div className="space-y-3">
                {[
                  "Duplicate payments made for the same service within a 24-hour window",
                  "Payment failures where your wallet was charged but the server was not deployed",
                  "Technical issues caused entirely by our infrastructure preventing server access for more than 48 continuous hours",
                  "Wallet balance remaining after account closure, upon written request",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Not Eligible for Refund</h2>
              <div className="space-y-3">
                {[
                  "Services that have already been provisioned and are running normally",
                  "Partial month usage — we do not prorate monthly subscriptions",
                  "Services suspended or terminated due to Terms of Service violations",
                  "User errors in configuration, server misuse, or accidental deletion",
                  "Wallet top-up amounts that have already been applied to active services",
                  "Discounted or promotional pricing plans",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">How to Request a Refund</h2>
              <ol className="space-y-3">
                {[
                  "Submit a support ticket through your Techofy Cloud dashboard with subject 'Refund Request'",
                  "Include your account email, transaction ID from Razorpay, the amount, and the reason for the refund request",
                  "Our team will review your request within 3-5 business days",
                  "Approved refunds will be processed within 7-10 business days to your original payment method",
                ].map((step, i) => (
                  <li key={step} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Wallet Credits</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">In cases where a cash refund is not applicable, we may offer equivalent Techofy Wallet credits at our discretion. Wallet credits are non-transferable and can only be used for Techofy Cloud services.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Disputes</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">If you dispute a charge with your bank or payment provider before contacting us, this may result in immediate suspension of your account. We encourage you to reach out to our support team first — we are committed to resolving issues fairly and quickly.</p>
            </div>
          </div>

          <div className="mt-12 p-4 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground">
            Questions about refunds? <Link href="/dashboard/support" className="text-primary hover:underline font-medium">Open a support ticket</Link> and our team will assist you.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
