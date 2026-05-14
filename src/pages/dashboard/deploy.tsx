import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListPlans, useDeployInstance, useGetWallet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Monitor, Terminal, Check, AlertCircle, Rocket, Star, CreditCard, User, Lock } from "lucide-react";

export default function Deploy() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { data: plans = [], isLoading } = useListPlans();
  const { data: wallet } = useGetWallet();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [osTab, setOsTab] = useState<"RDP" | "VPS">("RDP");
  const [customUsername, setCustomUsername] = useState("");
  const [customPassword, setCustomPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const deployMut = useDeployInstance({
    mutation: {
      onSuccess: () => {
        toast({ title: "Server deploying!", description: "Your server will be ready shortly. Admin will assign credentials." });
        setLocation("/dashboard/instances");
      },
      onError: (err: { data?: { error?: string }; message?: string }) => {
        toast({ title: "Deployment failed", description: err?.data?.error ?? err?.message ?? "Insufficient balance or error.", variant: "destructive" });
        setShowConfirm(false);
      },
    },
  });

  const filteredPlans = plans.filter((p) => p.type === osTab);
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const hasEnoughBalance = wallet && selectedPlan ? wallet.balance >= selectedPlan.monthlyCost : true;

  const handleDeploy = () => {
    if (!selectedPlanId) { toast({ title: "Please select a plan", variant: "destructive" }); return; }
    if (!hasEnoughBalance) { toast({ title: "Insufficient balance", description: "Please add funds to your wallet.", variant: "destructive" }); return; }
    deployMut.mutate({
      data: {
        planId: selectedPlanId,
        customUsername: customUsername.trim() || undefined,
        customPassword: customPassword.trim() || undefined,
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl pb-4">
        <div>
          <h1 className="text-2xl font-bold">Deploy a Server</h1>
          <p className="text-sm text-muted-foreground mt-1">Choose your plan and deploy instantly.</p>
        </div>

        {/* OS Tab */}
        <div className="flex gap-2">
          {(["RDP", "VPS"] as const).map((tab) => (
            <Button key={tab}
              variant={osTab === tab ? "default" : "outline"}
              onClick={() => { setOsTab(tab); setSelectedPlanId(null); }}
              className={osTab === tab ? "bg-primary text-white" : ""}
            >
              {tab === "RDP" ? <Monitor className="w-4 h-4 mr-2" /> : <Terminal className="w-4 h-4 mr-2" />}
              {tab === "RDP" ? "Windows RDP" : "Ubuntu VPS"}
            </Button>
          ))}
        </div>

        {/* Plans */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Select a Plan</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredPlans.map((plan, i) => {
                const selected = selectedPlanId === plan.id;
                const affordable = wallet ? wallet.balance >= plan.monthlyCost : true;
                return (
                  <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <div
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`relative rounded-xl border p-4 cursor-pointer transition-all ${
                        selected ? "border-primary bg-primary/5 shadow-lg shadow-primary/15" : "border-border bg-card hover:border-primary/40 hover:shadow-md"
                      } ${!affordable ? "opacity-60" : ""}`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-2 left-3">
                          <Badge className="bg-primary text-white text-xs px-2 py-0.5">
                            <Star className="w-2.5 h-2.5 mr-0.5" /> Popular
                          </Badge>
                        </div>
                      )}
                      {selected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="mt-1">
                        <p className="font-semibold text-sm">{plan.name}</p>
                        <p className="text-xs text-muted-foreground mb-3">{plan.os}</p>
                        <div className="mb-3">
                          <span className="text-2xl font-bold">₹{plan.monthlyCost.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground">/mo</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-xs mb-3">
                          <Badge variant="outline" className="text-xs">{plan.ram}GB RAM</Badge>
                          <Badge variant="outline" className="text-xs">{plan.cpu} vCPU</Badge>
                          <Badge variant="outline" className="text-xs">{plan.storage}GB SSD</Badge>
                        </div>
                        <ul className="space-y-1">
                          {plan.features.slice(0, 3).map((f) => (
                            <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Check className="w-3 h-3 text-secondary shrink-0" /> {f}
                            </li>
                          ))}
                        </ul>
                        {!affordable && (
                          <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Insufficient balance
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Custom credentials */}
        <AnimatePresence>
          {selectedPlanId && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Custom Credentials (Optional)</h3>
                    <p className="text-xs text-muted-foreground">Leave blank to use default credentials assigned by admin.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1.5"><User className="w-3 h-3" /> Username</Label>
                      <Input
                        placeholder={osTab === "RDP" ? "TechofyUser" : "techofy"}
                        value={customUsername}
                        onChange={(e) => setCustomUsername(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1.5"><Lock className="w-3 h-3" /> Password</Label>
                      <Input
                        type="password"
                        placeholder="Leave blank for admin-assigned"
                        value={customPassword}
                        onChange={(e) => setCustomPassword(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirm & Deploy */}
        <AnimatePresence>
          {selectedPlan && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold">{selectedPlan.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedPlan.ram}GB RAM · {selectedPlan.cpu} vCPU · {selectedPlan.storage}GB SSD</p>
                    </div>
                    <p className="text-xl font-bold text-primary">₹{selectedPlan.monthlyCost}</p>
                  </div>
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5"><CreditCard className="w-4 h-4" /> Wallet Balance</span>
                    <span className={`font-semibold ${hasEnoughBalance ? "text-green-600" : "text-destructive"}`}>
                      ₹{wallet?.balance.toFixed(2) ?? "0.00"}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/90 text-white"
                      disabled={deployMut.isPending || !hasEnoughBalance}
                      onClick={handleDeploy}
                    >
                      {deployMut.isPending ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Deploying...
                        </span>
                      ) : (
                        <><Rocket className="w-4 h-4 mr-2" /> Deploy Now · ₹{selectedPlan.monthlyCost}</>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedPlanId(null)}>Cancel</Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    ₹{selectedPlan.monthlyCost} will be deducted from your wallet immediately. Servers deploy within 60 seconds.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
