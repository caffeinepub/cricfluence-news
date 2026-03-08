import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Article, Comment, Sponsor } from "../backend.d";
import { Category, Position } from "../backend.d";
import { useActor } from "./useActor";

// ── Query Keys ──────────────────────────────────────────────────
export const QUERY_KEYS = {
  allArticles: ["articles"],
  articlesByCategory: (cat: Category) => ["articles", "category", cat],
  articleById: (id: bigint) => ["articles", id.toString()],
  allSponsors: ["sponsors"],
  sponsorsByPosition: (pos: Position) => ["sponsors", "position", pos],
} as const;

// ── Category Mapping Helper ─────────────────────────────────────
function mapCategory(cat: string): Category {
  switch (cat.toLowerCase().replace(/\s+/g, "")) {
    case "cricket":
      return Category.cricket;
    case "influencers":
      return Category.influencers;
    case "sports":
      return Category.sports;
    case "internationalnews":
      return Category.internationalNews;
    case "nationalnews":
      return Category.nationalNews;
    case "incidents":
      return Category.incidents;
    default:
      return Category.cricket;
  }
}

// ── Read Queries – Articles ─────────────────────────────────────

export function useAllArticles() {
  const { actor } = useActor();
  return useQuery<Article[]>({
    queryKey: QUERY_KEYS.allArticles,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.getAllArticles();
      return Array.isArray(result) ? result : [];
    },
    enabled: !!actor,
    retry: 10,
    retryDelay: (attempt) => Math.min(600 * 1.5 ** attempt, 15000),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}

export function useArticlesByCategory(category: string) {
  const { actor } = useActor();
  const cat = mapCategory(category);
  return useQuery<Article[]>({
    queryKey: QUERY_KEYS.articlesByCategory(cat),
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.getArticlesByCategory(cat);
      return Array.isArray(result) ? result : [];
    },
    enabled: !!actor,
    retry: 8,
    retryDelay: (attempt) => Math.min(800 * 1.5 ** attempt, 12000),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
}

export function useArticleById(id: bigint | null) {
  const { actor } = useActor();
  return useQuery<Article | null>({
    queryKey: QUERY_KEYS.articleById(id ?? BigInt(0)),
    queryFn: async () => {
      if (!actor || id === null) return null;
      try {
        return await actor.getArticleById(id);
      } catch {
        return null;
      }
    },
    enabled: !!actor && id !== null,
    retry: 5,
    retryDelay: (attempt) => Math.min(800 * 1.5 ** attempt, 10000),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
}

// ── Mutations – Articles ────────────────────────────────────────

export function useSeedData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      try {
        return await actor.seedSampleData();
      } catch (_e) {
        // Backend traps if already seeded -- swallow and treat as success
        return;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allArticles });
    },
    onError: () => {
      // Also refetch on error -- backend may already have data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allArticles });
    },
  });
}

export function useCreateArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      category: string;
      summary: string;
      content: string;
      author: string;
      publishedDate: string;
      imageUrl: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const cat = mapCategory(data.category);
      return actor.createArticle(
        data.title,
        data.content,
        data.publishedDate,
        data.author,
        data.summary,
        data.imageUrl,
        cat,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allArticles });
    },
  });
}

export function useUpdateArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      category: string;
      summary: string;
      content: string;
      author: string;
      publishedDate: string;
      imageUrl: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const cat = mapCategory(data.category);
      return actor.updateArticle(
        data.id,
        data.title,
        data.content,
        data.publishedDate,
        data.author,
        data.summary,
        data.imageUrl,
        cat,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allArticles });
    },
  });
}

export function useDeleteArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteArticle(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allArticles });
    },
  });
}

export function useLikeArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.likeArticle(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allArticles });
    },
  });
}

export function useRecordView() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.recordView(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allArticles });
    },
  });
}

// ── Read Queries – Sponsors ─────────────────────────────────────

export function useAllSponsors() {
  const { actor } = useActor();
  return useQuery<Sponsor[]>({
    queryKey: QUERY_KEYS.allSponsors,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.getAllSponsors();
      return Array.isArray(result) ? result : [];
    },
    enabled: !!actor,
    retry: 8,
    retryDelay: (attempt) => Math.min(800 * 1.5 ** attempt, 12000),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
}

export function useActiveSponsorsByPosition(position: Position) {
  const { actor } = useActor();
  return useQuery<Sponsor[]>({
    queryKey: QUERY_KEYS.sponsorsByPosition(position),
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.getActiveSponsorsByPosition(position);
      return Array.isArray(result) ? result : [];
    },
    enabled: !!actor,
    retry: 8,
    retryDelay: (attempt) => Math.min(800 * 1.5 ** attempt, 12000),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
}

// ── Mutations – Sponsors ────────────────────────────────────────

export function useCreateSponsor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      imageUrl: string;
      linkUrl: string;
      position: Position;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createSponsor(
        data.title,
        data.imageUrl,
        data.linkUrl,
        data.position,
        new Date().toISOString(),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allSponsors });
      for (const pos of Object.values(Position)) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.sponsorsByPosition(pos),
        });
      }
    },
  });
}

export function useUpdateSponsor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      imageUrl: string;
      linkUrl: string;
      position: Position;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateSponsor(
        data.id,
        data.title,
        data.imageUrl,
        data.linkUrl,
        data.position,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allSponsors });
      for (const pos of Object.values(Position)) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.sponsorsByPosition(pos),
        });
      }
    },
  });
}

export function useDeleteSponsor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteSponsor(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allSponsors });
      for (const pos of Object.values(Position)) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.sponsorsByPosition(pos),
        });
      }
    },
  });
}

export function useToggleSponsorActive() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.toggleSponsorActive(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allSponsors });
      for (const pos of Object.values(Position)) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.sponsorsByPosition(pos),
        });
      }
    },
  });
}

// ── Read Queries – Comments ─────────────────────────────────────

export function useCommentsByArticle(articleId: bigint) {
  const { actor } = useActor();
  return useQuery<Comment[]>({
    queryKey: ["comments", articleId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.getCommentsByArticle(articleId);
      return Array.isArray(result) ? result : [];
    },
    enabled: !!actor,
    retry: 5,
    retryDelay: (attempt) => Math.min(800 * 1.5 ** attempt, 10000),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
}

export function useAllComments() {
  const { actor } = useActor();
  return useQuery<Comment[]>({
    queryKey: ["comments"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.getAllComments();
      return Array.isArray(result) ? result : [];
    },
    enabled: !!actor,
    retry: 5,
    retryDelay: (attempt) => Math.min(800 * 1.5 ** attempt, 10000),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
}

// ── Mutations – Comments ────────────────────────────────────────

export function useCreateComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      articleId: bigint;
      author: string;
      text: string;
      createdAt: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createComment(
        data.articleId,
        data.author,
        data.text,
        data.createdAt,
      );
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.articleId.toString()],
      });
    },
  });
}

export function useDeleteComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteComment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

export function useTogglePinComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.togglePinComment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

// Re-export enums for convenience
export { Category, Position };
