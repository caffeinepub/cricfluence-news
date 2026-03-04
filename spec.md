# CricFluence News

## Current State
- Full-stack news site with React frontend + Motoko backend
- Articles: CRUD, categories, likes, views
- Sponsors/Ads: create, toggle on/off, delete, position (top/mid/bottom)
- Admin panel at `/#/admin` with password protection (Kanaramp02@)
- Statistics tab (total views, likes, per-article table)
- Logo tab (custom logo URL, reset to default)
- Public page shows articles with like buttons; no comments
- Generated logo: `/assets/generated/cricfluence-logo.dim_400x120.png`

## Requested Changes (Diff)

### Add
- **Comments system**: Public users can post comments on any article (name + text). Comments are stored in backend per article.
- **Admin: delete comments**: Admin can see all comments for each article and delete any comment.
- **Admin: pin comments**: Admin can pin a comment; pinned comments always appear at the top of the comment list on the article page with a "Pinned" badge.
- **Ad/sponsor improvements**: Ads section already exists; make sponsor banners more visually professional with proper ad sizing labels (728×90 leaderboard, 300×250 rectangle) and a clearly labeled "Advertisement" strip above each banner on the public site.
- **Logo reset**: Reset the displayed logo back to the original generated CricFluence logo (clear any custom URL from localStorage) — the admin Logo tab already has a Reset button; ensure DEFAULT_LOGO points to the correct generated asset.

### Modify
- **ArticlePage**: Add a comments section below the article content. Show pinned comments first, then remaining comments newest-first. Each comment shows: author name, timestamp, comment text, and a "Pinned" badge if pinned.
- **AdminPage**: Add a new "Comments" tab. List all comments across all articles grouped by article. Each comment row has Delete and Pin/Unpin buttons.
- **SponsorBanner**: Add a small grey "Advertisement" label above each banner displayed on public pages.

### Remove
- Nothing removed.

## Implementation Plan

### Backend (Motoko)
1. Add `Comment` type: `{ id: Nat; articleId: Nat; author: Text; text: Text; createdAt: Text; isPinned: Bool }`
2. Add `nextCommentId` counter and `comments` Map
3. `createComment(articleId, author, text, createdAt)` → Nat (public, no auth needed)
4. `getCommentsByArticle(articleId)` → [Comment] (query)
5. `getAllComments()` → [Comment] (query, for admin)
6. `deleteComment(id)` → () (shared)
7. `pinComment(id)` → () (shared, toggles isPinned)

### Frontend
1. Update `backend.d.ts` to add Comment type and new methods
2. Add comment query/mutation hooks to `useQueries.ts`
3. Create `CommentsSection` component for ArticlePage (post comment form + list)
4. Add "Comments" tab to AdminPage with per-article grouped comment list, delete/pin buttons
5. Update `SponsorBanner.tsx` to show "Advertisement" label above each banner
6. Ensure `useLogoStore.ts` DEFAULT_LOGO correctly points to `/assets/generated/cricfluence-logo.dim_400x120.png` (already correct — no change needed)
