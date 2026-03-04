import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Eye, Heart, Tag, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { CommentsSection } from "../components/CommentsSection";
import {
  useArticleById,
  useLikeArticle,
  useRecordView,
} from "../hooks/useQueries";

interface ArticlePageProps {
  articleId: bigint;
  onNavigate: (page: string, articleId?: bigint) => void;
}

const SKELETON_WIDTHS = [
  "w-full",
  "w-full",
  "w-full",
  "w-3/4",
  "w-full",
  "w-full",
  "w-5/6",
  "w-3/4",
];

const CATEGORY_COLOR_MAP: Record<string, string> = {
  cricket: "text-cricket-green",
  influencers: "text-influencer-amber",
  sports: "text-sky-400",
  internationalnews: "text-violet-400",
  nationalnews: "text-teal-400",
  incidents: "text-red-400",
};

const CATEGORY_BG_MAP: Record<string, string> = {
  cricket: "bg-cricket-green/15 border-cricket-green/30 text-cricket-green",
  influencers:
    "bg-influencer-amber/15 border-influencer-amber/30 text-influencer-amber",
  sports: "bg-sky-400/15 border-sky-400/30 text-sky-400",
  internationalnews: "bg-violet-400/15 border-violet-400/30 text-violet-400",
  nationalnews: "bg-teal-400/15 border-teal-400/30 text-teal-400",
  incidents: "bg-red-400/15 border-red-400/30 text-red-400",
};

function getCategoryNav(category: string): string {
  const key = category.toLowerCase().replace(/\s+/g, "");
  switch (key) {
    case "cricket":
      return "cricket";
    case "influencers":
      return "influencers";
    case "sports":
      return "sports";
    case "internationalnews":
      return "internationalnews";
    case "nationalnews":
      return "nationalnews";
    case "incidents":
      return "incidents";
    default:
      return "home";
  }
}

export function ArticlePage({ articleId, onNavigate }: ArticlePageProps) {
  const { data: article, isLoading, isError } = useArticleById(articleId);
  const recordView = useRecordView();
  const likeMutation = useLikeArticle();
  const viewRecorded = useRef(false);

  // Record view once on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: recordView.mutate is stable; intentionally excluded
  useEffect(() => {
    if (!viewRecorded.current && articleId) {
      viewRecorded.current = true;
      recordView.mutate(articleId);
    }
  }, [articleId]);

  const catKey = article?.category.toLowerCase().replace(/\s+/g, "") ?? "";
  const fallbackImage =
    catKey === "cricket"
      ? "/assets/generated/cricket-featured.dim_800x500.jpg"
      : "/assets/generated/influencer-featured.dim_800x500.jpg";

  const handleBack = () => {
    if (article) {
      onNavigate(getCategoryNav(article.category));
    } else {
      onNavigate("home");
    }
  };

  if (isError) {
    return (
      <main
        className="min-h-screen container max-w-4xl mx-auto px-4 sm:px-6 py-12"
        data-ocid="article.page"
      >
        <div
          className="flex flex-col items-center justify-center py-24 text-center"
          data-ocid="article.error_state"
        >
          <p className="text-destructive font-medium mb-4">Article not found</p>
          <Button
            onClick={() => onNavigate("home")}
            variant="outline"
            data-ocid="article.back.button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </div>
      </main>
    );
  }

  if (isLoading || !article) {
    return (
      <main className="min-h-screen" data-ocid="article.loading_state">
        <Skeleton className="w-full h-72 md:h-96" />
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="space-y-3 mt-8">
            {SKELETON_WIDTHS.map((w, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static array for skeletons
              <Skeleton key={i} className={`h-4 ${w}`} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  const categoryColor = CATEGORY_COLOR_MAP[catKey] ?? "text-muted-foreground";
  const categoryBg =
    CATEGORY_BG_MAP[catKey] ??
    "bg-muted/15 border-border text-muted-foreground";

  const likes = Number(article.likes ?? 0);
  const views = Number(article.views ?? 0);

  return (
    <main className="min-h-screen" data-ocid="article.page">
      {/* Hero Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full h-64 md:h-[420px] overflow-hidden"
      >
        <img
          src={article.imageUrl || fallbackImage}
          alt={article.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </motion.div>

      {/* Article Content */}
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-10 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-xl border border-border p-6 md:p-10 shadow-card"
        >
          {/* Back */}
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            data-ocid="article.back.button"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Category badge */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-xs font-mono font-600 tracking-wider uppercase border ${categoryBg}`}
            >
              <Tag className="w-3 h-3" />
              {article.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display font-800 text-2xl md:text-4xl leading-tight text-foreground mb-6">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 mb-8 border-b border-border">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span className={`font-medium ${categoryColor}`}>
                {article.author}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {article.publishedDate}
            </span>
            {/* View count */}
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>
                {views} {views === 1 ? "view" : "views"}
              </span>
            </span>
            {/* Like button in meta */}
            <button
              type="button"
              onClick={() => likeMutation.mutate(article.id)}
              disabled={likeMutation.isPending}
              className="flex items-center gap-1.5 hover:text-red-400 transition-colors duration-150 group/like"
              data-ocid="article.like.button"
            >
              <Heart className="w-4 h-4 group-hover/like:fill-red-400 group-hover/like:text-red-400 transition-all duration-150" />
              <span>
                {likes} {likes === 1 ? "like" : "likes"}
              </span>
            </button>
          </div>

          {/* Summary (lead paragraph) */}
          <p className="text-foreground/80 text-lg leading-relaxed mb-8 font-400 italic border-l-4 border-primary pl-4">
            {article.summary}
          </p>

          {/* Content */}
          <div className="prose prose-invert prose-sm md:prose-base max-w-none prose-headings:font-display prose-p:text-muted-foreground prose-p:leading-relaxed">
            {article.content
              .split("\n")
              .filter((para) => para.trim())
              .map((para) => (
                <p
                  key={para.slice(0, 50)}
                  className="text-muted-foreground leading-relaxed mb-4"
                >
                  {para}
                </p>
              ))}
          </div>

          {/* Comments */}
          <CommentsSection articleId={article.id} />
        </motion.div>
      </div>
    </main>
  );
}
