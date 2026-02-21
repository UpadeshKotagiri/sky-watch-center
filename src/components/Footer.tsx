import { Wind } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card py-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-heading text-sm font-semibold text-muted-foreground">
          <Wind className="h-4 w-4" />
          AirSense © {new Date().getFullYear()}
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link to="/input" className="hover:text-foreground transition-colors">Analyze</Link>
          <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
        </div>
      </div>
    </footer>
  );
}
