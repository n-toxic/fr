import { motion } from "framer-motion";
import { useParams } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  useGetInstance, useGetInstanceCredentials, useStartInstance,
  useStopInstance, useRebootInstance, useGetInstancePorts, useAddInstancePort, useDeleteInstancePort
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Server, Play, Square, RotateCcw, Copy, Eye, EyeOff,
  Monitor, Terminal, Network, Plus, Trash2, ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

function CopyField({ label, value }: { label: string; value: string }) {
  const { toast } = useToast();
  const [show, setShow] = useState(false);
  const isPassword = label.toLowerCase().includes("password");

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <div className="flex items-center gap-2">
        <Input
          readOnly
          value={isPassword && !show ? "••••••••••••" : value}
          className="text-sm font-mono bg-muted/50 border-border"
        />
        {isPassword && (
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => setShow(!show)}>
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0"
          onClick={() => { navigator.clipboard.writeText(value); toast({ title: "Copied to clipboard" }); }}
          data-testid={`button-copy-${label.toLowerCase().replace(/\s/g, "-")}`}
        >
          <Copy className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; class: string }> = {
    RUNNING: { label: "Running", class: "bg-secondary/10 text-secondary border-secondary/20" },
    STOPPED: { label: "Stopped", class: "bg-muted text-muted-foreground border-border" },
    PENDING: { label: "Pending", class: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
    ERROR: { label: "Error", class: "bg-destructive/10 text-destructive border-destructive/20" },
  };
  const s = map[status] ?? { label: status, class: "bg-muted text-muted-foreground border-border" };
  return <Badge variant="outline" className={`${s.class}`}>{s.label}</Badge>;
}

export default function InstanceDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [showCreds, setShowCreds] = useState(false);
  const [newPort, setNewPort] = useState("");
  const [newProtocol, setNewProtocol] = useState("TCP");

  const { data: inst, isLoading, refetch } = useGetInstance(id);
  const { data: creds, refetch: refetchCreds } = useGetInstanceCredentials(id, { query: { enabled: showCreds } });
  const { data: ports = [], refetch: refetchPorts } = useGetInstancePorts(id);

  const startMut = useStartInstance({ mutation: { onSuccess: () => { toast({ title: "Starting..." }); refetch(); } } });
  const stopMut = useStopInstance({ mutation: { onSuccess: () => { toast({ title: "Stopping..." }); refetch(); } } });
  const rebootMut = useRebootInstance({ mutation: { onSuccess: () => { toast({ title: "Rebooting..." }); refetch(); } } });
  const addPortMut = useAddInstancePort({
    mutation: {
      onSuccess: () => { toast({ title: "Port added" }); refetchPorts(); setNewPort(""); },
      onError: () => toast({ title: "Failed to add port", variant: "destructive" }),
    },
  });
  const delPortMut = useDeleteInstancePort({ mutation: { onSuccess: () => { toast({ title: "Port removed" }); refetchPorts(); } } });

  const handleShowCreds = () => { setShowCreds(true); refetchCreds(); };
  const handleAddPort = () => {
    const p = parseInt(newPort);
    if (!p || p < 1 || p > 65535) { toast({ title: "Invalid port number", variant: "destructive" }); return; }
    addPortMut.mutate({ instanceId: id, data: { port: p, protocol: newProtocol as "TCP" | "UDP" } });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!inst) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <Server className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="font-semibold">Server not found</p>
          <Link href="/dashboard/instances"><Button variant="link" className="text-primary mt-2">Back to servers</Button></Link>
        </div>
      </DashboardLayout>
    );
  }

  const isWindows = inst.os === "WINDOWS";

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/instances">
            <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isWindows ? "bg-blue-500/10" : "bg-emerald-500/10"}`}>
              {isWindows ? <Monitor className="w-5 h-5 text-blue-500" /> : <Terminal className="w-5 h-5 text-emerald-500" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{inst.hostname}</h1>
                <StatusBadge status={inst.status} />
              </div>
              <p className="text-xs text-muted-foreground">{isWindows ? "Windows RDP" : "Ubuntu VPS"} · {inst.ram}GB RAM · {inst.cpu} vCPU · {inst.storage}GB SSD</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Server className="w-4 h-4 text-primary" /> Server Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-white"
              disabled={inst.status !== "STOPPED"} onClick={() => startMut.mutate({ instanceId: id })} data-testid="button-start">
              <Play className="w-3.5 h-3.5 mr-1.5" /> Start
            </Button>
            <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10"
              disabled={inst.status !== "RUNNING"} onClick={() => stopMut.mutate({ instanceId: id })} data-testid="button-stop">
              <Square className="w-3.5 h-3.5 mr-1.5" /> Stop
            </Button>
            <Button size="sm" variant="outline" className="text-orange-600 border-orange-500/30 hover:bg-orange-500/10"
              disabled={inst.status !== "RUNNING"} onClick={() => rebootMut.mutate({ instanceId: id })} data-testid="button-reboot">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reboot
            </Button>
          </CardContent>
        </Card>

        {/* Server info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Connection Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {inst.ip && <CopyField label="IP Address" value={inst.ip} />}
            {inst.hostname && <CopyField label="Hostname" value={`${inst.hostname}.techofycloud.com`} />}

            {!showCreds ? (
              <Button variant="outline" size="sm" onClick={handleShowCreds} data-testid="button-show-creds">
                <Eye className="w-4 h-4 mr-2" /> Reveal Credentials
              </Button>
            ) : creds ? (
              <motion.div className="space-y-3 pt-2 border-t border-border" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <CopyField label="Username" value={creds.username} />
                <CopyField label="Password" value={creds.password} />
                {isWindows && (
                  <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 text-xs text-muted-foreground">
                    Use Windows Remote Desktop Connection (mstsc.exe) or any RDP client to connect using the IP/hostname above.
                  </div>
                )}
                {!isWindows && (
                  <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-xs text-muted-foreground mb-1">SSH Command:</p>
                    <code className="text-xs font-mono text-emerald-700">ssh {creds.username}@{inst.ip ?? `${inst.hostname}.techofycloud.com`}</code>
                  </div>
                )}
              </motion.div>
            ) : null}
          </CardContent>
        </Card>

        {/* Port management */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Network className="w-4 h-4 text-primary" /> Port Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ports.length > 0 && (
              <div className="space-y-2">
                {ports.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-mono">{p.protocol}</Badge>
                      <span className="text-sm font-mono">{p.port}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => delPortMut.mutate({ instanceId: id, portId: p.id })}
                      data-testid={`button-delete-port-${p.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="Port (1-65535)" value={newPort}
                onChange={(e) => setNewPort(e.target.value)} type="number" min="1" max="65535"
                className="max-w-40 font-mono text-sm"
                data-testid="input-port"
              />
              <select
                value={newProtocol}
                onChange={(e) => setNewProtocol(e.target.value)}
                className="px-3 py-2 rounded-md border border-input text-sm bg-background"
                data-testid="select-protocol"
              >
                <option value="TCP">TCP</option>
                <option value="UDP">UDP</option>
              </select>
              <Button size="sm" onClick={handleAddPort} disabled={addPortMut.isPending} data-testid="button-add-port">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Rule
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Billing Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Monthly Cost</p>
              <p className="font-bold text-lg text-primary">₹{inst.monthlyCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Deployed On</p>
              <p className="font-medium">{new Date(inst.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</p>
            </div>
            {inst.expiresAt && (
              <div>
                <p className="text-muted-foreground text-xs mb-1">Next Renewal</p>
                <p className="font-medium">{new Date(inst.expiresAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
