import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetSupportTicket, useReplyToTicket } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ArrowLeft, HelpCircle, Send, MessageCircle } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; class: string }> = {
    OPEN: { label: "Open", class: "bg-primary/10 text-primary border-primary/20" },
    IN_PROGRESS: { label: "In Progress", class: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
    CLOSED: { label: "Closed", class: "bg-muted text-muted-foreground border-border" },
  };
  const s = map[status] ?? { label: status, class: "bg-muted text-muted-foreground border-border" };
  return <Badge variant="outline" className={`text-xs ${s.class}`}>{s.label}</Badge>;
}

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [reply, setReply] = useState("");

  const { data: ticket, isLoading, refetch } = useGetSupportTicket(id);
  const replyMut = useReplyToTicket({
    mutation: {
      onSuccess: () => { refetch(); setReply(""); },
      onError: () => toast({ title: "Failed to send reply", variant: "destructive" }),
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
          <Link href="/dashboard/support"><Button variant="link" className="text-primary mt-2">Back to support</Button></Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/support">
            <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold truncate">{ticket.subject}</h1>
              <StatusBadge status={ticket.status} />
            </div>
            <p className="text-xs text-muted-foreground">Opened {new Date(ticket.createdAt).toLocaleString("en-IN")}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {ticket.messages?.map((msg, i) => {
            const isOwn = msg.senderRole !== "ADMIN";
            return (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] rounded-2xl p-4 ${isOwn ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${isOwn ? "bg-white/20" : "bg-primary/10"}`}>
                      {isOwn ? user?.email?.[0]?.toUpperCase() : "S"}
                    </div>
                    <span className={`text-xs font-medium ${isOwn ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {isOwn ? "You" : "Support Team"}
                    </span>
                    <span className={`text-xs ${isOwn ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      · {new Date(msg.createdAt).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Reply box */}
        {ticket.status !== "CLOSED" ? (
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Reply to Ticket</span>
            </div>
            <Textarea
              placeholder="Type your message..."
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
            <p className="text-sm">This ticket is closed. <Link href="/dashboard/support" className="text-primary hover:underline">Open a new ticket</Link> if you need further help.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
