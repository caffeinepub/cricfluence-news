import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { User } from "../backend.d";
import { useActor } from "../hooks/useActor";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function UsersTab() {
  const { actor, isFetching } = useActor();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState<bigint>(0n);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    setError(false);
    try {
      const [allUsers, count] = await Promise.all([
        (actor as any).getAllUsers() as Promise<import("../backend.d").User[]>,
        (actor as any).getUserCount() as Promise<bigint>,
      ]);
      setUsers(allUsers);
      setTotal(count);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (!isFetching && actor) {
      fetchUsers();
    }
  }, [actor, isFetching, fetchUsers]);

  return (
    <div data-ocid="admin.users.panel">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-700 text-lg">Registered Users</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            All public accounts created on CricFluence.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 self-start sm:self-auto"
          data-ocid="admin.users.refresh.button"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stat card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">
              Total Users
            </p>
            <p className="text-2xl font-display font-800 tabular-nums">
              {Number(total)}
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="flex flex-col items-center justify-center py-12 text-center"
          data-ocid="admin.users.error_state"
        >
          <p className="text-destructive font-medium">Failed to load users.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={fetchUsers}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !error && (
        <div className="space-y-2" data-ocid="admin.users.loading_state">
          {[1, 2, 3, 4, 5].map((k) => (
            <div
              key={k}
              className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border"
            >
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-52" />
              </div>
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && users.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-24 text-center"
          data-ocid="admin.users.empty_state"
        >
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-display font-700 text-xl mb-2">No users yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            No one has registered a public account yet.
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && users.length > 0 && (
        <div
          className="border border-border rounded-xl overflow-hidden"
          data-ocid="admin.users.table"
        >
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-mono font-600 text-xs uppercase tracking-wider text-muted-foreground w-12">
                  #
                </TableHead>
                <TableHead className="font-mono font-600 text-xs uppercase tracking-wider text-muted-foreground">
                  Name
                </TableHead>
                <TableHead className="font-mono font-600 text-xs uppercase tracking-wider text-muted-foreground">
                  Email
                </TableHead>
                <TableHead className="font-mono font-600 text-xs uppercase tracking-wider text-muted-foreground text-right">
                  Joined
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, i) => (
                <TableRow
                  key={user.id.toString()}
                  className="border-border hover:bg-secondary/40 transition-colors"
                  data-ocid={`admin.users.row.${i + 1}`}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell className="font-display font-600 text-sm">
                    {user.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground font-mono">
                    {formatDate(user.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
