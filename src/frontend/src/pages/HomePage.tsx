import { Rss, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import type { Article } from "../backend.d";
import { Position } from "../backend.d";
import { ArticleCard } from "../components/ArticleCard";
import { ArticleSkeleton } from "../components/ArticleSkeleton";
import { SponsorBanner } from "../components/SponsorBanner";
import { useActor } from "../hooks/useActor";
import { useAllArticles, useSeedData } from "../hooks/useQueries";

interface HomePageProps {
  onNavigate: (page: string, articleId?: bigint) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { actor } = useActor();
  const { data: articles, isLoading, isError, refetch } = useAllArticles();
  const seedMutation = useSeedData();
  const seededRef = useRef(false);
  const actorReadyRef = useRef(false);

  // When actor becomes available for the first time, force a refetch
  useEffect(() => {
    if (actor && !actorReadyRef.current) {
      actorReadyRef.current = true;
      refetch();
    }
  }, [actor, refetch]);

  // Seed data on first load if empty (only after actor is confirmed ready)
  useEffect(() => {
    if (
      actor &&
      !isLoading &&
      articles !== undefined &&
      articles.length === 0 &&
      !seededRef.current &&
      !seedMutation.isPending
    ) {
      seededRef.current = true;
      seedMutation.mutate();
    }
  }, [actor, isLoading, articles, seedMutation]);

  const sortedArticles = articles
    ? [...articles].sort(
        (a, b) =>
          new Date(b.publishedDate).getTime() -
          new Date(a.publishedDate).getTime(),
      )
    : [];

  const featured: Article | undefined = sortedArticles[0];
  const rest = sortedArticles.slice(1);

  return (
    <main className="min-h-screen" data-ocid="home.page">
      {/* Hero Banner */}
      <section className="relative overflow-hidden" data-ocid="home.section">
        <div
          className="relative h-56 md:h-72 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/assets/generated/cricfluence-hero.dim_1600x600.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

          <div className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-6 container max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Rss className="w-4 h-4 text-cricket-green" />
                <span className="text-xs font-mono font-600 text-cricket-green uppercase tracking-widest">
                  Live News Feed
                </span>
              </div>
              <h1 className="font-display font-800 text-3xl md:text-5xl leading-none tracking-tight mb-2">
                <span className="text-foreground">Cricket & </span>
                <span className="text-cricket-green">Influencer</span>
                <br />
                <span className="text-foreground">News Hub</span>
              </h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-md">
                The latest buzz from the cricket world and your favorite social
                media influencers.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Top Sponsor Banner */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <SponsorBanner position={Position.top} />
      </div>

      {/* Content */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {isError && (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="home.error_state"
          >
            <p className="text-destructive font-medium mb-2">
              Failed to load articles
            </p>
            <p className="text-muted-foreground text-sm">
              Please try refreshing the page.
            </p>
          </div>
        )}

        {(isLoading || seedMutation.isPending) && (
          <div data-ocid="home.loading_state">
            <div className="mb-8">
              <ArticleSkeleton featured />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
                <ArticleSkeleton key={k} />
              ))}
            </div>
          </div>
        )}

        {!isLoading && !seedMutation.isPending && !isError && (
          <>
            {/* Featured Article */}
            {featured && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4 text-influencer-amber" />
                    <h2 className="font-display font-800 text-base uppercase tracking-widest text-foreground">
                      Top Story
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground tracking-wider uppercase">
                    Latest
                  </span>
                </div>
                <ArticleCard
                  article={featured}
                  onNavigate={onNavigate}
                  index={0}
                  featured
                />
              </section>
            )}

            {/* Mid Sponsor Banner */}
            <SponsorBanner position={Position.mid} />

            {/* All Articles Grid */}
            {rest.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <Rss className="w-4 h-4 text-cricket-green" />
                    <h2 className="font-display font-800 text-base uppercase tracking-widest text-foreground">
                      More Stories
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground tracking-wider uppercase">
                    {rest.length} article{rest.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  data-ocid="articles.list"
                >
                  {rest.map((article, i) => (
                    <ArticleCard
                      key={article.id.toString()}
                      article={article}
                      onNavigate={onNavigate}
                      index={i + 1}
                    />
                  ))}
                </div>
              </section>
            )}

            {!featured && (
              <div
                className="flex flex-col items-center justify-center py-24 text-center"
                data-ocid="articles.empty_state"
              >
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center mb-4">
                  <Rss className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-display font-700 text-xl mb-2">
                  No articles yet
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Head to the Admin panel to start publishing your first story.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate("admin")}
                  className="mt-4 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  data-ocid="home.admin.button"
                >
                  Go to Admin
                </button>
              </div>
            )}
          </>
        )}

        {/* Bottom Sponsor Banner */}
        <SponsorBanner position={Position.bottom} />
      </div>
    </main>
  );
}
