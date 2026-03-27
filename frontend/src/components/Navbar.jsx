import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gsite-bg/80 backdrop-blur-md border-b border-gsite-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gsite-accent rounded-lg flex items-center justify-center font-display font-bold text-white text-sm">
            G
          </div>
          <span className="font-display font-bold text-xl tracking-wide text-white">
            G-SITE
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link
            to="/"
            className="text-gsite-muted hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            to="/tournaments"
            className="text-gsite-muted hover:text-white transition-colors"
          >
            Tournaments
          </Link>
          <div className="flex items-center gap-2 text-gsite-cyan">
            <span className="w-2 h-2 bg-gsite-cyan rounded-full pulse-live" />
            <span className="text-xs uppercase tracking-widest">Live</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
