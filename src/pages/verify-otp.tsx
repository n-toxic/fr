import { Link, useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useVerifyOtp, useRequestOtp } from "@/lib/api";
import { Shield, Mail, RefreshCw } from "lucide-react";

export default function VerifyOtp() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const email = params.get("email") ?? "";
  const { login } = useAuth();
  const { toast } = useToast();
  const [otp, setOtp] = useState("");

  const verifyMutation = useVerifyOtp({
    mutation: {
      onSuccess: (data) => {
        login(data.token);
        toast({ title: "Account verified!", description: "Welcome to Techofy Cloud." });
        setLocation("/dashboard");
      },
      onError: (err: { data?: { error?: string }; message?: string }) => {
        toast({ title: "Verification failed", description: err?.data?.error ?? "Invalid or expired OTP", variant: "destructive" });
      },
    },
  });

  const resendMutation = useRequestOtp({
    mutation: {
      onSuccess: () => toast({ title: "OTP resent", description: "Check your email for the new code." }),
      onError: () => toast({ title: "Failed to resend", description: "Please try again.", variant: "destructive" }),
    },
  });

  const handleVerify = () => {
    if (otp.length !== 6) return;
    verifyMutation.mutate({ data: { email, code: otp } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      >
        <div className="glass rounded-2xl p-8 shadow-2xl text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">Techofy Cloud</span>
          </Link>

          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Check your email</h1>
          <p className="text-sm text-muted-foreground mb-1">We sent a 6-digit code to</p>
          <p className="font-semibold text-primary mb-8">{email || "your email address"}</p>

          <div className="flex justify-center mb-6">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              data-testid="input-otp"
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white mb-4"
            onClick={handleVerify}
            disabled={otp.length !== 6 || verifyMutation.isPending}
            data-testid="button-verify"
          >
            {verifyMutation.isPending ? "Verifying..." : "Verify Account"}
          </Button>

          <Button
            variant="ghost" size="sm"
            onClick={() => resendMutation.mutate({ data: { email } })}
            disabled={resendMutation.isPending}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-resend"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            {resendMutation.isPending ? "Sending..." : "Resend code"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
