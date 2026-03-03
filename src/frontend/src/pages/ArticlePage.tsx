import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Tag, User } from "lucide-react";
import { motion } from "motion/react";
import { useArticleById } from "../hooks/useQueries";

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

export function ArticlePage({ articleId, onNavigate }: ArticlePageProps) {
  const { data: article, isLoading, isError } = useArticleById(articleId);

  const isCricket = article?.category.toLowerCase() === "cricket";
  const fallbackImage = isCricket
    ? "/assets/generated/cricket-featured.dim_800x500.jpg"
    : "/assets/generated/influencer-featured.dim_800x500.jpg";

  const handleBack = () => {
    if (article) {
      onNavigate(
        article.category.toLowerCase() === "cricket"
          ? "cricket"
          : "influencers",
      );
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

  const categoryColor = isCricket
    ? "text-cricket-green"
    : "text-influencer-amber";
  const categoryBg = isCricket
    ? "bg-cricket-green/15 border-cricket-green/30 text-cricket-green"
    : "bg-influencer-amber/15 border-influencer-amber/30 text-influencer-amber";

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
        </motion.div>
      </div>
    </main>
  );
}
