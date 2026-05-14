import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, Server } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />

      <div className="relative text-center max-w-lg">
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8 inline-flex"
        >
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-2xl shadow-primary/20 border border-primary/20">
              <Server className="w-16 h-16 text-primary/60" />
            </div>
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-destructive flex items-center justify-center text-white text-xs font-bold shadow-lg"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              !
            </motion.div>
          </div>
        </motion.div>

        <motion.h1
          className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4"
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
        >
          404
        </motion.h1>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-2xl font-bold mb-3">Page Not Found</h2>
          <p className="text-muted-foreground mb-8">
            The Page you're looking doesn't exist in our network. It may have been deprovisioned, moved, or never deployed.
          </p>

          <div className="flex justify-center">
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90 text-white" data-testid="button-home">
                <Home className="w-4 h-4 mr-2" /> Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
