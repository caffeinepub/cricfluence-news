import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Edit2,
  Loader2,
  Plus,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Article } from "../backend.d";
import {
  useAllArticles,
  useCreateArticle,
  useDeleteArticle,
  useUpdateArticle,
} from "../hooks/useQueries";

interface ArticleFormData {
  title: string;
  category: string;
  author: string;
  publishedDate: string;
  imageUrl: string;
  summary: string;
  content: string;
}

const EMPTY_FORM: ArticleFormData = {
  title: "",
  category: "Cricket",
  author: "",
  publishedDate: new Date().toISOString().split("T")[0],
  imageUrl: "",
  summary: "",
  content: "",
};

interface ArticleFormProps {
  initial?: ArticleFormData;
  onSubmit: (data: ArticleFormData) => Promise<void>;
  onClose: () => void;
  isEditing: boolean;
  isPending: boolean;
}

function ArticleForm({
  initial,
  onSubmit,
  onClose,
  isEditing,
  isPending,
}: ArticleFormProps) {
  const [form, setForm] = useState<ArticleFormData>(initial ?? EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<ArticleFormData>>({});

  const update = (field: keyof ArticleFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<ArticleFormData> = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.category) newErrors.category = "Category is required";
    if (!form.author.trim()) newErrors.author = "Author is required";
    if (!form.publishedDate) newErrors.publishedDate = "Date is required";
    if (!form.summary.trim()) newErrors.summary = "Summary is required";
    if (!form.content.trim()) newErrors.content = "Content is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      data-ocid="article.modal"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-card max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="font-display font-700 text-xl">
            {isEditing ? "Edit Article" : "New Article"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            data-ocid="article.modal.close_button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Enter article title..."
              className={errors.title ? "border-destructive" : ""}
              data-ocid="article.title.input"
            />
            {errors.title && (
              <p
                className="text-xs text-destructive"
                data-ocid="article.title_error"
              >
                {errors.title}
              </p>
            )}
          </div>

          {/* Category + Author Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => update("category", v)}
              >
                <SelectTrigger
                  id="category"
                  className={errors.category ? "border-destructive" : ""}
                  data-ocid="article.category.select"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="Cricket"
                    data-ocid="article.category.cricket"
                  >
                    Cricket
                  </SelectItem>
                  <SelectItem
                    value="Influencers"
                    data-ocid="article.category.influencers"
                  >
                    Influencers
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="article.category_error"
                >
                  {errors.category}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                value={form.author}
                onChange={(e) => update("author", e.target.value)}
                placeholder="Author name..."
                className={errors.author ? "border-destructive" : ""}
                data-ocid="article.author.input"
              />
              {errors.author && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="article.author_error"
                >
                  {errors.author}
                </p>
              )}
            </div>
          </div>

          {/* Date + Image Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="publishedDate">Published Date *</Label>
              <Input
                id="publishedDate"
                type="date"
                value={form.publishedDate}
                onChange={(e) => update("publishedDate", e.target.value)}
                className={errors.publishedDate ? "border-destructive" : ""}
                data-ocid="article.date.input"
              />
              {errors.publishedDate && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="article.date_error"
                >
                  {errors.publishedDate}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                value={form.imageUrl}
                onChange={(e) => update("imageUrl", e.target.value)}
                placeholder="https://example.com/image.jpg"
                data-ocid="article.image.input"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-1.5">
            <Label htmlFor="summary">Summary *</Label>
            <Textarea
              id="summary"
              value={form.summary}
              onChange={(e) => update("summary", e.target.value)}
              placeholder="Brief summary of the article..."
              rows={3}
              className={
                errors.summary
                  ? "border-destructive resize-none"
                  : "resize-none"
              }
              data-ocid="article.summary.textarea"
            />
            {errors.summary && (
              <p
                className="text-xs text-destructive"
                data-ocid="article.summary_error"
              >
                {errors.summary}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={form.content}
              onChange={(e) => update("content", e.target.value)}
              placeholder="Full article content..."
              rows={8}
              className={errors.content ? "border-destructive" : ""}
              data-ocid="article.content.textarea"
            />
            {errors.content && (
              <p
                className="text-xs text-destructive"
                data-ocid="article.content_error"
              >
                {errors.content}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              data-ocid="article.modal.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="article.modal.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? "Updating..." : "Publishing..."}
                </>
              ) : (
                <>{isEditing ? "Update Article" : "Publish Article"}</>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Main Admin Page ──────────────────────────────────────────────

export function AdminPage() {
  const { data: articles, isLoading, isError } = useAllArticles();
  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();
  const deleteMutation = useDeleteArticle();

  const [formOpen, setFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);

  const sorted = articles
    ? [...articles].sort(
        (a, b) =>
          new Date(b.publishedDate).getTime() -
          new Date(a.publishedDate).getTime(),
      )
    : [];

  const handleOpenNew = () => {
    setEditingArticle(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (article: Article) => {
    setEditingArticle(article);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingArticle(null);
  };

  const handleSubmit = async (data: ArticleFormData) => {
    try {
      if (editingArticle) {
        await updateMutation.mutateAsync({ id: editingArticle.id, ...data });
        toast.success("Article updated successfully");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Article published successfully");
      }
      handleCloseForm();
    } catch {
      toast.error("Failed to save article. Please try again.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Article deleted");
    } catch {
      toast.error("Failed to delete article");
    } finally {
      setDeleteTarget(null);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <main className="min-h-screen" data-ocid="admin.page">
      {/* Header */}
      <section className="border-b border-border bg-card/50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-influencer-amber" />
                <span className="text-xs font-mono font-600 text-influencer-amber uppercase tracking-widest">
                  Admin Panel
                </span>
              </div>
              <h1 className="font-display font-800 text-2xl md:text-3xl">
                Manage Articles
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Create, edit and remove news articles.
              </p>
            </div>

            <Button
              onClick={handleOpenNew}
              className="flex items-center gap-2 self-start sm:self-auto"
              data-ocid="admin.article.open_modal_button"
            >
              <Plus className="w-4 h-4" />
              New Article
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Table */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {isError && (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="admin.error_state"
          >
            <AlertTriangle className="w-8 h-8 text-destructive mb-3" />
            <p className="text-destructive font-medium">
              Failed to load articles
            </p>
          </div>
        )}

        {isLoading && (
          <div className="space-y-3" data-ocid="admin.loading_state">
            {["s1", "s2", "s3", "s4", "s5"].map((k) => (
              <div
                key={k}
                className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border"
              >
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        )}

        {!isLoading &&
          !isError &&
          (sorted.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-24 text-center"
              data-ocid="admin.articles.empty_state"
            >
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-display font-700 text-xl mb-2">
                No articles yet
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mb-4">
                Click "New Article" to publish your first story.
              </p>
              <Button
                onClick={handleOpenNew}
                data-ocid="admin.empty.open_modal_button"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Article
              </Button>
            </div>
          ) : (
            <div className="space-y-1.5" data-ocid="admin.articles.list">
              {sorted.map((article, i) => {
                const isCricket = article.category.toLowerCase() === "cricket";
                return (
                  <motion.div
                    key={article.id.toString()}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.035, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-4 px-4 py-3 bg-card rounded-lg border border-border hover:border-primary/30 transition-all duration-200 group"
                    data-ocid={`admin.articles.item.${i + 1}`}
                  >
                    {/* Thumbnail — wider, taller, rounded */}
                    <div className="hidden sm:block w-16 h-11 rounded-md overflow-hidden flex-shrink-0 bg-secondary">
                      <img
                        src={
                          article.imageUrl ||
                          (isCricket
                            ? "/assets/generated/cricket-featured.dim_800x500.jpg"
                            : "/assets/generated/influencer-featured.dim_800x500.jpg")
                        }
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/assets/generated/cricket-featured.dim_800x500.jpg";
                        }}
                      />
                    </div>

                    {/* Category dot */}
                    <div
                      className={`hidden sm:block w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        isCricket ? "bg-cricket-green" : "bg-influencer-amber"
                      }`}
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-700 text-sm text-foreground truncate leading-tight mb-0.5">
                        {article.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span
                          className={`font-mono font-600 uppercase tracking-wider ${
                            isCricket
                              ? "text-cricket-green/70"
                              : "text-influencer-amber/70"
                          }`}
                        >
                          {article.category}
                        </span>
                        <span>·</span>
                        <span>{article.author}</span>
                        <span>·</span>
                        <span>{article.publishedDate}</span>
                      </div>
                    </div>

                    {/* Actions — icon-only with clear intent */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEdit(article)}
                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                        title="Edit article"
                        data-ocid={`admin.articles.edit_button.${i + 1}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTarget(article)}
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        title="Delete article"
                        data-ocid={`admin.articles.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
      </div>

      {/* Article Form Modal */}
      <AnimatePresence>
        {formOpen && (
          <ArticleForm
            initial={
              editingArticle
                ? {
                    title: editingArticle.title,
                    category: editingArticle.category,
                    author: editingArticle.author,
                    publishedDate: editingArticle.publishedDate,
                    imageUrl: editingArticle.imageUrl,
                    summary: editingArticle.summary,
                    content: editingArticle.content,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            onClose={handleCloseForm}
            isEditing={!!editingArticle}
            isPending={isSaving}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="admin.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Article?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                "{deleteTarget?.title}"
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteTarget(null)}
              data-ocid="admin.delete.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="admin.delete.confirm_button"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
