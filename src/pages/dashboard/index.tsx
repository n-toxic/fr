import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useGetDashboardSummary, useListTransactions } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Server, CreditCard, HelpCircle, PlusCircle, Activity, TrendingUp, Clock, ArrowUpRight, ArrowDownLeft } from "lucide-react";

function StatCard({ title, value, icon: Icon, color, sub, href }: {
  title: string; value: string | number; icon: React.ElementType; color: string; sub?: string; href?: string;
}) {
  const [, setLocation] = useLocation();
  return (
    <motion.div whileHover={{ y: -4, scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card
        className={`overflow-hidden ${href ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
        onClick={() => href && setLocation(href)}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function IOSSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="animate-spin">
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1="14" y1="3" x2="14" y2="8" stroke="hsl(var(--primary))"
            strokeWidth="2.5" strokeLinecap="round"
            style={{ transform: `rotate(${i * 30}deg)`, transformOrigin: "14px 14px", opacity: (i + 1) / 12 }} />
        ))}
      </svg>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: summary, isLoading } = useGetDashboardSummary();
  const { data: transactions = [], isLoading: txLoading } = useListTransactions();

  const recentTx = transactions.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name ?? user?.email?.split("@")[0]}!</h1>
            <p className="text-muted-foreground text-sm mt-1">Here's an overview of your cloud infrastructure.</p>
          </div>
          <Link href="/dashboard/deploy">
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <PlusCircle className="w-4 h-4 mr-2" /> Deploy Server
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Running Servers" value={summary?.runningInstances ?? 0} icon={Server} color="bg-primary" sub="Active instances" href="/dashboard/instances" />
            <StatCard title="Wallet Balance" value={`₹${(summary?.walletBalance ?? 0).toFixed(2)}`} icon={CreditCard} color="bg-secondary" sub="Available funds" href="/dashboard/billing" />
            <StatCard title="Monthly Spend" value={`₹${(summary?.monthlySpend ?? 0).toFixed(2)}`} icon={TrendingUp} color="bg-orange-500" sub="This month" />
            <StatCard title="Open Tickets" value={summary?.openTickets ?? 0} icon={HelpCircle} color="bg-purple-500" sub="Support requests" href="/dashboard/support" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {[
                { href: "/dashboard/deploy", label: "Deploy Server", icon: PlusCircle, color: "bg-primary/10 text-primary hover:bg-primary/20" },
                { href: "/dashboard/instances", label: "My Servers", icon: Server, color: "bg-secondary/10 text-secondary hover:bg-secondary/20" },
                { href: "/dashboard/billing", label: "Add Funds", icon: CreditCard, color: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20" },
                { href: "/dashboard/support", label: "Get Support", icon: HelpCircle, color: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20" },
              ].map(({ href, label, icon: Icon, color }) => (
                <Link key={href} href={href}>
                  <div className={`flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer transition-colors ${color}`}>
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium text-center">{label}</span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {txLoading ? <IOSSpinner /> : recentTx.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No transactions yet</p>
                  <Link href="/dashboard/billing">
                    <Button variant="link" size="sm" className="mt-2 text-primary">Add funds to get started</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTx.map((tx) => {
                    const isDeposit = tx.type === "DEPOSIT" && tx.status === "SUCCESS";
                    const isFailed = tx.status === "FAILED" || (tx.status === "PENDING" && tx.type === "DEPOSIT");
                    const date = tx.date ? new Date(tx.date) : null;
                    return (
                      <div key={tx.id} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDeposit ? "bg-green-100" : isFailed ? "bg-red-100" : "bg-orange-100"}`}>
                          {isDeposit ? <ArrowDownLeft className="w-4 h-4 text-green-600" /> : <ArrowUpRight className="w-4 h-4 text-red-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{tx.description || tx.type}</p>
                          <p className="text-xs text-muted-foreground">{date && !isNaN(date.getTime()) ? date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${isDeposit ? "text-green-600" : "text-red-600"}`}>
                            {isDeposit ? "+" : "-"}₹{tx.amount.toFixed(2)}
                          </p>
                          <Badge variant="outline" className={`text-xs ${
                            tx.status === "SUCCESS" ? "text-green-600 border-green-200" :
                            tx.status === "FAILED" || (tx.status === "PENDING" && tx.type === "DEPOSIT") ? "text-red-600 border-red-200" :
                            "text-orange-600 border-orange-200"
                          }`}>
                            {tx.status === "PENDING" && tx.type === "DEPOSIT" ? "FAILED" : tx.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                  <Link href="/dashboard/billing">
                    <Button variant="link" size="sm" className="w-full text-primary">View all transactions</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Low balance warning */}
        {summary && summary.walletBalance < 500 && summary.totalInstances > 0 && (
          <motion.div
            className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-3"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          >
            <CreditCard className="w-5 h-5 text-orange-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Low wallet balance</p>
              <p className="text-xs text-muted-foreground">Add funds to keep your servers running without interruption.</p>
            </div>
            <Link href="/dashboard/billing">
              <Button size="sm" variant="outline" className="border-orange-500/30 text-orange-600 hover:bg-orange-500/10">Add Funds</Button>
            </Link>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
