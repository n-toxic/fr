import { createRoot } from "react-dom/client";
import { Component, type ReactNode } from "react";
import App from "./App";
import "./index.css";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error) {
    console.error("App crashed:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f8fafc", fontFamily:"Inter,sans-serif", padding:"24px" }}>
          <div style={{ background:"#fff", borderRadius:"16px", padding:"40px", boxShadow:"0 4px 24px rgba(0,0,0,.08)", maxWidth:"440px", width:"100%", textAlign:"center" }}>
            <div style={{ fontSize:"48px", marginBottom:"16px" }}>⚠️</div>
            <h1 style={{ fontSize:"20px", fontWeight:"700", color:"#111", margin:"0 0 8px" }}>Something went wrong</h1>
            <p style={{ color:"#6b7280", fontSize:"14px", margin:"0 0 24px" }}>Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              style={{ background:"#2563eb", color:"#fff", border:"none", borderRadius:"8px", padding:"10px 24px", fontSize:"14px", fontWeight:"600", cursor:"pointer" }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("#root element not found");

createRoot(rootEl).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
