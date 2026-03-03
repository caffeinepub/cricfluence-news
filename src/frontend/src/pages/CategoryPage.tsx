import { Star, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { ArticleCard } from "../components/ArticleCard";
import { ArticleSkeleton } from "../components/ArticleSkeleton";
import { useArticlesByCategory } from "../hooks/useQueries";

interface CategoryPageProps {
  category: "Cricket" | "Influencers";
  onNavigate: (page: string, articleId?: bigint) => void;
}

const CONFIG = {
  Cricket: {
    icon: Trophy,
    color: "text-cricket-green",
    borderColor: "border-cricket-green",
    bgColor: "bg-cricket-green/10",
    accentColor: "bg-cricket-green",
    description:
      "Ball-by-ball coverage, match previews, player spotlights, and in-depth analyses from the world of cricket.",
    heroBg: "url('/assets/generated/cricket-featured.dim_800x500.jpg')",
  },
  Influencers: {
    icon: Star,
    color: "text-influencer-amber",
    borderColor: "border-influencer-amber",
    bgColor: "bg-influencer-amber/10",
    accentColor: "bg-influencer-amber",
    description:
      "Viral moments, brand deals, creator gossip, and the latest from social media's biggest stars.",
    heroBg: "url('/assets/generated/influencer-featured.dim_800x500.jpg')",
  },
};

export function CategoryPage({ category, onNavigate }: CategoryPageProps) {
  const {
    data: articles,
    isLoading,
    isError,
  } = useArticlesByCategory(category);
  const cfg = CONFIG[category];
  const Icon = cfg.icon;

  const sorted = articles
    ? [...articles].sort(
        (a, b) =>
          new Date(b.publishedDate).getTime() -
          new Date(a.publishedDate).getTime(),
      )
    : [];

  return (
    <main className="min-h-screen" data-ocid={`${category.toLowerCase()}.page`}>
      {/* Category Hero */}
      <section className="relative overflow-hidden h-48 md:h-64">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: cfg.heroBg }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent" />

        <div className="relative z-10 h-full flex flex-col justify-end pb-8 px-4 sm:px-6 container max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-2"
          >
            <div className={`flex items-center gap-2 ${cfg.color}`}>
              <Icon className="w-5 h-5" />
              <span className="text-xs font-mono font-600 uppercase tracking-widest">
                {category}
              </span>
            </div>
            <h1 className="font-display font-800 text-3xl md:text-4xl tracking-tight">
              {category} News
            </h1>
            <p className="text-muted-foreground text-sm max-w-lg">
              {cfg.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Articles */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Stats bar */}
        {!isLoading && articles && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-8 ${cfg.bgColor} border ${cfg.borderColor}`}
          >
            <div
              className={`w-2 h-2 rounded-full ${cfg.accentColor} animate-pulse`}
            />
            <span className="text-sm font-medium">
              {articles.length} {articles.length === 1 ? "article" : "articles"}{" "}
              in {category}
            </span>
          </motion.div>
        )}

        {isError && (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid={`${category.toLowerCase()}.error_state`}
          >
            <p className="text-destructive font-medium mb-2">
              Failed to load {category} articles
            </p>
            <p className="text-muted-foreground text-sm">
              Please try refreshing the page.
            </p>
          </div>
        )}

        {isLoading && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid={`${category.toLowerCase()}.loading_state`}
          >
            {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
              <ArticleSkeleton key={k} />
            ))}
          </div>
        )}

        {!isLoading && !isError && sorted.length > 0 && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid={`${category.toLowerCase()}.list`}
          >
            {sorted.map((article, i) => (
              <ArticleCard
                key={article.id.toString()}
                article={article}
                onNavigate={onNavigate}
                index={i}
              />
            ))}
          </div>
        )}

        {!isLoading && !isError && sorted.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-24 text-center"
            data-ocid={`${category.toLowerCase()}.empty_state`}
          >
            <div
              className={`w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center mb-4 ${cfg.borderColor}`}
            >
              <Icon className={`w-6 h-6 ${cfg.color}`} />
            </div>
            <h3 className="font-display font-700 text-xl mb-2">
              No {category} articles yet
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Be the first to publish a {category} story from the Admin panel.
            </p>
            <button
              type="button"
              onClick={() => onNavigate("admin")}
              className="mt-4 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              data-ocid={`${category.toLowerCase()}.admin.button`}
            >
              Go to Admin
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
