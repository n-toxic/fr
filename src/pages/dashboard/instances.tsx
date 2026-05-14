import { motion } from "framer-motion";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListInstances, useStartInstance, useStopInstance, useRebootInstance } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Server, Play, Square, RotateCcw, Trash2, PlusCircle, Monitor, Terminal, ExternalLink } from "lucide-react";
import { useState } from "react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; class: string }> = {
    RUNNING: { label: "Running", class: "bg-secondary/10 text-secondary border-secondary/20" },
    STOPPED: { label: "Stopped", class: "bg-muted text-muted-foreground border-border" },
    PENDING: { label: "Pending", class: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
    PROVISIONING: { label: "Provisioning", class: "bg-primary/10 text-primary border-primary/20" },
    ERROR: { label: "Error", class: "bg-destructive/10 text-destructive border-destructive/20" },
  };
  const s = map[status] ?? { label: status, class: "bg-muted text-muted-foreground border-border" };
  return <Badge variant="outline" className={`text-xs ${s.class}`}>{s.label}</Badge>;
}

export default function Instances() {
  const { data: instances = [], isLoading, refetch } = useListInstances();
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const startMutation = useStartInstance({ mutation: { onSuccess: () => { toast({ title: "Server starting..." }); refetch(); }, onError: () => toast({ title: "Failed to start", variant: "destructive" }) } });
  const stopMutation = useStopInstance({ mutation: { onSuccess: () => { toast({ title: "Server stopping..." }); refetch(); }, onError: () => toast({ title: "Failed to stop", variant: "destructive" }) } });
  const rebootMutation = useRebootInstance({ mutation: { onSuccess: () => { toast({ title: "Server rebooting..." }); refetch(); }, onError: () => toast({ title: "Failed to reboot", variant: "destructive" }) } });
  const action = (fn: () => void, id: string) => { setLoadingId(id); fn(); setTimeout(() => setLoadingId(null), 3000); };

  const handleDelete = async (instanceId: string) => {
    if (!confirm("Delete this server permanently? This cannot be undone.")) return;
    setLoadingId(instanceId);
    try {
      await customFetch(`/api/instances/${instanceId}`, { method: "DELETE" });
      toast({ title: "Server deleted" });
      refetch();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Servers</h1>
            <p className="text-sm text-muted-foreground mt-1">{instances.length} server{instances.length !== 1 ? "s" : ""} deployed</p>
          </div>
          <Link href="/dashboard/deploy">
            <Button className="bg-primary hover:bg-primary/90 text-white" data-testid="button-deploy">
              <PlusCircle className="w-4 h-4 mr-2" /> Deploy New
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
          </div>
        ) : instances.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Server className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="font-semibold mb-2">No servers yet</h3>
              <p className="text-sm text-muted-foreground mb-6">Deploy your first cloud server in under 2 minutes.</p>
              <Link href="/dashboard/deploy">
                <Button className="bg-primary hover:bg-primary/90 text-white" data-testid="button-deploy-first">
                  <PlusCircle className="w-4 h-4 mr-2" /> Deploy First Server
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {instances.map((inst, i) => (
              <motion.div key={inst.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="overflow-hidden hover:shadow-md hover:shadow-primary/5 transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${inst.os === "WINDOWS" ? "bg-blue-500/10" : "bg-emerald-500/10"}`}>
                        {inst.os === "WINDOWS" ? <Monitor className="w-5 h-5 text-blue-500" /> : <Terminal className="w-5 h-5 text-emerald-500" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">{inst.hostname}</p>
                          <StatusBadge status={inst.status} />
                          <Badge variant="outline" className="text-xs">{inst.os === "WINDOWS" ? "Windows RDP" : "Ubuntu VPS"}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {inst.ram}GB RAM · {inst.cpu} vCPU · {inst.storage}GB SSD
                          {inst.ip && ` · ${inst.ip}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ₹{inst.monthlyCost.toFixed(2)}/mo · Deployed {new Date(inst.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        <Link href={`/dashboard/instances/${inst.id}`}>
                          <Button variant="outline" size="sm" className="text-xs h-8" data-testid={`button-detail-${inst.id}`}>
                            <ExternalLink className="w-3 h-3 mr-1" /> Manage
                          </Button>
                        </Link>

                        {inst.status === "RUNNING" && (
                          <>
                            <Button variant="outline" size="sm" className="text-xs h-8 text-orange-600 border-orange-500/30 hover:bg-orange-500/10"
                              disabled={loadingId === inst.id}
                              onClick={() => action(() => rebootMutation.mutate({ instanceId: inst.id }), inst.id)}
                              data-testid={`button-reboot-${inst.id}`}
                            >
                              <RotateCcw className="w-3 h-3 mr-1" /> Reboot
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
                              disabled={loadingId === inst.id}
                              onClick={() => action(() => stopMutation.mutate({ instanceId: inst.id }), inst.id)}
                              data-testid={`button-stop-${inst.id}`}
                            >
                              <Square className="w-3 h-3 mr-1" /> Stop
                            </Button>
                          </>
                        )}

                        {inst.status === "STOPPED" && (
                          <Button variant="outline" size="sm" className="text-xs h-8 text-secondary border-secondary/30 hover:bg-secondary/10"
                            disabled={loadingId === inst.id}
                            onClick={() => action(() => startMutation.mutate({ instanceId: inst.id }), inst.id)}
                            data-testid={`button-start-${inst.id}`}
                          >
                            <Play className="w-3 h-3 mr-1" /> Start
                          </Button>
                        )}

                        <Button variant="ghost" size="sm" className="text-xs h-8 text-destructive hover:bg-destructive/10"
                          disabled={loadingId === inst.id}
                          onClick={() => handleDelete(inst.id)}
                          data-testid={`button-delete-${inst.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
