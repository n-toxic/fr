import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetAdminInstances, useAssignInstance } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Server, Search, Monitor, Terminal, UserPlus } from "lucide-react";

type AdminInstance = {
  id: string;
  hostname: string;
  status: string;
  os: string;
  ram: number;
  cpu: number;
  storage: number;
  monthlyCost: number;
  ip: string | null;
  userId: string | null;
  userEmail?: string | null;
  createdAt: string;
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { class: string }> = {
    RUNNING: { class: "bg-secondary/10 text-secondary border-secondary/20" },
    STOPPED: { class: "bg-muted text-muted-foreground border-border" },
    PENDING: { class: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
    PROVISIONING: { class: "bg-primary/10 text-primary border-primary/20" },
    ERROR: { class: "bg-destructive/10 text-destructive border-destructive/20" },
  };
  const s = map[status] ?? { class: "bg-muted text-muted-foreground border-border" };
  return <Badge variant="outline" className={`text-xs ${s.class}`}>{status}</Badge>;
}

export default function AdminInstances() {
  const { data: instances = [], isLoading, refetch } = useGetAdminInstances();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [assignInst, setAssignInst] = useState<AdminInstance | null>(null);
  const [assignEmail, setAssignEmail] = useState("");

  const assignMut = useAssignInstance({
    mutation: {
      onSuccess: () => {
        toast({ title: "Instance assigned" });
        refetch();
        setAssignInst(null);
        setAssignEmail("");
      },
      onError: () => toast({ title: "Assignment failed", variant: "destructive" }),
    },
  });

  const filtered = (instances as AdminInstance[]).filter((inst) =>
    inst.hostname.toLowerCase().includes(search.toLowerCase()) ||
    (inst.userEmail?.toLowerCase().includes(search.toLowerCase())) ||
    (inst.ip?.includes(search))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">All Servers</h1>
          <p className="text-sm text-muted-foreground mt-1">{(instances as AdminInstance[]).length} total instances</p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by hostname, user, IP..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="pl-10" data-testid="input-search" />
        </div>

        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((inst, i) => (
              <motion.div key={inst.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${inst.os === "WINDOWS" ? "bg-blue-500/10" : "bg-emerald-500/10"}`}>
                        {inst.os === "WINDOWS" ? <Monitor className="w-5 h-5 text-blue-500" /> : <Terminal className="w-5 h-5 text-emerald-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{inst.hostname}</p>
                          <StatusBadge status={inst.status} />
                          <Badge variant="outline" className="text-xs">{inst.os === "WINDOWS" ? "Windows RDP" : "Ubuntu VPS"}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {inst.ram}GB RAM · {inst.cpu} vCPU · {inst.storage}GB SSD
                          {inst.ip && ` · ${inst.ip}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Owner: {inst.userEmail ?? <span className="text-orange-500">Unassigned</span>} ·
                          ₹{inst.monthlyCost.toFixed(2)}/mo
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="shrink-0"
                        onClick={() => { setAssignInst(inst); setAssignEmail(inst.userEmail ?? ""); }}
                        data-testid={`button-assign-${inst.id}`}
                      >
                        <UserPlus className="w-3.5 h-3.5 mr-1" /> Assign
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Server className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No instances found</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={!!assignInst} onOpenChange={() => setAssignInst(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Assign Instance to User</DialogTitle></DialogHeader>
          {assignInst && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium">{assignInst.hostname}</p>
                <p className="text-muted-foreground">{assignInst.os} · {assignInst.ram}GB RAM</p>
              </div>
              <Input placeholder="User email address" value={assignEmail}
                onChange={(e) => setAssignEmail(e.target.value)} type="email" data-testid="input-assign-email" />
              <Button className="w-full bg-primary hover:bg-primary/90 text-white"
                disabled={!assignEmail || assignMut.isPending}
                onClick={() => assignMut.mutate({ instanceId: assignInst.id, data: { userEmail: assignEmail } })}
                data-testid="button-confirm-assign"
              >
                {assignMut.isPending ? "Assigning..." : "Assign Instance"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
