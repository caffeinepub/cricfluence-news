import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  CheckSquare,
  Download,
  ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Rss,
  Square,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateArticle } from "../hooks/useQueries";
import { useSavedFeeds } from "../hooks/useSavedFeeds";
import { type FetchedItem, fetchRssFeed } from "../utils/rssFetcher";

// ── Category Options ──────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { value: "Cricket", label: "Cricket" },
  { value: "Influencers", label: "Influencers" },
  { value: "Sports", label: "Sports" },
  { value: "InternationalNews", label: "International News" },
  { value: "NationalNews", label: "National News" },
  { value: "Incidents", label: "Incidents" },
];

const CATEGORY_BADGE_CLASS: Record<string, string> = {
  Cricket: "bg-cricket-green/15 text-cricket-green border-cricket-green/30",
  Influencers:
    "bg-influencer-amber/15 text-influencer-amber border-influencer-amber/30",
  Sports: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  InternationalNews: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  NationalNews: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  Incidents: "bg-red-500/15 text-red-400 border-red-500/30",
};

// ── Preview Item state ────────────────────────────────────────────

interface PreviewItem extends FetchedItem {
  _id: string;
  selected: boolean;
  categoryOverride: string;
}

// ── AutoFetchTab ──────────────────────────────────────────────────

export function AutoFetchTab() {
  const { feeds, addFeed, removeFeed } = useSavedFeeds();
  const createArticle = useCreateArticle();

  // Add feed form state
  const [newSourceName, setNewSourceName] = useState("");
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [formErrors, setFormErrors] = useState<{
    sourceName?: string;
    feedUrl?: string;
  }>({});

  // Fetch state
  const [isFetching, setIsFetching] = useState(false);
  const [fetchErrors, setFetchErrors] = useState<string[]>([]);
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  // Import state
  const [isImporting, setIsImporting] = useState(false);

  // ── Feed management ───────────────────────────────────────────

  const handleAddFeed = () => {
    const errors: { sourceName?: string; feedUrl?: string } = {};
    if (!newSourceName.trim()) errors.sourceName = "Source name is required";
    if (!newFeedUrl.trim()) errors.feedUrl = "Feed URL is required";
    else if (!newFeedUrl.trim().startsWith("http"))
      errors.feedUrl = "URL must start with http or https";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    addFeed(newFeedUrl.trim(), newSourceName.trim());
    setNewSourceName("");
    setNewFeedUrl("");
    setFormErrors({});
    toast.success(`Feed "${newSourceName.trim()}" added`);
  };

  const handleRemoveFeed = (id: string, name: string) => {
    removeFeed(id);
    toast.success(`Feed "${name}" removed`);
  };

  // ── Fetch all feeds ───────────────────────────────────────────

  const handleFetchAll = async () => {
    if (feeds.length === 0) {
      toast.error("Add at least one RSS feed first");
      return;
    }
    setIsFetching(true);
    setFetchErrors([]);
    setPreviewItems([]);
    setHasFetched(false);

    const results = await Promise.allSettled(
      feeds.map((f) => fetchRssFeed(f.url, f.sourceName)),
    );

    const errors: string[] = [];
    const items: PreviewItem[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === "rejected") {
        const errMsg =
          result.reason instanceof Error
            ? result.reason.message
            : `Failed to fetch "${feeds[i].sourceName}"`;
        errors.push(errMsg);
      } else {
        for (const item of result.value) {
          items.push({
            ...item,
            _id: crypto.randomUUID(),
            selected: true,
            categoryOverride: item.detectedCategory,
          });
        }
      }
    }

    setFetchErrors(errors);
    setPreviewItems(items);
    setHasFetched(true);
    setIsFetching(false);

    if (items.length > 0) {
      toast.success(
        `Fetched ${items.length} article${items.length !== 1 ? "s" : ""}`,
      );
    } else if (errors.length === 0) {
      toast.info("No articles found in the feeds");
    }
  };

  // ── Select / Deselect all ─────────────────────────────────────

  const allSelected =
    previewItems.length > 0 && previewItems.every((i) => i.selected);

  const handleToggleSelectAll = () => {
    setPreviewItems((prev) =>
      prev.map((item) => ({ ...item, selected: !allSelected })),
    );
  };

  const handleToggleItem = (id: string) => {
    setPreviewItems((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, selected: !item.selected } : item,
      ),
    );
  };

  const handleCategoryChange = (id: string, category: string) => {
    setPreviewItems((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, categoryOverride: category } : item,
      ),
    );
  };

  // ── Import selected ───────────────────────────────────────────

  const selectedItems = previewItems.filter((i) => i.selected);

  const handleImport = async () => {
    if (selectedItems.length === 0) {
      toast.error("Select at least one article to import");
      return;
    }
    setIsImporting(true);

    let successCount = 0;
    let errorCount = 0;

    // Import sequentially to avoid overwhelming the backend
    for (const item of selectedItems) {
      try {
        await createArticle.mutateAsync({
          title: item.title,
          category: item.categoryOverride,
          author: `via ${item.sourceName}`,
          publishedDate: item.publishedDate,
          imageUrl: item.imageUrl,
          summary: item.description,
          content: item.description,
        });
        successCount++;
      } catch {
        errorCount++;
      }
    }

    setIsImporting(false);

    if (successCount > 0) {
      toast.success(
        `Imported ${successCount} article${successCount !== 1 ? "s" : ""}${errorCount > 0 ? ` (${errorCount} failed)` : ""}`,
      );
      setPreviewItems([]);
      setHasFetched(false);
    } else {
      toast.error("Import failed. Please try again.");
    }
  };

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="space-y-8" data-ocid="autofetch.section">
      {/* ── Feed Sources section ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Rss className="w-4 h-4 text-cricket-green" />
          <h2 className="font-display font-700 text-lg">RSS Feed Sources</h2>
        </div>
        <p className="text-muted-foreground text-sm mb-5">
          Add RSS feed URLs. The AI will auto-detect article categories and
          import them with one click.
        </p>

        {/* Add feed form */}
        <div className="bg-card border border-border rounded-xl p-5 mb-4">
          <p className="text-sm font-600 text-foreground mb-3">Add New Feed</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 min-w-0 space-y-1">
              <Label
                htmlFor="af-source-name"
                className="text-xs text-muted-foreground"
              >
                Source Name
              </Label>
              <Input
                id="af-source-name"
                value={newSourceName}
                onChange={(e) => {
                  setNewSourceName(e.target.value);
                  setFormErrors((prev) => ({ ...prev, sourceName: undefined }));
                }}
                placeholder="e.g. BBC Sport"
                className={formErrors.sourceName ? "border-destructive" : ""}
                data-ocid="autofetch.source_name.input"
              />
              {formErrors.sourceName && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="autofetch.source_name.error_state"
                >
                  {formErrors.sourceName}
                </p>
              )}
            </div>
            <div className="flex-[2] min-w-0 space-y-1">
              <Label
                htmlFor="af-feed-url"
                className="text-xs text-muted-foreground"
              >
                RSS Feed URL
              </Label>
              <Input
                id="af-feed-url"
                value={newFeedUrl}
                onChange={(e) => {
                  setNewFeedUrl(e.target.value);
                  setFormErrors((prev) => ({ ...prev, feedUrl: undefined }));
                }}
                placeholder="https://feeds.bbci.co.uk/sport/rss.xml"
                className={formErrors.feedUrl ? "border-destructive" : ""}
                data-ocid="autofetch.feed_url.input"
              />
              {formErrors.feedUrl && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="autofetch.feed_url.error_state"
                >
                  {formErrors.feedUrl}
                </p>
              )}
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAddFeed}
                className="flex items-center gap-2 w-full sm:w-auto"
                data-ocid="autofetch.add_feed.button"
              >
                <Plus className="w-4 h-4" />
                Add Feed
              </Button>
            </div>
          </div>
        </div>

        {/* Feed list */}
        {feeds.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-10 text-center bg-card border border-dashed border-border rounded-xl"
            data-ocid="autofetch.feeds.empty_state"
          >
            <Rss className="w-8 h-8 text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground text-sm">
              No RSS feeds added yet. Add a feed URL above to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-2" data-ocid="autofetch.feeds.list">
            <AnimatePresence initial={false}>
              {feeds.map((feed, i) => (
                <motion.div
                  key={feed.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                  data-ocid={`autofetch.feeds.item.${i + 1}`}
                >
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors group">
                    <Rss className="w-3.5 h-3.5 text-cricket-green flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-display font-700 text-sm text-foreground">
                        {feed.sourceName}
                      </span>
                      <span className="text-muted-foreground text-xs ml-2 truncate hidden sm:inline">
                        {feed.url.length > 60
                          ? `${feed.url.slice(0, 60)}…`
                          : feed.url}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveFeed(feed.id, feed.sourceName)}
                      className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive opacity-50 group-hover:opacity-100 transition-opacity"
                      title="Remove feed"
                      data-ocid={`autofetch.feeds.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Fetch & Preview section ── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="font-display font-700 text-lg">
              Fetch &amp; Preview
            </h2>
            <p className="text-muted-foreground text-sm mt-0.5">
              Fetch articles from all saved feeds and select which ones to
              import.
            </p>
          </div>
          <Button
            onClick={handleFetchAll}
            disabled={isFetching || feeds.length === 0}
            className="flex items-center gap-2 self-start sm:self-auto"
            data-ocid="autofetch.fetch_all.button"
          >
            {isFetching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Fetching…
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Fetch All Feeds
              </>
            )}
          </Button>
        </div>

        {/* Loading skeleton */}
        {isFetching && (
          <div
            className="space-y-3"
            data-ocid="autofetch.preview.loading_state"
          >
            {[1, 2, 3, 4].map((k) => (
              <div
                key={k}
                className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl"
              >
                <Skeleton className="w-20 h-14 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fetch errors */}
        {!isFetching && fetchErrors.length > 0 && (
          <div
            className="mb-4 space-y-2"
            data-ocid="autofetch.preview.error_state"
          >
            {fetchErrors.map((err) => (
              <div
                key={err}
                className="flex items-start gap-2 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive"
              >
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{err}</span>
              </div>
            ))}
          </div>
        )}

        {/* Empty result */}
        {!isFetching &&
          hasFetched &&
          previewItems.length === 0 &&
          fetchErrors.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-12 text-center bg-card border border-dashed border-border rounded-xl"
              data-ocid="autofetch.preview.empty_state"
            >
              <Rss className="w-8 h-8 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground text-sm">
                No articles found in this feed.
              </p>
            </div>
          )}

        {/* Preview list */}
        {!isFetching && previewItems.length > 0 && (
          <>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 p-3 bg-card border border-border rounded-xl">
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleToggleSelectAll}
                  className="flex items-center gap-2 h-8"
                  data-ocid="autofetch.select_all.toggle"
                >
                  {allSelected ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5" />
                      Select All
                    </>
                  )}
                </Button>
                <span className="text-xs font-mono text-muted-foreground">
                  {selectedItems.length} / {previewItems.length} selected
                </span>
              </div>
              <Button
                onClick={handleImport}
                disabled={isImporting || selectedItems.length === 0}
                className="flex items-center gap-2 self-start sm:self-auto"
                data-ocid="autofetch.import.primary_button"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing…
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Import Selected ({selectedItems.length})
                  </>
                )}
              </Button>
            </div>

            {/* Cards */}
            <div className="space-y-2" data-ocid="autofetch.preview.list">
              <AnimatePresence initial={false}>
                {previewItems.map((item, i) => {
                  const badgeClass =
                    CATEGORY_BADGE_CLASS[item.categoryOverride] ??
                    "bg-muted/30 text-muted-foreground border-border";

                  return (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{
                        delay: Math.min(i * 0.025, 0.4),
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className={`flex items-start gap-3 p-4 bg-card border rounded-xl transition-all duration-200 ${
                        item.selected
                          ? "border-primary/30 bg-primary/2"
                          : "border-border opacity-60"
                      }`}
                      data-ocid={`autofetch.preview.item.${i + 1}`}
                    >
                      {/* Checkbox */}
                      <div className="pt-0.5 flex-shrink-0">
                        <Checkbox
                          checked={item.selected}
                          onCheckedChange={() => handleToggleItem(item._id)}
                          className="data-[state=checked]:bg-cricket-green data-[state=checked]:border-cricket-green"
                          data-ocid={`autofetch.preview.checkbox.${i + 1}`}
                        />
                      </div>

                      {/* Thumbnail */}
                      <div className="hidden sm:flex w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-secondary items-center justify-center border border-border">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML =
                                  '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                              }
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <p className="font-display font-700 text-sm text-foreground leading-snug line-clamp-2">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-muted-foreground">
                            {item.sourceName}
                          </span>
                          <span className="text-muted-foreground/40 text-xs">
                            ·
                          </span>
                          <Badge
                            className={`text-[10px] font-mono border px-1.5 py-0.5 ${badgeClass}`}
                          >
                            {item.categoryOverride
                              .replace(/([A-Z])/g, " $1")
                              .trim()}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground/60">
                            {item.publishedDate}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Category override */}
                      <div className="flex-shrink-0 w-36 hidden sm:block">
                        <Select
                          value={item.categoryOverride}
                          onValueChange={(v) =>
                            handleCategoryChange(item._id, v)
                          }
                        >
                          <SelectTrigger
                            className="h-8 text-xs"
                            data-ocid={`autofetch.preview.category.select.${i + 1}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORY_OPTIONS.map((opt) => (
                              <SelectItem
                                key={opt.value}
                                value={opt.value}
                                className="text-xs"
                              >
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Bottom import bar (sticky for long lists) */}
            {previewItems.length > 5 && (
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleImport}
                  disabled={isImporting || selectedItems.length === 0}
                  className="flex items-center gap-2"
                  data-ocid="autofetch.import_bottom.primary_button"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Importing…
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Import Selected ({selectedItems.length})
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
