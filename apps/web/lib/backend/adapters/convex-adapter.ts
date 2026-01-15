/**
 * Convex Provider Adapter Utilities
 *
 * Bridges Convex's React hooks (useQuery, useMutation) with the
 * BackendProvider interface pattern. This allows the canonical façade
 * to work with Convex while maintaining provider-agnostic APIs.
 *
 * @internal - Used by canonical hooks in this module
 */

import { useQuery, useMutation, usePaginatedQuery } from 'convex/react';
import { useMemo, useCallback, useState } from 'react';
import type { FunctionReference } from 'convex/server';
import type { Id } from '@/../convex/_generated/dataModel';
import type { PaginatedResult, PaginationParams } from '@kiiaren/core';

/**
 * Create a query hook adapter for Convex.
 *
 * Transforms Convex query results to provider-agnostic types.
 */
export function useConvexQuery<TConvex, TProvider>(
  query: FunctionReference<'query'>,
  args: Record<string, unknown> | undefined | 'skip',
  transform: (data: TConvex | undefined) => TProvider | undefined
): { data: TProvider | undefined; isLoading: boolean } {
  const convexData = useQuery(query, args === 'skip' ? 'skip' : args);
  const data = useMemo(() => transform(convexData), [convexData, transform]);
  const isLoading = convexData === undefined;

  return { data, isLoading };
}

/**
 * Create a mutation hook adapter for Convex.
 *
 * Wraps Convex mutations with consistent state management.
 */
export function useConvexMutation<TArgs, TResult>(
  mutation: FunctionReference<'mutation'>,
  options?: {
    onSuccess?: (result: TResult) => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
  }
): {
  mutate: (args: TArgs) => Promise<TResult>;
  isPending: boolean;
} {
  const convexMutation = useMutation(mutation);
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(
    async (args: TArgs): Promise<TResult> => {
      setIsPending(true);
      try {
        const result = await convexMutation(args);
        options?.onSuccess?.(result);
        return result;
      } catch (error) {
        options?.onError?.(error as Error);
        throw error;
      } finally {
        setIsPending(false);
        options?.onSettled?.();
      }
    },
    [convexMutation, options]
  );

  return { mutate, isPending };
}

/**
 * Create a paginated query hook adapter for Convex.
 *
 * Transforms Convex paginated results to provider-agnostic format.
 */
export function useConvexPaginatedQuery<TConvex, TProvider>(
  query: FunctionReference<'query'>,
  args: Record<string, unknown> | undefined | 'skip',
  transform: (items: TConvex[]) => TProvider[],
  initialNumItems: number = 20
): {
  data: PaginatedResult<TProvider>;
  isLoading: boolean;
  loadMore: () => void;
} {
  const { results, status, loadMore } = usePaginatedQuery(
    query,
    args === 'skip' || args === undefined ? 'skip' : args,
    { initialNumItems }
  );

  const data = useMemo<PaginatedResult<TProvider>>(() => {
    const items = transform(results);
    return {
      items,
      hasMore: status === 'CanLoadMore',
      cursor: status === 'CanLoadMore' ? String(items.length) : undefined,
    };
  }, [results, status, transform]);

  const isLoading = status === 'LoadingFirstPage';

  return {
    data,
    isLoading,
    loadMore: () => loadMore(initialNumItems),
  };
}