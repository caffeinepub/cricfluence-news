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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  BarChart2,
  Edit2,
  Eye,
  Heart,
  ImageIcon,
  Loader2,
  Megaphone,
  MessageSquare,
  Newspaper,
  Pin,
  Plus,
  RotateCcw,
  Rss,
  Shield,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Article, Comment, Sponsor } from "../backend.d";
import { Position } from "../backend.d";
import { getLogoUrl, resetLogoUrl, setLogoUrl } from "../hooks/useLogoStore";
import {
  useAllArticles,
  useAllComments,
  useAllSponsors,
  useCreateArticle,
  useCreateSponsor,
  useDeleteArticle,
  useDeleteComment,
  useDeleteSponsor,
  useTogglePinComment,
  useToggleSponsorActive,
  useUpdateArticle,
  useUpdateSponsor,
} from "../hooks/useQueries";
import { AutoFetchTab } from "./AutoFetchTab";

// ── Category Config ──────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { value: "Cricket", label: "Cricket" },
  { value: "Influencers", label: "Influencers" },
  { value: "Sports", label: "Sports" },
  { value: "InternationalNews", label: "International News" },
  { value: "NationalNews", label: "National News" },
  { value: "Incidents", label: "Incidents" },
];

const CATEGORY_DOT_COLOR: Record<string, string> = {
  cricket: "bg-cricket-green",
  influencers: "bg-influencer-amber",
  sports: "bg-sky-400",
  internationalnews: "bg-violet-400",
  nationalnews: "bg-teal-400",
  incidents: "bg-red-400",
};

const CATEGORY_TEXT_COLOR: Record<string, string> = {
  cricket: "text-cricket-green/70",
  influencers: "text-influencer-amber/70",
  sports: "text-sky-400/70",
  internationalnews: "text-violet-400/70",
  nationalnews: "text-teal-400/70",
  incidents: "text-red-400/70",
};

function getCategoryKey(cat: string): string {
  return cat.toLowerCase().replace(/\s+/g, "");
}

// ── Article Form ─────────────────────────────────────────────────

interface ArticleFormData {
  title: string;
  category: string;
  author: string;
  publishedDate: string;
  imageUrl: string;
  summary: string;
  content: string;
}

const EMPTY_ARTICLE_FORM: ArticleFormData = {
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
  const [form, setForm] = useState<ArticleFormData>(
    initial ?? EMPTY_ARTICLE_FORM,
  );
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
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      data-ocid={`article.category.${opt.value.toLowerCase()}`}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
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

// ── Sponsor Form ─────────────────────────────────────────────────

interface SponsorFormData {
  title: string;
  imageUrl: string;
  linkUrl: string;
  position: Position;
}

const EMPTY_SPONSOR_FORM: SponsorFormData = {
  title: "",
  imageUrl: "",
  linkUrl: "",
  position: Position.top,
};

interface SponsorFormProps {
  initial?: SponsorFormData;
  onSubmit: (data: SponsorFormData) => Promise<void>;
  onClose: () => void;
  isEditing: boolean;
  isPending: boolean;
}

function SponsorForm({
  initial,
  onSubmit,
  onClose,
  isEditing,
  isPending,
}: SponsorFormProps) {
  const [form, setForm] = useState<SponsorFormData>(
    initial ?? EMPTY_SPONSOR_FORM,
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof SponsorFormData, string>>
  >({});

  const update = <K extends keyof SponsorFormData>(
    field: K,
    value: SponsorFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SponsorFormData, string>> = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.imageUrl.trim()) newErrors.imageUrl = "Image URL is required";
    if (!form.linkUrl.trim())
      newErrors.linkUrl = "Destination link is required";
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
      data-ocid="sponsor.modal"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-card border border-border rounded-xl shadow-card"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display font-700 text-xl">
            {isEditing ? "Edit Sponsor" : "New Sponsor"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            data-ocid="sponsor.modal.close_button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="sponsor-title">Sponsor / Ad Title *</Label>
            <Input
              id="sponsor-title"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Acme Sports – Summer Sale"
              className={errors.title ? "border-destructive" : ""}
              data-ocid="sponsor.title.input"
            />
            {errors.title && (
              <p
                className="text-xs text-destructive"
                data-ocid="sponsor.title_error"
              >
                {errors.title}
              </p>
            )}
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <Label htmlFor="sponsor-image">Banner Image URL *</Label>
            <Input
              id="sponsor-image"
              value={form.imageUrl}
              onChange={(e) => update("imageUrl", e.target.value)}
              placeholder="https://example.com/banner.jpg"
              className={errors.imageUrl ? "border-destructive" : ""}
              data-ocid="sponsor.image.input"
            />
            {errors.imageUrl && (
              <p
                className="text-xs text-destructive"
                data-ocid="sponsor.image_error"
              >
                {errors.imageUrl}
              </p>
            )}
          </div>

          {/* Link URL */}
          <div className="space-y-1.5">
            <Label htmlFor="sponsor-link">Destination URL *</Label>
            <Input
              id="sponsor-link"
              value={form.linkUrl}
              onChange={(e) => update("linkUrl", e.target.value)}
              placeholder="https://advertiser.com"
              className={errors.linkUrl ? "border-destructive" : ""}
              data-ocid="sponsor.link.input"
            />
            {errors.linkUrl && (
              <p
                className="text-xs text-destructive"
                data-ocid="sponsor.link_error"
              >
                {errors.linkUrl}
              </p>
            )}
          </div>

          {/* Position */}
          <div className="space-y-1.5">
            <Label htmlFor="sponsor-position">Ad Position *</Label>
            <Select
              value={form.position}
              onValueChange={(v) => update("position", v as Position)}
            >
              <SelectTrigger
                id="sponsor-position"
                data-ocid="sponsor.position.select"
              >
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Position.top}>
                  Top Leaderboard (728×90)
                </SelectItem>
                <SelectItem value={Position.mid}>
                  Mid Rectangle (300×250)
                </SelectItem>
                <SelectItem value={Position.bottom}>
                  Bottom Leaderboard (728×90)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              data-ocid="sponsor.modal.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="sponsor.modal.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? "Saving..." : "Adding..."}
                </>
              ) : (
                <>{isEditing ? "Save Changes" : "Add Sponsor"}</>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Position Badge ────────────────────────────────────────────────

function PositionBadge({ position }: { position: Position }) {
  if (position === Position.top) {
    return (
      <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 border text-[10px] font-mono uppercase tracking-wider">
        Top
      </Badge>
    );
  }
  if (position === Position.mid) {
    return (
      <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30 border text-[10px] font-mono uppercase tracking-wider">
        Mid
      </Badge>
    );
  }
  return (
    <Badge className="bg-orange-500/15 text-orange-400 border-orange-500/30 border text-[10px] font-mono uppercase tracking-wider">
      Bottom
    </Badge>
  );
}

// ── Sponsors Tab ─────────────────────────────────────────────────

function SponsorsTab() {
  const { data: sponsors, isLoading, isError } = useAllSponsors();
  const createMutation = useCreateSponsor();
  const updateMutation = useUpdateSponsor();
  const deleteMutation = useDeleteSponsor();
  const toggleMutation = useToggleSponsorActive();

  const [formOpen, setFormOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Sponsor | null>(null);

  const handleOpenNew = () => {
    setEditingSponsor(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingSponsor(null);
  };

  const handleSubmit = async (data: SponsorFormData) => {
    try {
      if (editingSponsor) {
        await updateMutation.mutateAsync({ id: editingSponsor.id, ...data });
        toast.success("Sponsor updated");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Sponsor added");
      }
      handleCloseForm();
    } catch {
      toast.error("Failed to save sponsor. Please try again.");
    }
  };

  const handleToggle = async (sponsor: Sponsor) => {
    try {
      await toggleMutation.mutateAsync(sponsor.id);
      toast.success(
        sponsor.isActive ? "Sponsor deactivated" : "Sponsor activated",
      );
    } catch {
      toast.error("Failed to toggle sponsor");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Sponsor removed");
    } catch {
      toast.error("Failed to delete sponsor");
    } finally {
      setDeleteTarget(null);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      {/* Sponsors Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-700 text-lg">Sponsor Banners</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage advertisement banners shown on the site.
          </p>
        </div>
        <Button
          onClick={handleOpenNew}
          className="flex items-center gap-2 self-start sm:self-auto"
          data-ocid="admin.sponsor.open_modal_button"
        >
          <Plus className="w-4 h-4" />
          New Sponsor
        </Button>
      </div>

      {isError && (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-ocid="admin.sponsors.error_state"
        >
          <AlertTriangle className="w-8 h-8 text-destructive mb-3" />
          <p className="text-destructive font-medium">
            Failed to load sponsors
          </p>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3" data-ocid="admin.sponsors.loading_state">
          {["s1", "s2", "s3"].map((k) => (
            <div
              key={k}
              className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border"
            >
              <Skeleton className="h-12 w-20 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-12 rounded-full" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && !isError && sponsors && sponsors.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-24 text-center"
          data-ocid="admin.sponsors.empty_state"
        >
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center mb-4">
            <Megaphone className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-display font-700 text-xl mb-2">
            No sponsors yet
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm mb-4">
            Click "New Sponsor" to add your first ad banner.
          </p>
          <Button
            onClick={handleOpenNew}
            data-ocid="admin.sponsors.empty.open_modal_button"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Sponsor
          </Button>
        </div>
      )}

      {!isLoading && !isError && sponsors && sponsors.length > 0 && (
        <div className="space-y-1.5" data-ocid="admin.sponsors.list">
          {sponsors.map((sponsor, i) => (
            <motion.div
              key={sponsor.id.toString()}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-4 px-4 py-3 bg-card rounded-lg border border-border hover:border-primary/30 transition-all duration-200 group"
              data-ocid={`admin.sponsors.item.${i + 1}`}
            >
              {/* Thumbnail */}
              <div className="hidden sm:block w-20 h-12 rounded overflow-hidden flex-shrink-0 bg-secondary border border-border">
                {sponsor.imageUrl ? (
                  <img
                    src={sponsor.imageUrl}
                    alt={sponsor.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Megaphone className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-display font-700 text-sm text-foreground truncate leading-tight mb-1">
                  {sponsor.title}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <PositionBadge position={sponsor.position} />
                  {sponsor.isActive ? (
                    <Badge className="bg-cricket-green/15 text-cricket-green border-cricket-green/30 border text-[10px] font-mono uppercase tracking-wider">
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-muted/30 text-muted-foreground border-border border text-[10px] font-mono uppercase tracking-wider">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>

              {/* Toggle */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Switch
                  checked={sponsor.isActive}
                  onCheckedChange={() => handleToggle(sponsor)}
                  disabled={toggleMutation.isPending}
                  className="data-[state=checked]:bg-cricket-green"
                  data-ocid={`admin.sponsors.toggle.${i + 1}`}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleOpenEdit(sponsor)}
                  className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                  title="Edit sponsor"
                  data-ocid={`admin.sponsors.edit_button.${i + 1}`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteTarget(sponsor)}
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  title="Delete sponsor"
                  data-ocid={`admin.sponsors.delete_button.${i + 1}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Sponsor Form Modal */}
      <AnimatePresence>
        {formOpen && (
          <SponsorForm
            initial={
              editingSponsor
                ? {
                    title: editingSponsor.title,
                    imageUrl: editingSponsor.imageUrl,
                    linkUrl: editingSponsor.linkUrl,
                    position: editingSponsor.position,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            onClose={handleCloseForm}
            isEditing={!!editingSponsor}
            isPending={isSaving}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="admin.sponsor.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Remove Sponsor?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-medium text-foreground">
                "{deleteTarget?.title}"
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteTarget(null)}
              data-ocid="admin.sponsor.delete.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="admin.sponsor.delete.confirm_button"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Statistics Tab ────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-5"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${color} bg-opacity-15`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <span className="text-xs font-mono font-600 text-muted-foreground uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p className="font-display font-800 text-3xl text-foreground">{value}</p>
    </motion.div>
  );
}

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  cricket: "Cricket",
  influencers: "Influencers",
  sports: "Sports",
  internationalnews: "International News",
  nationalnews: "National News",
  incidents: "Incidents",
};

function StatisticsTab({ articles }: { articles: Article[] }) {
  const totalViews = articles.reduce((sum, a) => sum + Number(a.views ?? 0), 0);
  const totalLikes = articles.reduce((sum, a) => sum + Number(a.likes ?? 0), 0);

  // Category breakdown
  const categoryCount: Record<string, number> = {};
  for (const article of articles) {
    const key = getCategoryKey(article.category);
    categoryCount[key] = (categoryCount[key] ?? 0) + 1;
  }

  const mostPopularCatKey =
    Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const mostPopularCat =
    CATEGORY_DISPLAY_NAMES[mostPopularCatKey] ?? mostPopularCatKey;

  // Sort articles by views descending for table
  const sortedByViews = [...articles].sort(
    (a, b) => Number(b.views ?? 0) - Number(a.views ?? 0),
  );

  return (
    <div className="space-y-8" data-ocid="admin.stats.section">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Articles"
          value={articles.length}
          icon={Newspaper}
          color="text-cricket-green"
        />
        <StatCard
          label="Total Views"
          value={totalViews.toLocaleString()}
          icon={Eye}
          color="text-sky-400"
        />
        <StatCard
          label="Total Likes"
          value={totalLikes.toLocaleString()}
          icon={Heart}
          color="text-red-400"
        />
        <StatCard
          label="Top Category"
          value={mostPopularCat}
          icon={TrendingUp}
          color="text-influencer-amber"
        />
      </div>

      {/* Category breakdown */}
      <div>
        <h3 className="font-display font-700 text-base mb-4 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-muted-foreground" />
          Articles by Category
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(CATEGORY_DISPLAY_NAMES).map(([key, name]) => {
            const count = categoryCount[key] ?? 0;
            const dotColor = CATEGORY_DOT_COLOR[key] ?? "bg-muted-foreground";
            const maxCount = Math.max(...Object.values(categoryCount), 1);
            const pct = Math.round((count / maxCount) * 100);
            return (
              <div
                key={key}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`}
                  />
                  <span className="text-xs font-mono font-600 text-muted-foreground uppercase tracking-wider truncate">
                    {name}
                  </span>
                </div>
                <p className="font-display font-800 text-2xl text-foreground mb-2">
                  {count}
                </p>
                {/* Mini progress bar */}
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${dotColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-article stats table */}
      <div>
        <h3 className="font-display font-700 text-base mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-muted-foreground" />
          Article Traffic (sorted by views)
        </h3>
        {articles.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 text-center bg-card border border-border rounded-xl"
            data-ocid="admin.stats.empty_state"
          >
            <BarChart2 className="w-8 h-8 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">
              No articles to show stats for yet.
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-mono font-600 text-xs uppercase tracking-wider text-muted-foreground">
                    Title
                  </TableHead>
                  <TableHead className="font-mono font-600 text-xs uppercase tracking-wider text-muted-foreground w-36">
                    Category
                  </TableHead>
                  <TableHead className="font-mono font-600 text-xs uppercase tracking-wider text-muted-foreground w-24 text-right">
                    <span className="flex items-center justify-end gap-1">
                      <Eye className="w-3 h-3" /> Views
                    </span>
                  </TableHead>
                  <TableHead className="font-mono font-600 text-xs uppercase tracking-wider text-muted-foreground w-24 text-right">
                    <span className="flex items-center justify-end gap-1">
                      <Heart className="w-3 h-3" /> Likes
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedByViews.map((article, i) => {
                  const catKey = getCategoryKey(article.category);
                  const dotColor =
                    CATEGORY_DOT_COLOR[catKey] ?? "bg-muted-foreground";
                  const displayName =
                    CATEGORY_DISPLAY_NAMES[catKey] ?? article.category;
                  return (
                    <TableRow
                      key={article.id.toString()}
                      className="border-border hover:bg-secondary/30 transition-colors"
                      data-ocid={`admin.stats.row.${i + 1}`}
                    >
                      <TableCell className="font-display font-600 text-sm text-foreground max-w-[240px] truncate">
                        {article.title}
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`}
                          />
                          <span className="text-xs font-mono text-muted-foreground">
                            {displayName}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-sky-400">
                        {Number(article.views ?? 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-red-400">
                        {Number(article.likes ?? 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Logo Tab ─────────────────────────────────────────────────────

const DEFAULT_LOGO = "/assets/generated/cricfluence-logo.dim_400x120.png";

function LogoTab() {
  const [inputUrl, setInputUrl] = useState(getLogoUrl);
  const [preview, setPreview] = useState(getLogoUrl);
  const [imgError, setImgError] = useState(false);

  const handleApply = () => {
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      toast.error("Please enter a valid image URL.");
      return;
    }
    setLogoUrl(trimmed);
    setPreview(trimmed);
    setImgError(false);
    toast.success("Logo updated successfully.");
  };

  const handleReset = () => {
    resetLogoUrl();
    setInputUrl(DEFAULT_LOGO);
    setPreview(DEFAULT_LOGO);
    setImgError(false);
    toast.success("Logo reset to default.");
  };

  return (
    <div className="max-w-lg space-y-6" data-ocid="admin.logo.section">
      <div>
        <h2 className="font-display font-700 text-lg">Site Logo</h2>
        <p className="text-muted-foreground text-sm mt-0.5">
          Paste an image URL to replace the logo shown in the navbar and admin
          bar.
        </p>
      </div>

      {/* Preview */}
      <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-center min-h-[96px]">
        {imgError ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="w-8 h-8" />
            <span className="text-xs">Could not load image</span>
          </div>
        ) : (
          <img
            src={preview}
            alt="Logo preview"
            className="max-h-16 max-w-full object-contain"
            onError={() => setImgError(true)}
            onLoad={() => setImgError(false)}
            data-ocid="admin.logo.preview"
          />
        )}
      </div>

      {/* URL input */}
      <div className="space-y-1.5">
        <Label htmlFor="logo-url">Logo Image URL</Label>
        <Input
          id="logo-url"
          value={inputUrl}
          onChange={(e) => {
            setInputUrl(e.target.value);
            setImgError(false);
          }}
          placeholder="https://example.com/logo.png"
          data-ocid="admin.logo.url.input"
        />
        <p className="text-[11px] text-muted-foreground">
          Recommended: PNG or SVG with transparent background, at least 400px
          wide.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={handleApply} data-ocid="admin.logo.save_button">
          Apply Logo
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          className="flex items-center gap-2"
          data-ocid="admin.logo.reset_button"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to Default
        </Button>
      </div>
    </div>
  );
}

// ── Comments Admin Tab ────────────────────────────────────────────

function formatCommentDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function CommentsAdminTab() {
  const {
    data: comments,
    isLoading: commentsLoading,
    isError: commentsError,
  } = useAllComments();
  const { data: articles, isLoading: articlesLoading } = useAllArticles();
  const deleteMutation = useDeleteComment();
  const togglePinMutation = useTogglePinComment();

  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);

  const isLoading = commentsLoading || articlesLoading;

  // Build article title lookup
  const articleTitleMap: Record<string, string> = {};
  if (articles) {
    for (const a of articles) {
      articleTitleMap[a.id.toString()] = a.title;
    }
  }

  // Group comments by articleId
  const grouped: Record<string, Comment[]> = {};
  if (comments) {
    for (const c of comments) {
      const key = c.articleId.toString();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(c);
    }
    // Sort each group: pinned first, then newest
    for (const key of Object.keys(grouped)) {
      grouped[key] = [
        ...grouped[key].filter((c) => c.isPinned),
        ...[...grouped[key].filter((c) => !c.isPinned)].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      ];
    }
  }

  const handleTogglePin = async (comment: Comment) => {
    try {
      await togglePinMutation.mutateAsync(comment.id);
      toast.success(comment.isPinned ? "Comment unpinned" : "Comment pinned");
    } catch {
      toast.error("Failed to update comment");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-700 text-lg">Reader Comments</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Pin or remove comments across all articles.
          </p>
        </div>
        {comments && (
          <span className="text-xs font-mono text-muted-foreground bg-secondary px-3 py-1.5 rounded-md border border-border">
            {comments.length} total comment{comments.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {isLoading && (
        <div className="space-y-4" data-ocid="admin.comments.loading_state">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-4 space-y-3"
            >
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      )}

      {commentsError && (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-ocid="admin.comments.error_state"
        >
          <AlertTriangle className="w-8 h-8 text-destructive mb-3" />
          <p className="text-destructive font-medium">
            Failed to load comments
          </p>
        </div>
      )}

      {!isLoading && !commentsError && comments && comments.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-24 text-center"
          data-ocid="admin.comments.empty_state"
        >
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center mb-4">
            <MessageSquare className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-display font-700 text-xl mb-2">
            No comments yet
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Comments left by readers on your articles will appear here.
          </p>
        </div>
      )}

      {!isLoading && !commentsError && comments && comments.length > 0 && (
        <div className="space-y-6" data-ocid="admin.comments.list">
          {Object.entries(grouped).map(([articleId, articleComments]) => {
            const articleTitle =
              articleTitleMap[articleId] ?? `Article #${articleId}`;
            return (
              <div
                key={articleId}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                {/* Article header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-secondary/40 border-b border-border">
                  <Newspaper className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-display font-700 text-sm text-foreground truncate">
                    {articleTitle}
                  </span>
                  <span className="ml-auto text-xs font-mono text-muted-foreground flex-shrink-0">
                    {articleComments.length} comment
                    {articleComments.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Comment rows */}
                <div className="divide-y divide-border">
                  {articleComments.map((comment, i) => (
                    <motion.div
                      key={comment.id.toString()}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className={`flex items-start gap-3 px-4 py-3 group hover:bg-secondary/20 transition-colors ${
                        comment.isPinned ? "bg-influencer-amber/5" : ""
                      }`}
                      data-ocid={`admin.comments.item.${i + 1}`}
                    >
                      {/* Author + text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-display font-700 text-sm text-foreground">
                            {comment.author}
                          </span>
                          {comment.isPinned && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[10px] font-mono font-600 uppercase tracking-wider bg-influencer-amber/15 text-influencer-amber border border-influencer-amber/30">
                              <Pin className="w-2.5 h-2.5 fill-influencer-amber" />
                              Pinned
                            </span>
                          )}
                          <span className="text-[11px] text-muted-foreground/70">
                            {formatCommentDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {comment.text}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleTogglePin(comment)}
                          disabled={togglePinMutation.isPending}
                          title={
                            comment.isPinned ? "Unpin comment" : "Pin comment"
                          }
                          className={`h-8 w-8 p-0 transition-colors ${
                            comment.isPinned
                              ? "text-influencer-amber hover:text-influencer-amber/70"
                              : "hover:text-influencer-amber"
                          }`}
                          data-ocid={`admin.comments.toggle.${i + 1}`}
                        >
                          <Pin
                            className={`w-3.5 h-3.5 ${comment.isPinned ? "fill-influencer-amber" : ""}`}
                          />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteTarget(comment)}
                          title="Delete comment"
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                          data-ocid={`admin.comments.delete_button.${i + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="admin.comment.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Comment?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment by{" "}
              <span className="font-medium text-foreground">
                "{deleteTarget?.author}"
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteTarget(null)}
              data-ocid="admin.comment.delete.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="admin.comment.delete.confirm_button"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
            className="flex items-center gap-2 mb-1"
          >
            <Shield className="w-4 h-4 text-influencer-amber" />
            <span className="text-xs font-mono font-600 text-influencer-amber uppercase tracking-widest">
              Admin Panel
            </span>
          </motion.div>
          <h1 className="font-display font-800 text-2xl md:text-3xl">
            Content Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage articles, sponsor advertisements, and view site statistics.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="articles">
          <TabsList className="mb-6">
            <TabsTrigger
              value="articles"
              className="flex items-center gap-2"
              data-ocid="admin.articles.tab"
            >
              <Newspaper className="w-4 h-4" />
              Articles
            </TabsTrigger>
            <TabsTrigger
              value="autofetch"
              className="flex items-center gap-2"
              data-ocid="admin.autofetch.tab"
            >
              <Rss className="w-4 h-4" />
              Auto-Fetch
            </TabsTrigger>
            <TabsTrigger
              value="sponsors"
              className="flex items-center gap-2"
              data-ocid="admin.sponsors.tab"
            >
              <Megaphone className="w-4 h-4" />
              Sponsors
            </TabsTrigger>
            <TabsTrigger
              value="statistics"
              className="flex items-center gap-2"
              data-ocid="admin.statistics.tab"
            >
              <BarChart2 className="w-4 h-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className="flex items-center gap-2"
              data-ocid="admin.comments.tab"
            >
              <MessageSquare className="w-4 h-4" />
              Comments
            </TabsTrigger>
            <TabsTrigger
              value="logo"
              className="flex items-center gap-2"
              data-ocid="admin.logo.tab"
            >
              <ImageIcon className="w-4 h-4" />
              Logo
            </TabsTrigger>
          </TabsList>

          {/* ── Articles Tab ── */}
          <TabsContent value="articles">
            {/* Articles Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display font-700 text-lg">News Articles</h2>
                <p className="text-muted-foreground text-sm mt-0.5">
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
            </div>

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
                    const catKey = getCategoryKey(article.category.toString());
                    const dotColor =
                      CATEGORY_DOT_COLOR[catKey] ?? "bg-muted-foreground";
                    const textColor =
                      CATEGORY_TEXT_COLOR[catKey] ?? "text-muted-foreground";
                    const fallback =
                      catKey === "cricket"
                        ? "/assets/generated/cricket-featured.dim_800x500.jpg"
                        : "/assets/generated/influencer-featured.dim_800x500.jpg";
                    return (
                      <motion.div
                        key={article.id.toString()}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: i * 0.035,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="flex items-center gap-4 px-4 py-3 bg-card rounded-lg border border-border hover:border-primary/30 transition-all duration-200 group"
                        data-ocid={`admin.articles.item.${i + 1}`}
                      >
                        {/* Thumbnail */}
                        <div className="hidden sm:block w-16 h-11 rounded-md overflow-hidden flex-shrink-0 bg-secondary">
                          <img
                            src={article.imageUrl || fallback}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = fallback;
                            }}
                          />
                        </div>

                        {/* Category dot */}
                        <div
                          className={`hidden sm:block w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`}
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-700 text-sm text-foreground truncate leading-tight mb-0.5">
                            {article.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span
                              className={`font-mono font-600 uppercase tracking-wider ${textColor}`}
                            >
                              {article.category}
                            </span>
                            <span>·</span>
                            <span>{article.author}</span>
                            <span>·</span>
                            <span>{article.publishedDate}</span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {Number(article.views ?? 0)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {Number(article.likes ?? 0)}
                          </span>
                        </div>

                        {/* Actions */}
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
          </TabsContent>

          {/* ── Auto-Fetch Tab ── */}
          <TabsContent value="autofetch">
            <AutoFetchTab />
          </TabsContent>

          {/* ── Sponsors Tab ── */}
          <TabsContent value="sponsors">
            <SponsorsTab />
          </TabsContent>

          {/* ── Statistics Tab ── */}
          <TabsContent value="statistics">
            {isLoading && (
              <div className="space-y-4" data-ocid="admin.stats.loading_state">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {["a", "b", "c", "d"].map((k) => (
                    <Skeleton key={k} className="h-28 rounded-xl" />
                  ))}
                </div>
                <Skeleton className="h-48 rounded-xl" />
              </div>
            )}
            {isError && (
              <div
                className="flex flex-col items-center justify-center py-16 text-center"
                data-ocid="admin.stats.error_state"
              >
                <AlertTriangle className="w-8 h-8 text-destructive mb-3" />
                <p className="text-destructive font-medium">
                  Failed to load statistics
                </p>
              </div>
            )}
            {!isLoading && !isError && articles && (
              <StatisticsTab articles={articles} />
            )}
          </TabsContent>

          {/* ── Comments Tab ── */}
          <TabsContent value="comments">
            <CommentsAdminTab />
          </TabsContent>

          {/* ── Logo Tab ── */}
          <TabsContent value="logo">
            <LogoTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Article Form Modal */}
      <AnimatePresence>
        {formOpen && (
          <ArticleForm
            initial={
              editingArticle
                ? {
                    title: editingArticle.title,
                    category: editingArticle.category.toString(),
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

      {/* Article Delete Confirmation Dialog */}
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
