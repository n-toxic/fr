import { motion } from "framer-motion";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetAdminStats } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, Server, CreditCard, HelpCircle, TrendingUp,
  Database, Activity, ArrowUpRight
} from "lucide-react";

function StatCard({ title, value, icon: Icon, color, change, href }: {
  title: string; value: string | number; icon: React.ElementType;
  color: string; change?: string; href?: string;
}) {
  const content = (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className="overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {change && <p className="text-xs text-secondary mt-1">{change}</p>}
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
          {href && (
            <div className="mt-3 flex items-center gap-1 text-xs text-primary">
              <span>View all</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="destructive" className="text-xs">Admin</Badge>
          </div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform-wide overview and management.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Users" value={stats?.totalUsers ?? 0} icon={Users} color="bg-primary" href="/admin/users" change="Registered accounts" />
              <StatCard title="Active Servers" value={stats?.activeInstances ?? 0} icon={Server} color="bg-secondary" href="/admin/instances" change="Running instances" />
              <StatCard title="Total Revenue" value={`₹${(stats?.totalRevenue ?? 0).toLocaleString()}`} icon={TrendingUp} color="bg-orange-500" change="All time deposits" />
              <StatCard title="Open Tickets" value={stats?.openTickets ?? 0} icon={HelpCircle} color="bg-purple-500" href="/admin/tickets" change="Awaiting response" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Instances" value={stats?.totalInstances ?? 0} icon={Server} color="bg-blue-500" href="/admin/instances" />
              <StatCard title="Pool Available" value={stats?.serverPoolAvailable ?? 0} icon={Database} color="bg-teal-500" href="/admin/server-pool" change="Unassigned servers" />
              <StatCard title="Monthly Revenue" value={`₹${(stats?.monthlyRevenue ?? 0).toLocaleString()}`} icon={CreditCard} color="bg-indigo-500" />
              <StatCard title="Platform Health" value="99.9%" icon={Activity} color="bg-emerald-500" change="Uptime" />
            </div>
          </>
        )}

        {/* Quick nav */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: "/admin/users", label: "Manage Users", icon: Users, color: "text-primary bg-primary/10 hover:bg-primary/20" },
              { href: "/admin/instances", label: "All Servers", icon: Server, color: "text-secondary bg-secondary/10 hover:bg-secondary/20" },
              { href: "/admin/server-pool", label: "Server Pool", icon: Database, color: "text-teal-600 bg-teal-500/10 hover:bg-teal-500/20" },
              { href: "/admin/tickets", label: "Support Tickets", icon: HelpCircle, color: "text-purple-600 bg-purple-500/10 hover:bg-purple-500/20" },
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
      </div>
    </DashboardLayout>
  );
}
