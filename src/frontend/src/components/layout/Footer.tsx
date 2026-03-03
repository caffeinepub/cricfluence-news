import { Heart, Zap } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname = window.location.hostname;

  return (
    <footer className="mt-auto border-t border-border bg-card/50">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-cricket-green flex items-center justify-center">
              <Zap className="w-3 h-3 text-card" fill="currentColor" />
            </div>
            <span className="font-display font-700 text-sm">
              <span className="text-cricket-green">Cric</span>
              <span className="text-influencer-amber">Fluence</span>
              <span className="text-muted-foreground"> News</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span>Your source for cricket & influencer news</span>
          </div>

          {/* Attribution */}
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            © {year}. Built with{" "}
            <Heart className="w-3 h-3 text-hot-coral fill-current inline" />{" "}
            using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cricket-green hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
