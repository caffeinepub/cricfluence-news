# CricFluence News

## Current State
Full-stack news site with articles, sponsors, comments, auto-fetch RSS, and admin panel. Articles and sponsors are not loading reliably after the page loads.

## Requested Changes (Diff)

### Add
- Robust loading with proper retry logic and error recovery

### Modify
- `useActor.ts`: Remove the complex `useEffect` invalidation loop; rely on `queryKey` containing the identity principal so React Query automatically refetches when the actor changes
- `useQueries.ts`: Fix `seedSampleData` to catch trap errors silently; add `refetchOnWindowFocus: false` to prevent unnecessary refetches; increase `retryDelay` with exponential backoff
- `HomePage.tsx`: Guard `seedSampleData` call so it doesn't get called more than once and doesn't block article display when seed fails

### Remove
- Nothing

## Implementation Plan
1. Fix `useActor.ts` - remove the `useEffect` that invalidates/refetches all queries; queries auto-refetch because queryKey changes when actor changes
2. Fix `useQueries.ts` - wrap seed mutation to handle trap errors; improve retry config
3. Fix `HomePage.tsx` - make seeding more robust so errors in seeding don't block article display
