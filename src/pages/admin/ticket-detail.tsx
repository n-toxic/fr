import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAdminReplyTicket, useUpdateTicketStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ArrowLeft, HelpCircle, Send, MessageCircle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Inline API call since we need admin ticket detail which may not be in api.ts yet
interface TicketMessage {
  id: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
  authorName: string;
}

interface AdminTicketDetail {
  id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userEmail: string;
  messages: TicketMessage[];
}

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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; class: string }> = {
    OPEN: { label: "Open", class: "bg-primary/10 text-primary border-primary/20" },
    IN_PROGRESS: { label: "In Progress", class: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
    CLOSED: { label: "Closed", class: "bg-muted text-muted-foreground border-border" },
  };
  const s = map[status] ?? { label: status, class: "bg-muted text-muted-foreground border-border" };
  return <Badge variant="outline" className={`text-xs ${s.class}`}>{s.label}</Badge>;
}

export default function AdminTicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [reply, setReply] = useState("");

  const { data: ticket, isLoading, refetch } = useQuery<AdminTicketDetail>({
    queryKey: ["admin-ticket", id],
    queryFn: () => apiFetch<AdminTicketDetail>(`/admin/tickets/${id}`),
    enabled: !!id,
    staleTime: 15_000,
  });

  const replyMut = useAdminReplyTicket({
    mutation: {
      onSuccess: () => { refetch(); setReply(""); toast({ title: "Reply sent" }); },
      onError: () => toast({ title: "Failed to send reply", variant: "destructive" }),
    },
  });

  const statusMut = useUpdateTicketStatus({
    mutation: {
      onSuccess: () => { refetch(); toast({ title: "Status updated" }); },
      onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 max-w-2xl">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!ticket) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="font-semibold">Ticket not found</p>
          <Link href="/admin/tickets"><Button variant="link" className="text-primary mt-2">Back to tickets</Button></Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <Link href="/admin/tickets">
            <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold truncate">{ticket.subject}</h1>
              <StatusBadge status={ticket.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              {ticket.userEmail} · Opened {new Date(ticket.createdAt).toLocaleString("en-IN")}
            </p>
          </div>
          {/* Status controls */}
          <div className="flex gap-2 shrink-0">
            {ticket.status !== "IN_PROGRESS" && ticket.status !== "CLOSED" && (
              <Button size="sm" variant="outline"
                className="text-xs border-orange-500/30 text-orange-600 hover:bg-orange-500/10"
                disabled={statusMut.isPending}
                onClick={() => statusMut.mutate({ ticketId: ticket.id, status: "IN_PROGRESS" })}
              >
                <Clock className="w-3 h-3 mr-1" /> In Progress
              </Button>
            )}
            {ticket.status !== "CLOSED" && (
              <Button size="sm" variant="outline"
                className="text-xs border-green-500/30 text-green-600 hover:bg-green-500/10"
                disabled={statusMut.isPending}
                onClick={() => statusMut.mutate({ ticketId: ticket.id, status: "CLOSED" })}
              >
                <CheckCircle className="w-3 h-3 mr-1" /> Close
              </Button>
            )}
            {ticket.status === "CLOSED" && (
              <Button size="sm" variant="outline"
                className="text-xs border-primary/30 text-primary hover:bg-primary/10"
                disabled={statusMut.isPending}
                onClick={() => statusMut.mutate({ ticketId: ticket.id, status: "OPEN" })}
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Reopen
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {ticket.messages?.map((msg, i) => {
            const isAdmin = msg.isAdmin;
            return (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] rounded-2xl p-4 ${isAdmin ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${isAdmin ? "bg-white/20" : "bg-primary/10"}`}>
                      {isAdmin ? "A" : msg.authorName?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <span className={`text-xs font-medium ${isAdmin ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {isAdmin ? "Support Team (You)" : msg.authorName}
                    </span>
                    <span className={`text-xs ${isAdmin ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      · {new Date(msg.createdAt).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            );
          })}
          {(!ticket.messages || ticket.messages.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No messages yet</p>
            </div>
          )}
        </div>

        {/* Reply box */}
        {ticket.status !== "CLOSED" ? (
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Reply as Support</span>
            </div>
            <Textarea
              placeholder="Type your response..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={4}
              data-testid="input-reply"
            />
            <Button
              className="bg-primary hover:bg-primary/90 text-white"
              disabled={!reply.trim() || replyMut.isPending}
              onClick={() => replyMut.mutate({ ticketId: id, data: { message: reply } })}
              data-testid="button-send-reply"
            >
              <Send className="w-4 h-4 mr-2" />
              {replyMut.isPending ? "Sending..." : "Send Reply"}
            </Button>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground bg-muted/30 rounded-xl border border-border">
            <p className="text-sm">This ticket is closed. Reopen it to reply.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
