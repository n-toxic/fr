import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetAdminUsers, useAdjustUserWallet } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Users, Wallet, Search, CheckCircle, XCircle } from "lucide-react";

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  walletBalance: number;
  isVerified: boolean;
  createdAt: string;
};

export default function AdminUsers() {
  const { data: users = [], isLoading, refetch } = useGetAdminUsers();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [walletUser, setWalletUser] = useState<AdminUser | null>(null);
  const [walletAmount, setWalletAmount] = useState("");
  const [walletType, setWalletType] = useState<"CREDIT" | "DEBIT">("CREDIT");

  const adjustMut = useAdjustUserWallet({
    mutation: {
      onSuccess: () => {
        toast({ title: "Wallet adjusted successfully" });
        refetch();
        setWalletUser(null);
        setWalletAmount("");
      },
      onError: () => toast({ title: "Failed to adjust wallet", variant: "destructive" }),
    },
  });

  const filtered = (users as AdminUser[]).filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.name?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-sm text-muted-foreground mt-1">{(users as AdminUser[]).length} registered accounts</p>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((user, i) => (
              <motion.div key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">{user.email[0].toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{user.name ?? user.email.split("@")[0]}</p>
                          <Badge variant={user.role === "ADMIN" ? "destructive" : "outline"} className="text-xs">{user.role}</Badge>
                          {user.isVerified ? (
                            <Badge variant="outline" className="text-xs bg-secondary/10 text-secondary border-secondary/20">
                              <CheckCircle className="w-2.5 h-2.5 mr-1" /> Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500/20">
                              <XCircle className="w-2.5 h-2.5 mr-1" /> Unverified
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{user.email} · Joined {new Date(user.createdAt).toLocaleDateString("en-IN")}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-primary">₹{user.walletBalance.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Balance</p>
                      </div>
                      <Button
                        variant="outline" size="sm"
                        onClick={() => { setWalletUser(user); setWalletAmount(""); setWalletType("CREDIT"); }}
                        data-testid={`button-adjust-wallet-${user.id}`}
                      >
                        <Wallet className="w-3.5 h-3.5 mr-1" /> Adjust
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No users found</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={!!walletUser} onOpenChange={() => setWalletUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Adjust Wallet Balance</DialogTitle>
          </DialogHeader>
          {walletUser && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium">{walletUser.name ?? walletUser.email}</p>
                <p className="text-muted-foreground">Current: ₹{walletUser.walletBalance.toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                {(["CREDIT", "DEBIT"] as const).map((t) => (
                  <Button key={t} variant={walletType === t ? "default" : "outline"}
                    className={walletType === t ? (t === "CREDIT" ? "bg-secondary text-white" : "bg-destructive text-white") : ""}
                    onClick={() => setWalletType(t)}
                    data-testid={`button-wallet-type-${t.toLowerCase()}`}
                  >
                    {t === "CREDIT" ? "+ Credit" : "- Debit"}
                  </Button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
                <Input
                  type="number" min="1" placeholder="Amount"
                  value={walletAmount} onChange={(e) => setWalletAmount(e.target.value)}
                  className="pl-8"
                  data-testid="input-wallet-amount"
                />
              </div>
              <Button
                className={`w-full ${walletType === "CREDIT" ? "bg-secondary hover:bg-secondary/90" : "bg-destructive hover:bg-destructive/90"} text-white`}
                disabled={!walletAmount || adjustMut.isPending}
                onClick={() => adjustMut.mutate({ userId: walletUser.id, data: { amount: walletType === "CREDIT" ? parseFloat(walletAmount) : -parseFloat(walletAmount), reason: `Admin ${walletType.toLowerCase()} adjustment` } })}
                data-testid="button-confirm-adjust"
              >
                {adjustMut.isPending ? "Processing..." : `Confirm ${walletType === "CREDIT" ? "Credit" : "Debit"} ₹${walletAmount}`}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
