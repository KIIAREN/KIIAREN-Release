'use client';

/**
 * Workspace Hooks
 *
 * Provider-aware hooks for workspace operations.
 * Currently delegates to Convex; will support self-host when implemented.
 */

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { useProviderId } from '@/lib/provider';
import { useCallback, useMemo, useState } from 'react';
import type { Id } from '@/../convex/_generated/dataModel';
import type { Workspace } from '@kiiaren/core';

/**
 * Get all workspaces for the current user.
 *
 * Provider-aware: Currently uses Convex, will support self-host when implemented.
 */
export function useGetWorkspaces() {
  const providerId = useProviderId();

  if (providerId !== 'convex') {
    throw new Error(
      `[${providerId}] workspaces.get is not implemented. ` +
        `See docs/EDITIONING.md for self-host status.`
    );
  }

  const data = useQuery(api.workspaces.get);
  const isLoading = data === undefined;

  // Transform to provider-agnostic type
  const workspaces: Workspace[] | undefined = useMemo(() => {
    if (!data) return undefined;
    return data.map((w) => ({
      id: w._id,
      name: w.name,
      ownerId: w.userId,
      joinCode: w.joinCode,
      createdAt: w._creationTime,
      domainVerified: w.domainVerified ?? false,
      joinCodeEnabled: w.joinCodeEnabled ?? true,
    }));
  }, [data]);

  return { data: workspaces, isLoading };
}

/**
 * Get a single workspace by ID.
 */
export function useGetWorkspace(id: Id<'workspaces'>) {
  const providerId = useProviderId();

  if (providerId !== 'convex') {
    throw new Error(
      `[${providerId}] workspaces.getById is not implemented. ` +
        `See docs/EDITIONING.md for self-host status.`
    );
  }

  const data = useQuery(api.workspaces.getById, { id });
  const isLoading = data === undefined;

  const workspace: Workspace | null | undefined = useMemo(() => {
    if (data === undefined) return undefined;
    if (data === null) return null;
    return {
      id: data._id,
      name: data.name,
      ownerId: data.userId,
      joinCode: data.joinCode,
      createdAt: data._creationTime,
      domainVerified: data.domainVerified ?? false,
      joinCodeEnabled: data.joinCodeEnabled ?? true,
    };
  }, [data]);

  return { data: workspace, isLoading };
}

/**
 * Create a new workspace.
 */
export function useCreateWorkspace() {
  const providerId = useProviderId();
  const mutation = useMutation(api.workspaces.create);
  const [isPending, setIsPending] = useState(false);

  if (providerId !== 'convex') {
    throw new Error(
      `[${providerId}] workspaces.create is not implemented. ` +
        `See docs/EDITIONING.md for self-host status.`
    );
  }

  const mutate = useCallback(
    async (
      { name }: { name: string },
      options?: {
        onSuccess?: (data: Id<'workspaces'>) => void;
        onError?: (error: Error) => void;
        onSettled?: () => void;
      }
    ) => {
      setIsPending(true);
      try {
        const result = await mutation({ name });
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
 * Join a workspace.
 *
 * Supports:
 * - Join codes (when domain not verified)
 * - Invite links (when domain verified)
 * - Auto-join (when email domain matches verified workspace domain)
 */
export function useJoinWorkspace() {
  const providerId = useProviderId();
  const mutation = useMutation(api.workspaces.join);
  const [isPending, setIsPending] = useState(false);

  if (providerId !== 'convex') {
    throw new Error(
      `[${providerId}] workspaces.join is not implemented. ` +
        `See docs/EDITIONING.md for self-host status.`
    );
  }

  const mutate = useCallback(
    async (
      args: {
        workspaceId: Id<'workspaces'>;
        joinCode?: string;
        inviteCode?: string;
      },
      options?: {
        onSuccess?: (data: Id<'workspaces'>) => void;
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
