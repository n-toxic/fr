import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetAdminServerPool, useAddServerToPool } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Database, PlusCircle, Monitor, Terminal, Server, Trash2, Pencil, Wifi, WifiOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = (import.meta as { env: Record<string, string> }).env.VITE_API_URL ?? "";
  const token = localStorage.getItem("token");
  return fetch(`${base}/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers },
  }).then(async (r) => {
    const data = await r.json();
    if (!r.ok) throw { status: r.status, data };
    return data as T;
  });
}

const schema = z.object({
  ip: z.string().min(7, "Invalid IP address"),
  rootUsername: z.string().min(1, "Root username required"),
  rootPassword: z.string().min(1, "Root password required"),
  type: z.enum(["RDP", "VPS"]),
  location: z.string().min(1, "Location required"),
});

const editSchema = z.object({
  ip: z.string().min(7, "Invalid IP address"),
  rootUsername: z.string().min(1, "Root username required"),
  location: z.string().min(1, "Location required"),
});

type PoolServer = {
  id: string;
  ip: string;
  type: string;
  location: string;
  status: string;
  isActive: boolean;
  rootUsername: string;
  assignedInstanceId?: string;
  addedAt: string;
};

export default function AdminServerPool() {
  const { data: pool = [], isLoading, refetch } = useGetAdminServerPool();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [pingStates, setPingStates] = useState<Record<string, "idle" | "pinging" | "ok" | "fail">>({});
  const [editServer, setEditServer] = useState<PoolServer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const addMut = useAddServerToPool({
    mutation: {
      onSuccess: () => {
        toast({ title: "Server added to pool" });
        refetch();
        form.reset();
      },
      onError: (err: { data?: { error?: string } }) => toast({ title: "Failed to add server", description: err?.data?.error, variant: "destructive" }),
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/server-pool/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Server removed" }); qc.invalidateQueries({ queryKey: ["admin-server-pool"] }); setDeleteConfirm(null); },
    onError: () => toast({ title: "Failed to delete server", variant: "destructive" }),
  });

  const editMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { ip: string; rootUsername: string; location: string } }) =>
      apiFetch(`/admin/server-pool/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => { toast({ title: "Server updated" }); qc.invalidateQueries({ queryKey: ["admin-server-pool"] }); setEditServer(null); },
    onError: () => toast({ title: "Failed to update server", variant: "destructive" }),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { ip: "", rootUsername: "root", rootPassword: "", type: "VPS", location: "Mumbai" },
  });

  const editForm = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
  });

  const pingServer = async (server: PoolServer) => {
    setPingStates((s) => ({ ...s, [server.id]: "pinging" }));
    try {
      const res = await apiFetch<{ reachable: boolean }>(`/admin/server-pool/${server.id}/ping`);
      setPingStates((s) => ({ ...s, [server.id]: res.reachable ? "ok" : "fail" }));
    } catch {
      setPingStates((s) => ({ ...s, [server.id]: "fail" }));
    }
    setTimeout(() => setPingStates((s) => ({ ...s, [server.id]: "idle" })), 5000);
  };

  const openEdit = (server: PoolServer) => {
    setEditServer(server);
    editForm.reset({ ip: server.ip, rootUsername: server.rootUsername, location: server.location });
  };

  const servers = pool as PoolServer[];
  const available = servers.filter((s) => s.status === "AVAILABLE").length;
  const assigned = servers.length - available;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold">Server Pool</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage available physical servers for deployment.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Servers", value: servers.length, color: "bg-primary" },
            { label: "Available", value: available, color: "bg-emerald-500" },
            { label: "Assigned", value: assigned, color: "bg-orange-500" },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardContent className="p-4 flex items-center gap-3">
                {/* Fixed: use explicit w/h so icons fit inside the colored box */}
                <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                  <Server className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add server form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-primary" /> Add Server to Pool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((v) => addMut.mutate({ data: v }))} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="type"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Server Type</FormLabel>
                          <div className="flex gap-2">
                            {(["VPS", "RDP"] as const).map((t) => (
                              <Button key={t} type="button"
                                variant={field.value === t ? "default" : "outline"}
                                className={field.value === t ? "bg-primary text-white" : ""}
                                onClick={() => field.onChange(t)}
                                data-testid={`button-type-${t.toLowerCase()}`}
                              >
                                {t === "RDP" ? <Monitor className="w-3.5 h-3.5 mr-1.5" /> : <Terminal className="w-3.5 h-3.5 mr-1.5" />}
                                {t === "RDP" ? "Windows RDP" : "Ubuntu VPS"}
                              </Button>
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="ip"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>IP Address</FormLabel>
                          <FormControl><Input {...field} placeholder="192.168.1.100" data-testid="input-ip" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="rootUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Root Username</FormLabel>
                          <FormControl><Input {...field} placeholder="root" data-testid="input-root-username" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="rootPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Root Password</FormLabel>
                          <FormControl><Input {...field} type="password" placeholder="••••••••" data-testid="input-root-password" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="location"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Location / DC</FormLabel>
                          <FormControl><Input {...field} placeholder="Mumbai, IN" data-testid="input-location" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white"
                    disabled={addMut.isPending} data-testid="button-add-server">
                    {addMut.isPending ? "Adding..." : "Add Server"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Pool list */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Current Pool</h3>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
            ) : servers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
                <Database className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No servers in pool</p>
              </div>
            ) : (
              servers.map((server, i) => {
                const ping = pingStates[server.id] ?? "idle";
                return (
                  <motion.div key={server.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          {/* Fixed icon container - explicit w-9 h-9 */}
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${server.type === "RDP" ? "bg-blue-500/10" : "bg-emerald-500/10"}`}>
                            {server.type === "RDP"
                              ? <Monitor className="w-4 h-4 text-blue-500" />
                              : <Terminal className="w-4 h-4 text-emerald-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-mono text-sm font-medium">{server.ip}</p>
                              <Badge variant="outline" className={`text-xs ${server.status === "AVAILABLE" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-orange-500/10 text-orange-600 border-orange-500/20"}`}>
                                {server.status === "AVAILABLE" ? "Available" : "Assigned"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">{server.type}</Badge>
                              {ping === "ok" && <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20"><Wifi className="w-2.5 h-2.5 mr-1" />Online</Badge>}
                              {ping === "fail" && <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/20"><WifiOff className="w-2.5 h-2.5 mr-1" />Offline</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{server.location} · {server.rootUsername}</p>
                          </div>
                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="Ping server"
                              disabled={ping === "pinging"}
                              onClick={() => pingServer(server)}
                            >
                              {ping === "pinging" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit server"
                              onClick={() => openEdit(server)}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" title="Delete server"
                              onClick={() => setDeleteConfirm(server.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editServer} onOpenChange={() => setEditServer(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit Server</DialogTitle></DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((v) => editMut.mutate({ id: editServer!.id, data: v }))} className="space-y-4">
              <FormField control={editForm.control} name="ip" render={({ field }) => (
                <FormItem><FormLabel>IP Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={editForm.control} name="rootUsername" render={({ field }) => (
                <FormItem><FormLabel>Root Username</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={editForm.control} name="location" render={({ field }) => (
                <FormItem><FormLabel>Location / DC</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setEditServer(null)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-primary text-white" disabled={editMut.isPending}>
                  {editMut.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Remove Server</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to remove this server from the pool? This cannot be undone.</p>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" disabled={deleteMut.isPending}
              onClick={() => deleteConfirm && deleteMut.mutate(deleteConfirm)}>
              {deleteMut.isPending ? "Removing..." : "Remove Server"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
