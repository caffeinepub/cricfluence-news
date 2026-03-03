import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Article } from "../backend.d";
import { useActor } from "./useActor";

// ── Query Keys ──────────────────────────────────────────────────
export const QUERY_KEYS = {
  allArticles: ["articles"],
  articlesByCategory: (cat: string) => ["articles", "category", cat],
  articleById: (id: bigint) => ["articles", id.toString()],
} as const;

// ── Read Queries ────────────────────────────────────────────────

export function useAllArticles() {
  const { actor, isFetching } = useActor();
  return useQuery<Article[]>({
    queryKey: QUERY_KEYS.allArticles,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllArticles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useArticlesByCategory(category: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Article[]>({
    queryKey: QUERY_KEYS.articlesByCategory(category),
    queryFn: async () => {
      if (!actor) return [];
      return actor.getArticlesByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useArticleById(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Article | null>({
    queryKey: QUERY_KEYS.articleById(id ?? BigInt(0)),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getArticleById(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

// ── Mutations ───────────────────────────────────────────────────

export function useSeedData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.seedSampleData();
    },
    onSuccess: () => {
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
      return actor.createArticle(
        data.title,
        data.category,
        data.summary,
        data.content,
        data.author,
        data.publishedDate,
        data.imageUrl,
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
      return actor.updateArticle(
        data.id,
        data.title,
        data.category,
        data.summary,
        data.content,
        data.author,
        data.publishedDate,
        data.imageUrl,
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
