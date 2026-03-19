import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, Menu, UserCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useLogoUrl } from "../../hooks/useLogoStore";
import { useUserAuth } from "../../hooks/useUserAuth";
import { AccountModal } from "../AccountModal";

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
  const [accountOpen, setAccountOpen] = useState(false);
  const logoUrl = useLogoUrl();
  const { user, logout } = useUserAuth();

  const handleNav = (id: string) => {
    onNavigate(id);
    setMenuOpen(false);
  };

  const firstLetter = user?.name?.[0]?.toUpperCase() ?? "?";
  const firstName = user?.name?.split(" ")[0] ?? "";

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

          {/* ── Right side: Account + mobile hamburger ── */}
          <div className="flex items-center gap-2">
            {/* Account button (desktop) */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors text-sm font-600 text-primary"
                    data-ocid="nav.account.toggle"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-800">
                      {firstLetter}
                    </span>
                    <span className="max-w-[80px] truncate">{firstName}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  data-ocid="nav.account.dropdown_menu"
                >
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                    data-ocid="nav.account.logout.button"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                type="button"
                onClick={() => setAccountOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-600 text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
                data-ocid="nav.signin.button"
              >
                <UserCircle className="w-4 h-4" />
                Sign In
              </button>
            )}

            {/* Mobile hamburger */}
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
            {/* Mobile account row */}
            <div className="px-4 pb-3">
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-[12px] font-600 text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                  data-ocid="nav.mobile.logout.button"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out ({firstName})
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setAccountOpen(true);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-[12px] font-600 text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                  data-ocid="nav.mobile.signin.button"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In / Register
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Account Modal */}
      <AccountModal open={accountOpen} onOpenChange={setAccountOpen} />
    </header>
  );
}
