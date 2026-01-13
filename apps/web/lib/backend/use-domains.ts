'use client';

/**
 * Domain Verification Hooks
 *
 * Hooks for workspace domain verification operations.
 * Admin-only operations for domain management.
 */

import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { useProviderId } from '@/lib/provider';
import { useCallback, useState } from 'react';
import type { Id } from '@/../convex/_generated/dataModel';

/**
 * Add a domain for verification.
 *
 * Admin-only operation. Creates a pending domain with verification token.
 */
export function useAddDomain() {
  const providerId = useProviderId();
  const mutation = useMutation(api.domains.addDomain);
  const [isPending, setIsPending] = useState(false);

  if (providerId !== 'convex') {
    throw new Error(
      `[${providerId}] domains.add is not implemented. ` +
        `See docs/EDITIONING.md for self-host status.`
    );
  }

  const mutate = useCallback(
    async (
      args: { workspaceId: Id<'workspaces'>; domain: string },
      options?: {
        onSuccess?: (domainId: Id<'domains'>) => void;
        onError?: (error: Error) => void;
        onSettled?: () => void;
      }
    ) => {
      setIsPending(true);
      try {
        const result = await mutation(args);
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
    [mutation]
  );

  return { mutate, isPending };
}

/**
 * Verify domain ownership via DNS TXT lookup.
 *
 * Admin-only operation. Checks for DNS TXT record.
 */
export function useVerifyDomain() {
  const providerId = useProviderId();
  const action = useAction(api.domainActions.verifyDomain);
  const [isPending, setIsPending] = useState(false);

  if (providerId !== 'convex') {
    throw new Error(
      `[${providerId}] domains.verify is not implemented. ` +
        `See docs/EDITIONING.md for self-host status.`
    );
  }

  const mutate = useCallback(
    async (
      args: { domainId: Id<'domains'> },
      options?: {
        onSuccess?: (result: { success: boolean; error?: string }) => void;
        onError?: (error: Error) => void;
        onSettled?: () => void;
      }
    ) => {
      setIsPending(true);
      try {
        const result = await action(args);
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
    [action]
  );

  return { mutate, isPending };
}

/**
 * List all domains for a workspace.
 *
 * Admin-only operation.
 */
export function useListDomains(workspaceId: Id<'workspaces'>) {
  const providerId = useProviderId();

  if (providerId !== 'convex') {
    throw new Error(
      `[${providerId}] domains.list is not implemented. ` +
        `See docs/EDITIONING.md for self-host status.`
    );
  }

  const data = useQuery(api.domains.listDomains, { workspaceId });
  const isLoading = data === undefined;

  return { data, isLoading };
}

/**
 * Remove a domain.
 *
 * Admin-only operation.
 */
export function useRemoveDomain() {
  const providerId = useProviderId();
  const mutation = useMutation(api.domains.removeDomain);
  const [isPending, setIsPending] = useState(false);

  if (providerId !== 'convex') {
    throw new Error(
      `[${providerId}] domains.remove is not implemented. ` +
        `See docs/EDITIONING.md for self-host status.`
    );
  }

  const mutate = useCallback(
    async (
      args: { domainId: Id<'domains'> },
      options?: {
        onSuccess?: () => void;
        onError?: (error: Error) => void;
        onSettled?: () => void;
      }
    ) => {
      setIsPending(true);
      try {
        await mutation(args);
        options?.onSuccess?.();
      } catch (error) {
        options?.onError?.(error as Error);
        throw error;
      } finally {
        setIsPending(false);
        options?.onSettled?.();
      }
    },
    [mutation]
  );

  return { mutate, isPending };
}

/**
 * Get verification instructions for a domain.
 *
 * Returns DNS TXT record information for domain verification.
 */
export function useGetVerificationInstructions(domainId: Id<'domains'> | undefined) {
  const providerId = useProviderId();

  if (providerId !== 'convex') {
    throw new Error(
      `[${providerId}] domains.getVerificationInstructions is not implemented. ` +
        `See docs/EDITIONING.md for self-host status.`
    );
  }

  const data = useQuery(
    api.domains.getVerificationInstructions,
    domainId ? { domainId } : 'skip'
  );
  const isLoading = data === undefined && domainId !== undefined;

  return { data, isLoading };
}
