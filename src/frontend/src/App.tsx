import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { Footer } from "./components/layout/Footer";
import { Navbar } from "./components/layout/Navbar";
import { AdminPage } from "./pages/AdminPage";
import { ArticlePage } from "./pages/ArticlePage";
import { CategoryPage } from "./pages/CategoryPage";
import { HomePage } from "./pages/HomePage";

type Page = "home" | "influencers" | "cricket" | "article" | "admin";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [currentArticleId, setCurrentArticleId] = useState<bigint | null>(null);

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
      case "admin":
        return <AdminPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  // Navbar doesn't show "article" as active; show parent category instead
  const navPage = currentPage === "article" ? "home" : currentPage;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar currentPage={navPage} onNavigate={handleNavigate} />
      <div className="flex-1">{renderPage()}</div>
      <Footer />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
