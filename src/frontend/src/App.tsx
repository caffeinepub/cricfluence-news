import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { Footer } from "./components/layout/Footer";
import { Navbar } from "./components/layout/Navbar";
import { useAdminAuth } from "./hooks/useAdminAuth";
import { useLogoUrl } from "./hooks/useLogoStore";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminPage } from "./pages/AdminPage";
import { ArticlePage } from "./pages/ArticlePage";
import { CategoryPage } from "./pages/CategoryPage";
import { HomePage } from "./pages/HomePage";

type Page =
  | "home"
  | "influencers"
  | "cricket"
  | "sports"
  | "internationalnews"
  | "nationalnews"
  | "incidents"
  | "article";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [currentArticleId, setCurrentArticleId] = useState<bigint | null>(null);
  const [hash, setHash] = useState(() => window.location.hash);
  const { authed, setAuthed, logout } = useAdminAuth();
  const logoUrl = useLogoUrl();

  // Track hash changes
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const handleNavigate = (page: string, articleId?: bigint) => {
    const validPage = page as Page;
    setCurrentPage(validPage);
    if (articleId !== undefined) {
      setCurrentArticleId(articleId);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={handleNavigate} />;
      case "influencers":
        return (
          <CategoryPage category="Influencers" onNavigate={handleNavigate} />
        );
      case "cricket":
        return <CategoryPage category="Cricket" onNavigate={handleNavigate} />;
      case "sports":
        return <CategoryPage category="Sports" onNavigate={handleNavigate} />;
      case "internationalnews":
        return (
          <CategoryPage
            category="International News"
            onNavigate={handleNavigate}
          />
        );
      case "nationalnews":
        return (
          <CategoryPage category="National News" onNavigate={handleNavigate} />
        );
      case "incidents":
        return (
          <CategoryPage category="Incidents" onNavigate={handleNavigate} />
        );
      case "article":
        if (currentArticleId !== null) {
          return (
            <ArticlePage
              articleId={currentArticleId}
              onNavigate={handleNavigate}
            />
          );
        }
        return <HomePage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  // Navbar doesn't show "article" as active; show parent category instead
  const navPage = currentPage === "article" ? "home" : currentPage;

  // Admin route branch — standalone, no Navbar/Footer
  if (hash === "#/admin") {
    if (authed) {
      return (
        <>
          <div className="min-h-screen bg-background">
            {/* Logout bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border/60">
              <div className="flex items-center gap-2">
                <img
                  src={logoUrl}
                  alt="CricFluence"
                  className="h-8 w-auto object-contain"
                />
                <span className="text-[11px] font-600 text-muted-foreground tracking-[0.1em] uppercase">
                  Admin
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  window.location.hash = "";
                }}
                className="text-[12px] font-600 text-muted-foreground hover:text-foreground border border-border/60 rounded-md px-3 py-1 transition-colors"
                data-ocid="admin.logout.button"
              >
                Logout
              </button>
            </div>
            <AdminPage />
          </div>
          <Toaster position="bottom-right" richColors />
        </>
      );
    }

    return (
      <>
        <AdminLoginPage onLogin={() => setAuthed(true)} />
        <Toaster position="bottom-right" richColors />
      </>
    );
  }

  // Public routing
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar currentPage={navPage} onNavigate={handleNavigate} />
      <div className="flex-1">{renderPage()}</div>
      <Footer />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
