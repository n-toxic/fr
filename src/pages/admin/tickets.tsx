import { motion } from "framer-motion";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetAdminTickets, useUpdateTicketStatus } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { HelpCircle, Search, ExternalLink, MessageCircle, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AdminTicket = {
  id: string;
  subject: string;
  status: string;
  userEmail?: string | null;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; class: string; icon: React.ElementType }> = {
    OPEN: { label: "Open", class: "bg-primary/10 text-primary border-primary/20", icon: MessageCircle },
    IN_PROGRESS: { label: "In Progress", class: "bg-orange-500/10 text-orange-600 border-orange-500/20", icon: Clock },
    CLOSED: { label: "Closed", class: "bg-muted text-muted-foreground border-border", icon: CheckCircle },
  };
  const s = map[status] ?? { label: status, class: "bg-muted text-muted-foreground border-border", icon: HelpCircle };
  const Icon = s.icon;
  return (
    <Badge variant="outline" className={`text-xs flex items-center gap-1 w-fit ${s.class}`}>
      <Icon className="w-3 h-3" /> {s.label}
    </Badge>
  );
}

export default function AdminTickets() {
  const { data: tickets = [], isLoading, refetch } = useGetAdminTickets();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "IN_PROGRESS" | "CLOSED">("ALL");

  const statusMut = useUpdateTicketStatus({
    mutation: {
      onSuccess: () => { toast({ title: "Ticket status updated" }); refetch(); },
      onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
    },
  });

  const filtered = (tickets as AdminTicket[]).filter((t) => {
    const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) ||
      (t.userEmail?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    ALL: (tickets as AdminTicket[]).length,
    OPEN: (tickets as AdminTicket[]).filter((t) => t.status === "OPEN").length,
    IN_PROGRESS: (tickets as AdminTicket[]).filter((t) => t.status === "IN_PROGRESS").length,
    CLOSED: (tickets as AdminTicket[]).filter((t) => t.status === "CLOSED").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">{(tickets as AdminTicket[]).length} total tickets</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search tickets or users..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="pl-10" data-testid="input-search" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["ALL", "OPEN", "IN_PROGRESS", "CLOSED"] as const).map((s) => (
              <Button key={s} size="sm"
                variant={statusFilter === s ? "default" : "outline"}
                className={statusFilter === s ? "bg-primary text-white" : ""}
                onClick={() => setStatusFilter(s)}
                data-testid={`filter-${s.toLowerCase()}`}
              >
                {s === "IN_PROGRESS" ? "In Progress" : s.charAt(0) + s.slice(1).toLowerCase()} ({counts[s]})
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No tickets found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((ticket, i) => (
              <motion.div key={ticket.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="hover:shadow-md hover:shadow-primary/5 transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 flex-wrap justify-between">
                          <div>
                            <p className="font-medium text-sm">{ticket.subject}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <StatusBadge status={ticket.status} />
                              <span className="text-xs text-muted-foreground">
                                {ticket.userEmail ?? "Unknown user"} ·{" "}
                                {new Date(ticket.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 flex-wrap">
                            {ticket.status !== "CLOSED" && (
                              <Button
                                variant="outline" size="sm"
                                className="text-xs border-green-500/30 text-green-600 hover:bg-green-500/10"
                                disabled={statusMut.isPending}
                                onClick={() => statusMut.mutate({ ticketId: ticket.id, status: "CLOSED" })}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" /> Close
                              </Button>
                            )}
                            {ticket.status === "CLOSED" && (
                              <Button
                                variant="outline" size="sm"
                                className="text-xs border-primary/30 text-primary hover:bg-primary/10"
                                disabled={statusMut.isPending}
                                onClick={() => statusMut.mutate({ ticketId: ticket.id, status: "OPEN" })}
                              >
                                <MessageCircle className="w-3 h-3 mr-1" /> Reopen
                              </Button>
                            )}
                            {/* Fixed: link to /admin/tickets/:id, not /dashboard/support/:id */}
                            <Link href={`/admin/tickets/${ticket.id}`}>
                              <Button variant="outline" size="sm" className="text-xs" data-testid={`button-view-ticket-${ticket.id}`}>
                                <ExternalLink className="w-3 h-3 mr-1" /> Reply
                              </Button>
                            </Link>
                          </div>
                        </div>
                        {ticket.updatedAt !== ticket.createdAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Last updated {new Date(ticket.updatedAt).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                          </p>
                        )}
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
