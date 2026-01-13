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
 * Get workspace info (name and membership status).
 *
 * Returns basic workspace information and whether the current user is a member.
 * Used for join page validation.
 */
export function useGetWorkspaceInfo(id: Id<'workspaces'>) {
  const providerId = useProviderId();

  if (providerId !== 'convex') {
    throw new Error(
      `[${providerId}] workspaces.getInfoById is not implemented. ` +
        `See docs/EDITIONING.md for self-host status.`
    );
  }

  const data = useQuery(api.workspaces.getInfoById, { id });
  const isLoading = data === undefined;

  return { data, isLoading };
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
  const [data, setData] = useState<Id<'workspaces'> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<'success' | 'error' | 'settled' | 'pending' | null>(null);

  const isPending = useMemo(() => status === 'pending', [status]);
  const isSuccess = useMemo(() => status === 'success', [status]);
  const isError = useMemo(() => status === 'error', [status]);
  const isSettled = useMemo(() => status === 'settled', [status]);

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
        joinCode: string;
      },
      options?: {
        onSuccess?: (data: Id<'workspaces'> | null) => void;
        onError?: (error: Error) => void;
        onSettled?: () => void;
        throwError?: boolean;
      }
    ) => {
      try {
        setData(null);
        setError(null);
        setStatus('pending');

        const result = await mutation(args);
        setData(result);
        setStatus('success');
        options?.onSuccess?.(result);
        return result;
      } catch (error) {
        setStatus('error');
        setError(error as Error);
        options?.onError?.(error as Error);

        if (!options?.throwError) throw error;
      } finally {
        setStatus('settled');
        options?.onSettled?.();
      }
    },
    [mutation]
  );

  return { mutate, data, error, isPending, isSuccess, isError, isSettled };
}

/**
 * Update a workspace.
 *
 * Allows workspace name updates (admin only).
 */
export function useUpdateWorkspace() {
  const providerId = useProviderId();
  const mutation = useMutation(api.workspaces.update);
  const [data, setData] = useState<Id<'workspaces'> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<'success' | 'error' | 'settled' | 'pending' | null>(null);

  const isPending = useMemo(() => status === 'pending', [status]);
  const isSuccess = useMemo(() => status === 'success', [status]);
  const isError = useMemo(() => status === 'error', [status]);
  const isSettled = useMemo(() => status === 'settled', [status]);

  if (providerId !== 'convex') {
    throw new Error(
      `[${providerId}] workspaces.update is not implemented. ` +
        `See docs/EDITIONING.md for self-host status.`
    );
  }

  const mutate = useCallback(
    async (
      values: { id: Id<'workspaces'>; name: string },
      options?: {
        onSuccess?: (data: Id<'workspaces'> | null) => void;
        onError?: (error: Error) => void;
        onSettled?: () => void;
        throwError?: boolean;
      }
    ) => {
      try {
        setData(null);
        setError(null);
        setStatus('pending');

        const result = await mutation(values);
        setData(result);
        setStatus('success');
        options?.onSuccess?.(result);
        return result;
      } catch (error) {
        setStatus('error');
        setError(error as Error);
        options?.onError?.(error as Error);

        if (!options?.throwError) throw error;
      } finally {
        setStatus('settled');
        options?.onSettled?.();
      }
    },
    [mutation]
  );

  return { mutate, data, error, isPending, isSuccess, isError, isSettled };
}

/**
 * Remove (delete) a workspace.
 *
 * Permanently deletes a workspace and all its data (admin only).
 */
export function useRemoveWorkspace() {
  const providerId = useProviderId();
  const mutation = useMutation(api.workspaces.remove);
  const [data, setData] = useState<Id<'workspaces'> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<'success' | 'error' | 'settled' | 'pending' | null>(null);

  const isPending = useMemo(() => status === 'pending', [status]);
  const isSuccess = useMemo(() => status === 'success', [status]);
  const isError = useMemo(() => status === 'error', [status]);
  const isSettled = useMemo(() => status === 'settled', [status]);

  if (providerId !== 'convex') {
    throw new Error(
      `[${providerId}] workspaces.remove is not implemented. ` +
        `See docs/EDITIONING.md for self-host status.`
    );
  }

  const mutate = useCallback(
    async (
      values: { id: Id<'workspaces'> },
      options?: {
        onSuccess?: (data: Id<'workspaces'> | null) => void;
        onError?: (error: Error) => void;
        onSettled?: () => void;
        throwError?: boolean;
      }
    ) => {
      try {
        setData(null);
        setError(null);
        setStatus('pending');

        const result = await mutation(values);
        setData(result);
        setStatus('success');
        options?.onSuccess?.(result);
        return result;
      } catch (error) {
        setStatus('error');
        setError(error as Error);
        options?.onError?.(error as Error);

        if (!options?.throwError) throw error;
      } finally {
        setStatus('settled');
        options?.onSettled?.();
      }
    },
    [mutation]
  );

  return { mutate, data, error, isPending, isSuccess, isError, isSettled };
}

/**
 * Generate a new join code for a workspace.
 *
 * Invalidates the old join code and creates a new one (admin only).
 */
export function useNewJoinCode() {
  const providerId = useProviderId();
  const mutation = useMutation(api.workspaces.newJoinCode);
  const [data, setData] = useState<Id<'workspaces'> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<'success' | 'error' | 'settled' | 'pending' | null>(null);

  const isPending = useMemo(() => status === 'pending', [status]);
  const isSuccess = useMemo(() => status === 'success', [status]);
  const isError = useMemo(() => status === 'error', [status]);
  const isSettled = useMemo(() => status === 'settled', [status]);

  if (providerId !== 'convex') {
    throw new Error(
      `[${providerId}] workspaces.newJoinCode is not implemented. ` +
        `See docs/EDITIONING.md for self-host status.`
    );
  }

  const mutate = useCallback(
    async (
      values: { workspaceId: Id<'workspaces'> },
      options?: {
        onSuccess?: (data: Id<'workspaces'> | null) => void;
        onError?: (error: Error) => void;
        onSettled?: () => void;
        throwError?: boolean;
      }
    ) => {
      try {
        setData(null);
        setError(null);
        setStatus('pending');

        const result = await mutation(values);
        setData(result);
        setStatus('success');
        options?.onSuccess?.(result);
        return result;
      } catch (error) {
        setStatus('error');
        setError(error as Error);
        options?.onError?.(error as Error);

        if (!options?.throwError) throw error;
      } finally {
        setStatus('settled');
        options?.onSettled?.();
      }
    },
    [mutation]
  );

  return { mutate, data, error, isPending, isSuccess, isError, isSettled };
}
