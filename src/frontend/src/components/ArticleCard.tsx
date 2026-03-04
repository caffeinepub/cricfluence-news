import { ArrowUpRight, Calendar, Eye, Heart, User } from "lucide-react";
import { motion } from "motion/react";
import type { Article } from "../backend.d";
import { useLikeArticle } from "../hooks/useQueries";

interface ArticleCardProps {
  article: Article;
  onNavigate: (page: string, articleId?: bigint) => void;
  index?: number;
  featured?: boolean;
}

const CATEGORY_COLOR: Record<string, string> = {
  cricket: "text-cricket-green",
  influencers: "text-influencer-amber",
  sports: "text-sky-400",
  internationalnews: "text-violet-400",
  nationalnews: "text-teal-400",
  incidents: "text-red-400",
};

function CategoryPill({ category }: { category: string }) {
  const key = category.toLowerCase().replace(/\s+/g, "");
  const colorClass = CATEGORY_COLOR[key] ?? "text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-mono font-700 tracking-widest uppercase ${colorClass}`}
    >
      {category}
    </span>
  );
}

export function ArticleCard({
  article,
  onNavigate,
  index = 0,
  featured = false,
}: ArticleCardProps) {
  const catKey = article.category.toLowerCase().replace(/\s+/g, "");
  const isCricket = catKey === "cricket";
  const fallbackImage = isCricket
    ? "/assets/generated/cricket-featured.dim_800x500.jpg"
    : "/assets/generated/influencer-featured.dim_800x500.jpg";

  const ACCENT_MAP: Record<string, string> = {
    cricket: "bg-cricket-green",
    influencers: "bg-influencer-amber",
    sports: "bg-sky-400",
    internationalnews: "bg-violet-400",
    nationalnews: "bg-teal-400",
    incidents: "bg-red-400",
  };
  const accentClass = ACCENT_MAP[catKey] ?? "bg-primary";

  const likeMutation = useLikeArticle();
  const likes = Number(article.likes ?? 0);
  const views = Number(article.views ?? 0);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    likeMutation.mutate(article.id);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -4 }}
      onClick={() => onNavigate("article", article.id)}
      className={`group relative bg-card overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${
        featured
          ? "rounded-xl md:grid md:grid-cols-[1fr_1fr] border border-border hover:border-primary/40"
          : "rounded-xl border border-border hover:border-primary/30 flex flex-col"
      }`}
      data-ocid={`articles.item.${index + 1}`}
    >
      {/* Left accent stripe */}
      {!featured && (
        <div
          className={`absolute left-0 top-0 bottom-0 w-0.5 ${accentClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        />
      )}

      {/* Image */}
      <div
        className={`relative overflow-hidden bg-secondary flex-shrink-0 ${
          featured ? "min-h-[260px] md:h-full" : "h-52"
        }`}
      >
        <img
          src={article.imageUrl || fallbackImage}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
          loading="lazy"
        />
        {/* Gradient overlay — stronger at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-card/10 to-transparent" />

        {featured && (
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-[11px] font-mono font-700 tracking-widest uppercase text-cricket-green border border-cricket-green/30">
              ★ Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className={`flex flex-col ${featured ? "p-6 md:p-8 justify-center" : "p-5"}`}
      >
        {/* Category + date row */}
        <div className="flex items-center justify-between mb-3">
          <CategoryPill category={article.category} />
          <span className="text-[11px] text-muted-foreground font-mono">
            {article.publishedDate}
          </span>
        </div>

        {/* Title — the hero element */}
        <h3
          className={`font-display font-800 leading-[1.2] tracking-tight text-foreground group-hover:text-primary transition-colors duration-200 mb-3 ${
            featured ? "text-2xl md:text-[1.75rem]" : "text-[1.1rem]"
          }`}
        >
          {article.title}
        </h3>

        {/* Summary */}
        <p
          className={`text-muted-foreground leading-relaxed ${
            featured ? "text-sm line-clamp-3 mb-6" : "text-sm line-clamp-2 mb-4"
          }`}
        >
          {article.summary}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[100px]">{article.author}</span>
          </span>

          {/* Stats + like button */}
          <div className="flex items-center gap-3">
            {/* View count */}
            <span className="flex items-center gap-1 text-xs text-muted-foreground/70">
              <Eye className="w-3 h-3" />
              <span>{views}</span>
            </span>

            {/* Like button */}
            <button
              type="button"
              onClick={handleLike}
              disabled={likeMutation.isPending}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-400 transition-colors duration-150 group/like"
              data-ocid={`articles.like.button.${index + 1}`}
              title="Like this article"
            >
              <Heart className="w-3.5 h-3.5 transition-all duration-150 group-hover/like:fill-red-400 group-hover/like:text-red-400" />
              <span>{likes}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
