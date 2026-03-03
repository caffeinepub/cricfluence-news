import { Skeleton } from "@/components/ui/skeleton";

interface ArticleSkeletonProps {
  featured?: boolean;
}

export function ArticleSkeleton({ featured = false }: ArticleSkeletonProps) {
  if (featured) {
    return (
      <div className="bg-card rounded-lg border border-border overflow-hidden md:grid md:grid-cols-2">
        <Skeleton className="h-64 md:h-full" />
        <div className="p-6 md:p-8 flex flex-col gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 flex flex-col gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex gap-3 pt-2 border-t border-border">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}
