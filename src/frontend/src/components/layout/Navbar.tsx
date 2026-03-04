import { Menu, Shield, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useLogoUrl } from "../../hooks/useLogoStore";

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const NAV_LINKS = [
  { id: "home", label: "Home" },
  { id: "influencers", label: "Influencers" },
  { id: "cricket", label: "Cricket" },
  { id: "sports", label: "Sports" },
  { id: "internationalnews", label: "International" },
  { id: "nationalnews", label: "National" },
  { id: "incidents", label: "Incidents" },
];

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const logoUrl = useLogoUrl();

  const handleNav = (id: string) => {
    onNavigate(id);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[60px]">
          {/* ── Logo ── */}
          <button
            type="button"
            onClick={() => handleNav("home")}
            className="flex items-center gap-2 group flex-shrink-0"
            data-ocid="nav.home.link"
          >
            <img
              src={logoUrl}
              alt="CricFluence"
              className="h-9 w-auto object-contain"
            />
          </button>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  type="button"
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  data-ocid={`nav.${link.id}.link`}
                  className={`relative px-3 py-1.5 text-[12px] font-600 tracking-wide transition-all duration-200 ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                  {/* Active underline */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-cricket-green"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* ── Admin Link (desktop only) ── */}
          <button
            type="button"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-600 text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all duration-200 border border-transparent hover:border-border/60"
            data-ocid="nav.admin.link"
            onClick={() => {
              window.location.hash = "#/admin";
            }}
          >
            <Shield className="w-3.5 h-3.5" />
            Admin
          </button>

          {/* ── Mobile hamburger ── */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            data-ocid="nav.menu.toggle"
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-border/60 bg-card/95 backdrop-blur-xl"
          >
            <nav className="grid grid-cols-2 gap-1 px-4 py-3">
              {NAV_LINKS.map((link) => {
                const isActive = currentPage === link.id;
                return (
                  <button
                    type="button"
                    key={link.id}
                    onClick={() => handleNav(link.id)}
                    data-ocid={`nav.mobile.${link.id}.link`}
                    className={`flex items-center w-full px-3 py-2.5 rounded-lg text-[12px] font-600 text-left transition-colors ${
                      isActive
                        ? "text-foreground bg-secondary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                  >
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cricket-green mr-2.5 flex-shrink-0" />
                    )}
                    {!isActive && (
                      <span className="w-1.5 h-1.5 mr-2.5 flex-shrink-0" />
                    )}
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
