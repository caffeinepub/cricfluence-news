import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Pin, Send, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Comment } from "../backend.d";
import { useCommentsByArticle, useCreateComment } from "../hooks/useQueries";

interface CommentsSectionProps {
  articleId: bigint;
}

function formatDate(dateStr: string): string {
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

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

function CommentCard({ comment }: { comment: Comment }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 p-4 rounded-xl border transition-colors ${
        comment.isPinned
          ? "bg-influencer-amber/5 border-influencer-amber/25"
          : "bg-card border-border"
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-700 text-muted-foreground">
        {getInitials(comment.author) || <User className="w-4 h-4" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="font-display font-700 text-sm text-foreground">
            {comment.author}
          </span>
          {comment.isPinned && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[10px] font-mono font-600 uppercase tracking-wider bg-influencer-amber/15 text-influencer-amber border border-influencer-amber/30">
              <Pin className="w-2.5 h-2.5 fill-influencer-amber" />
              Pinned
            </span>
          )}
          <span className="text-xs text-muted-foreground/70">
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {comment.text}
        </p>
      </div>
    </motion.div>
  );
}

export function CommentsSection({ articleId }: CommentsSectionProps) {
  const { data: comments, isLoading } = useCommentsByArticle(articleId);
  const createMutation = useCreateComment();

  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [nameError, setNameError] = useState("");
  const [textError, setTextError] = useState("");

  // Sort: pinned first, then newest-first
  const sorted: Comment[] = comments
    ? [
        ...comments.filter((c) => c.isPinned),
        ...[...comments.filter((c) => !c.isPinned)].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      ]
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    setNameError("");
    setTextError("");

    if (!name.trim()) {
      setNameError("Name is required");
      valid = false;
    }
    if (!text.trim()) {
      setTextError("Comment cannot be empty");
      valid = false;
    }
    if (!valid) return;

    try {
      await createMutation.mutateAsync({
        articleId,
        author: name.trim(),
        text: text.trim(),
        createdAt: new Date().toISOString(),
      });
      setName("");
      setText("");
      toast.success("Comment posted!");
    } catch {
      toast.error("Failed to post comment. Please try again.");
    }
  };

  return (
    <section
      className="mt-10 border-t border-border pt-10"
      data-ocid="comments.section"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-cricket-green" />
        <h2 className="font-display font-700 text-xl">
          Comments
          {comments && comments.length > 0 && (
            <span className="ml-2 text-base font-400 text-muted-foreground">
              ({comments.length})
            </span>
          )}
        </h2>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3 mb-8" data-ocid="comments.loading_state">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex gap-3 p-4 rounded-xl border border-border bg-card"
            >
              <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comments list */}
      {!isLoading && (
        <div className="space-y-3 mb-8">
          <AnimatePresence>
            {sorted.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-12 text-center text-muted-foreground"
                data-ocid="comments.empty_state"
              >
                <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-display font-600 text-base mb-1">
                  No comments yet
                </p>
                <p className="text-sm opacity-70">Be the first to comment</p>
              </motion.div>
            ) : (
              sorted.map((comment) => (
                <CommentCard key={comment.id.toString()} comment={comment} />
              ))
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Post a comment form */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-display font-700 text-base mb-4">
          Leave a Comment
        </h3>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          data-ocid="comments.form"
        >
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="comment-name">Your Name *</Label>
            <Input
              id="comment-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
              placeholder="Enter your name..."
              className={nameError ? "border-destructive" : ""}
              data-ocid="comments.name.input"
            />
            {nameError && (
              <p
                className="text-xs text-destructive"
                data-ocid="comments.name_error"
              >
                {nameError}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <Label htmlFor="comment-text">Comment *</Label>
            <Textarea
              id="comment-text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setTextError("");
              }}
              placeholder="Share your thoughts..."
              rows={4}
              className={`resize-none ${textError ? "border-destructive" : ""}`}
              data-ocid="comments.textarea"
            />
            {textError && (
              <p
                className="text-xs text-destructive"
                data-ocid="comments.text_error"
              >
                {textError}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="flex items-center gap-2"
              data-ocid="comments.submit_button"
            >
              {createMutation.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Post Comment
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
