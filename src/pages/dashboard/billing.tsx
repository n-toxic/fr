import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetWallet, useListTransactions, useCreateDeposit, useVerifyDeposit } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { CreditCard, Wallet, ArrowUpRight, ArrowDownLeft, Plus } from "lucide-react";

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

declare global { interface Window { Razorpay: new (opts: Record<string, unknown>) => { open(): void }; } }

function IOSSpinner() {
  return (
    <div className="flex justify-center py-6">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1="14" y1="3" x2="14" y2="8" stroke="hsl(var(--primary))"
            strokeWidth="2.5" strokeLinecap="round"
            style={{ transform: `rotate(${i * 30}deg)`, transformOrigin: "14px 14px", opacity: (i + 1) / 12,
              animation: `ios-spin-${i} 1s linear infinite`, animationDelay: `${-i / 12}s` }} />
        ))}
      </svg>
    </div>
  );
}

function txStatusLabel(status: string, type: string) {
  if (status === "PENDING" && type === "DEPOSIT") return "FAILED";
  return status;
}
function txStatusColor(status: string, type: string) {
  const s = txStatusLabel(status, type);
  if (s === "SUCCESS") return "text-green-600 border-green-200 bg-green-50";
  if (s === "FAILED") return "text-red-600 border-red-200 bg-red-50";
  return "text-orange-600 border-orange-200 bg-orange-50";
}

export default function Billing() {
  const { data: wallet, isLoading: walletLoading, refetch: refetchWallet } = useGetWallet();
  const { data: transactions = [], isLoading: txLoading, refetch: refetchTx } = useListTransactions();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const createDepositMut = useCreateDeposit({
    mutation: {
      onError: (err: { data?: { error?: string } }) => {
        toast({ title: "Failed to create order", description: err?.data?.error, variant: "destructive" });
        setLoading(false);
      },
    },
  });

  const verifyMut = useVerifyDeposit({
    mutation: {
      onSuccess: () => {
        toast({ title: "Payment successful!", description: "Your wallet has been topped up." });
        refetchWallet();
        refetchTx();
        setLoading(false);
        setAmount("");
      },
      onError: () => {
        toast({ title: "Payment verification failed", variant: "destructive" });
        setLoading(false);
      },
    },
  });

  useEffect(() => {
    if (!document.querySelector('script[src*="checkout.razorpay"]')) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleDeposit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 100) { toast({ title: "Minimum deposit is ₹100", variant: "destructive" }); return; }
    setLoading(true);
    createDepositMut.mutate({ data: { amount: amt } }, {
      onSuccess: (order) => {
        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "Techofy Cloud",
          description: "Wallet Top-up",
          order_id: order.orderId,
          handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            verifyMut.mutate({ data: { orderId: response.razorpay_order_id, paymentId: response.razorpay_payment_id, signature: response.razorpay_signature } });
          },
          modal: { ondismiss: () => setLoading(false) },
          theme: { color: "#2563EB" },
        });
        rzp.open();
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl pb-4">
        <div>
          <h1 className="text-2xl font-bold">Billing & Wallet</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your Techofy Wallet and view transaction history.</p>
        </div>

        {/* Wallet balance card */}
        <motion.div whileHover={{ y: -2 }}>
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-0 overflow-hidden">
            <CardContent className="p-6 relative">
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-12 translate-x-12" />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-10 -translate-x-8" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <Wallet className="w-5 h-5 opacity-80" />
                  <span className="text-sm font-medium opacity-80">Techofy Wallet</span>
                </div>
                {walletLoading ? (
                  <Skeleton className="h-10 w-40 bg-white/20" />
                ) : (
                  <p className="text-4xl font-bold">₹{wallet?.balance.toFixed(2) ?? "0.00"}</p>
                )}
                <p className="text-sm opacity-70 mt-1">Available balance</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Add funds */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" /> Add Funds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preset amounts */}
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((amt) => (
                <Button
                  key={amt}
                  variant={amount === String(amt) ? "default" : "outline"}
                  className={amount === String(amt) ? "bg-primary text-white" : ""}
                  onClick={() => setAmount(String(amt))}
                >
                  ₹{amt}
                </Button>
              ))}
            </div>

            {/* Custom amount - FIXED: always visible, full width */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
              <Input
                type="number"
                placeholder="Custom amount (min ₹100)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
                min={100}
              />
            </div>

            {/* Pay button - always at bottom, full width */}
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white"
              onClick={handleDeposit}
              disabled={loading || !amount || parseFloat(amount) < 100}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay via Razorpay {amount && parseFloat(amount) >= 100 ? `· ₹${parseFloat(amount).toLocaleString()}` : ""}
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
              <span className="text-green-600">✓</span>
              Secured by Razorpay · Supports UPI, Cards, Net Banking
            </p>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" /> Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {txLoading ? <IOSSpinner /> : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-1 divide-y divide-border">
                {transactions.map((tx) => {
                  const isDeposit = tx.type === "DEPOSIT" && tx.status === "SUCCESS";
                  const label = txStatusLabel(tx.status, tx.type);
                  const date = tx.date ? new Date(tx.date) : null;
                  const dateStr = date && !isNaN(date.getTime())
                    ? date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                    : "—";
                  return (
                    <div key={tx.id} className="flex items-center gap-3 py-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isDeposit ? "bg-green-100" : "bg-red-100"}`}>
                        {isDeposit
                          ? <ArrowDownLeft className="w-4 h-4 text-green-600" />
                          : <ArrowUpRight className="w-4 h-4 text-red-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{tx.description || (tx.type === "DEPOSIT" ? "Wallet top-up" : "Server deduction")}</p>
                        <p className="text-xs text-muted-foreground">{dateStr}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${isDeposit ? "text-green-600" : "text-red-600"}`}>
                          {isDeposit ? "+" : "-"}₹{tx.amount.toFixed(2)}
                        </p>
                        <Badge variant="outline" className={`text-xs ${txStatusColor(tx.status, tx.type)}`}>
                          {label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
