import { AlertTriangle, Globe, MapPin, Star, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { Position } from "../backend.d";
import { ArticleCard } from "../components/ArticleCard";
import { ArticleSkeleton } from "../components/ArticleSkeleton";
import { SponsorBanner } from "../components/SponsorBanner";
import { useArticlesByCategory } from "../hooks/useQueries";

type CategoryName =
  | "Cricket"
  | "Influencers"
  | "Sports"
  | "International News"
  | "National News"
  | "Incidents";

interface CategoryPageProps {
  category: string;
  onNavigate: (page: string, articleId?: bigint) => void;
}

const CONFIG: Record<
  CategoryName,
  {
    icon: React.ElementType;
    color: string;
    borderColor: string;
    bgColor: string;
    accentColor: string;
    description: string;
    heroBg: string;
  }
> = {
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
  Sports: {
    icon: Trophy,
    color: "text-sky-400",
    borderColor: "border-sky-400",
    bgColor: "bg-sky-400/10",
    accentColor: "bg-sky-400",
    description:
      "Comprehensive sports coverage — football, tennis, basketball, and every major sporting event worldwide.",
    heroBg: "url('/assets/generated/cricket-featured.dim_800x500.jpg')",
  },
  "International News": {
    icon: Globe,
    color: "text-violet-400",
    borderColor: "border-violet-400",
    bgColor: "bg-violet-400/10",
    accentColor: "bg-violet-400",
    description:
      "Breaking global stories, geopolitical developments, and events shaping the world from every continent.",
    heroBg: "url('/assets/generated/influencer-featured.dim_800x500.jpg')",
  },
  "National News": {
    icon: MapPin,
    color: "text-teal-400",
    borderColor: "border-teal-400",
    bgColor: "bg-teal-400/10",
    accentColor: "bg-teal-400",
    description:
      "Domestic updates, government policies, local events, and the stories that matter most within the country.",
    heroBg: "url('/assets/generated/cricket-featured.dim_800x500.jpg')",
  },
  Incidents: {
    icon: AlertTriangle,
    color: "text-red-400",
    borderColor: "border-red-400",
    bgColor: "bg-red-400/10",
    accentColor: "bg-red-400",
    description:
      "Urgent reports on accidents, emergencies, disasters, and breaking incidents as they unfold.",
    heroBg: "url('/assets/generated/influencer-featured.dim_800x500.jpg')",
  },
};

const DEFAULT_CONFIG = CONFIG.Cricket;

export function CategoryPage({ category, onNavigate }: CategoryPageProps) {
  const {
    data: articles,
    isLoading,
    isError,
  } = useArticlesByCategory(category);

  // Normalize category key to look up config
  const normalizedKey = ((): CategoryName => {
    const lower = category.toLowerCase().replace(/\s+/g, "");
    switch (lower) {
      case "cricket":
        return "Cricket";
      case "influencers":
        return "Influencers";
      case "sports":
        return "Sports";
      case "internationalnews":
        return "International News";
      case "nationalnews":
        return "National News";
      case "incidents":
        return "Incidents";
      default:
        return "Cricket";
    }
  })();

  const cfg = CONFIG[normalizedKey] ?? DEFAULT_CONFIG;
  const Icon = cfg.icon;
  const pageKey = category.toLowerCase().replace(/\s+/g, "");

  const sorted = articles
    ? [...articles].sort(
        (a, b) =>
          new Date(b.publishedDate).getTime() -
          new Date(a.publishedDate).getTime(),
      )
    : [];

  return (
    <main className="min-h-screen" data-ocid={`${pageKey}.page`}>
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
                {normalizedKey}
              </span>
            </div>
            <h1 className="font-display font-800 text-3xl md:text-4xl tracking-tight">
              {normalizedKey} News
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
              in {normalizedKey}
            </span>
          </motion.div>
        )}

        {isError && (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid={`${pageKey}.error_state`}
          >
            <p className="text-destructive font-medium mb-2">
              Failed to load {normalizedKey} articles
            </p>
            <p className="text-muted-foreground text-sm">
              Please try refreshing the page.
            </p>
          </div>
        )}

        {isLoading && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid={`${pageKey}.loading_state`}
          >
            {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
              <ArticleSkeleton key={k} />
            ))}
          </div>
        )}

        {!isLoading && !isError && sorted.length > 0 && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid={`${pageKey}.list`}
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
            data-ocid={`${pageKey}.empty_state`}
          >
            <div
              className={`w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center mb-4 ${cfg.borderColor}`}
            >
              <Icon className={`w-6 h-6 ${cfg.color}`} />
            </div>
            <h3 className="font-display font-700 text-xl mb-2">
              No {normalizedKey} articles yet
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Be the first to publish a {normalizedKey} story from the Admin
              panel.
            </p>
          </div>
        )}

        {/* Bottom Sponsor Banner */}
        <SponsorBanner position={Position.bottom} />
      </div>
    </main>
  );
}
