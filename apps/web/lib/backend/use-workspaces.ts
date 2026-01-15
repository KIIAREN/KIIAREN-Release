'use client';

/**
 * Workspace Hooks
 *
 * Canonical provider-agnostic hooks for workspace operations.
 * Uses the BackendProvider interface internally, supporting both
 * Convex (via hooks) and self-host (via async methods).
 *
 * @example
 * ```tsx
 * import { useGetWorkspaces, useCreateWorkspace } from '@/lib/backend';
 *
 * function WorkspaceList() {
 *   const { data: workspaces, isLoading } = useGetWorkspaces();
 *   const { mutate: createWorkspace, isPending } = useCreateWorkspace();
 *
 *   // Works with any provider (Convex, self-host, etc.)
 * }
 * ```
 */

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { useBackend, useProviderId } from '@/lib/provider';
import { getConvexClient } from '@/lib/provider/convex-adapter';
import { useCallback, useMemo, useState, useEffect } from 'react';
import type { Id } from '@/../convex/_generated/dataModel';
import type { Workspace, EntityId } from '@kiiaren/core';
import { useConvexQuery, useConvexMutation } from './adapters/convex-adapter';

/**
 * Transform Convex workspace to provider-agnostic type.
 */
function transformWorkspace(w: {
  _id: Id<'workspaces'>;
  name: string;
  userId: Id<'users'>;
  joinCode: string;
  _creationTime: number;
  domainVerified?: boolean;
  joinCodeEnabled?: boolean;
}): Workspace {
  return {
    id: w._id,
    name: w.name,
    ownerId: w.userId,
    joinCode: w.joinCode,
    createdAt: w._creationTime,
    domainVerified: w.domainVerified ?? false,
    joinCodeEnabled: w.joinCodeEnabled ?? true,
  };
}

/**
 * Get all workspaces for the current user.
 *
 * Provider-agnostic: Works with Convex (default) and self-host (when implemented).
 *
 * @returns Workspace list with loading state
 */
export function useGetWorkspaces() {
  const { provider } = useBackend();
  const providerId = useProviderId();

  // Always call hooks unconditionally (React Rules of Hooks)
  const convexResult = useConvexQuery<
    Array<{
      _id: Id<'workspaces'>;
      name: string;
      userId: Id<'users'>;
      joinCode: string;
      _creationTime: number;
      domainVerified?: boolean;
      joinCodeEnabled?: boolean;
    }>,
    Workspace[]
  >(
    api.workspaces.get,
    providerId === 'convex' ? undefined : 'skip',
    (data) => {
      if (!data) return undefined;
      return data.map(transformWorkspace);
    }
  );

  // Self-host implementation (uses async provider methods)
  const [workspaces, setWorkspaces] = useState<Workspace[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only run for self-host provider
    if (providerId === 'convex') {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadWorkspaces() {
      try {
        setIsLoading(true);
        // Get current user ID from provider
        const user = await provider.auth.getCurrentUser();
        if (!user || cancelled) return;

        // Fetch workspaces via provider
        const data = await provider.persistence.workspace.getByUserId(user.id);
        if (!cancelled) {
          setWorkspaces(data);
        }
      } catch (error) {
        console.error('[useGetWorkspaces] Error loading workspaces:', error);
        if (!cancelled) {
          setWorkspaces([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadWorkspaces();

    return () => {
      cancelled = true;
    };
  }, [provider, providerId]);

  // Return appropriate implementation based on provider
  if (providerId === 'convex') {
    return convexResult;
  }

  return { data: workspaces, isLoading };
}

/**
 * Get a single workspace by ID.
 *
 * Provider-agnostic: Works with Convex (default) and self-host (when implemented).
 *
 * @param id - Workspace ID
 * @returns Workspace with loading state
 */
export function useGetWorkspace(id: EntityId) {
  const { provider } = useBackend();
  const providerId = useProviderId();

  // Always call hooks unconditionally (React Rules of Hooks)
  const convexResult = useConvexQuery<
    {
      _id: Id<'workspaces'>;
      name: string;
      userId: Id<'users'>;
      joinCode: string;
      _creationTime: number;
      domainVerified?: boolean;
      joinCodeEnabled?: boolean;
    } | null,
    Workspace | null
  >(
    api.workspaces.getById,
    providerId === 'convex' ? { id: id as Id<'workspaces'> } : 'skip',
    (data) => {
      if (data === undefined) return undefined;
      if (data === null) return null;
      return transformWorkspace(data);
    }
  );

  // Self-host implementation
  const [workspace, setWorkspace] = useState<Workspace | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only run for self-host provider
    if (providerId === 'convex') {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadWorkspace() {
      try {
        setIsLoading(true);
        const data = await provider.persistence.workspace.get(id);
        if (!cancelled) {
          setWorkspace(data);
        }
      } catch (error) {
        console.error('[useGetWorkspace] Error loading workspace:', error);
        if (!cancelled) {
          setWorkspace(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadWorkspace();

    return () => {
      cancelled = true;
    };
  }, [provider, id, providerId]);

  // Return appropriate implementation based on provider
  if (providerId === 'convex') {
    return convexResult;
  }

  return { data: workspace, isLoading };
}

/**
 * Get workspace info by ID (includes member count, channel count, etc.).
 *
 * Provider-agnostic: Works with Convex (default) and self-host (when implemented).
 *
 * @param id - Workspace ID
 * @returns Workspace info with loading state
 */
export function useGetWorkspaceInfo(id: EntityId) {
  const { provider } = useBackend();
  const providerId = useProviderId();

  // Always call hooks unconditionally (React Rules of Hooks)
  const convexResult = useConvexQuery(
    api.workspaces.getInfoById,
    providerId === 'convex' ? { id: id as Id<'workspaces'> } : 'skip',
    (data) => data
  );

  // Self-host implementation - would need to aggregate data
  const [info, setInfo] = useState<any | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only run for self-host provider
    if (providerId === 'convex') {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadWorkspaceInfo() {
      try {
        setIsLoading(true);
        const workspace = await provider.persistence.workspace.get(id);
        if (!cancelled && workspace) {
          // For self-host, we'd need to aggregate member/channel counts
          // For now, return basic workspace info
          setInfo(workspace);
        }
      } catch (error) {
        console.error('[useGetWorkspaceInfo] Error loading workspace info:', error);
        if (!cancelled) {
          setInfo(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadWorkspaceInfo();

    return () => {
      cancelled = true;
    };
  }, [provider, id, providerId]);

  // Return appropriate implementation based on provider
  if (providerId === 'convex') {
    return convexResult;
  }

  return { data: info, isLoading };
}

/**
 * Create a new workspace.
 *
 * Provider-agnostic: Works with Convex (default) and self-host (when implemented).
 *
 * @example
 * ```tsx
 * const { mutate: createWorkspace, isPending } = useCreateWorkspace();
 *
 * await createWorkspace({ name: 'My Workspace' }, {
 *   onSuccess: (id) => console.log('Created:', id),
 *   onError: (err) => console.error('Failed:', err),
 * });
 * ```
 */
export function useCreateWorkspace() {
  const { provider } = useBackend();
  const providerId = useProviderId();

  // Always call hooks unconditionally (React Rules of Hooks)
  const convexMutation = useConvexMutation<
    { name: string },
    Id<'workspaces'>
  >(api.workspaces.create);

  // Self-host implementation
  const [isPending, setIsPending] = useState(false);

  const selfHostMutate = useCallback(
    async (
      { name }: { name: string },
      options?: {
        onSuccess?: (data: EntityId) => void;
        onError?: (error: Error) => void;
        onSettled?: () => void;
      }
    ) => {
      setIsPending(true);
      try {
        const result = await provider.persistence.workspace.create(name);
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
    [provider]
  );

  // Return appropriate implementation based on provider
  if (providerId === 'convex') {
    return {
      mutate: async (
        args: { name: string },
        options?: {
          onSuccess?: (data: EntityId) => void;
          onError?: (error: Error) => void;
          onSettled?: () => void;
        }
      ) => {
        try {
          const result = await convexMutation.mutate(args);
          options?.onSuccess?.(result);
          return result;
        } catch (error) {
          options?.onError?.(error as Error);
          throw error;
        } finally {
          options?.onSettled?.();
        }
      },
      isPending: convexMutation.isPending,
    };
  }

  return { mutate: selfHostMutate, isPending };
}

/**
 * Join a workspace.
 *
 * Supports:
 * - Join codes (when domain not verified)
 * - Invite links (when domain verified)
 * - Auto-join (when email domain matches verified workspace domain)
 *
 * Provider-agnostic: Works with Convex (default) and self-host (when implemented).
 */
export function useJoinWorkspace() {
  const { provider } = useBackend();
  const providerId = useProviderId();

  // Always call hooks unconditionally (React Rules of Hooks)
  const convexMutation = useConvexMutation<
    {
      workspaceId: Id<'workspaces'>;
      joinCode?: string;
      inviteCode?: string;
    },
    Id<'workspaces'>
  >(api.workspaces.join);

  // Self-host implementation
  const [isPending, setIsPending] = useState(false);

  const selfHostMutate = useCallback(
    async (
      args: {
        workspaceId: EntityId;
        joinCode?: string;
        inviteCode?: string;
      },
      options?: {
        onSuccess?: (data: EntityId) => void;
        onError?: (error: Error) => void;
        onSettled?: () => void;
      }
    ) => {
      setIsPending(true);
      try {
        let result: EntityId;
        if (args.joinCode) {
          result = await provider.persistence.workspace.join(args.joinCode);
        } else if (args.inviteCode) {
          result = await provider.persistence.invite.redeem(args.inviteCode);
        } else {
          throw new Error('Either joinCode or inviteCode must be provided');
        }
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
    [provider]
  );

  // Return appropriate implementation based on provider
  if (providerId === 'convex') {
    return {
      mutate: async (
        args: {
          workspaceId: EntityId;
          joinCode?: string;
          inviteCode?: string;
        },
        options?: {
          onSuccess?: (data: EntityId) => void;
          onError?: (error: Error) => void;
          onSettled?: () => void;
        }
      ) => {
        try {
          const result = await convexMutation.mutate({
            ...args,
            workspaceId: args.workspaceId as Id<'workspaces'>,
          });
          options?.onSuccess?.(result);
          return result;
        } catch (error) {
          options?.onError?.(error as Error);
          throw error;
        } finally {
          options?.onSettled?.();
        }
      },
      isPending: convexMutation.isPending,
    };
  }

  return { mutate: selfHostMutate, isPending };
}

/**
 * Update workspace name.
 *
 * Provider-agnostic: Works with Convex (default) and self-host (when implemented).
 */
export function useUpdateWorkspace() {
  const { provider } = useBackend();
  const providerId = useProviderId();

  // Always call hooks unconditionally (React Rules of Hooks)
  const convexMutation = useConvexMutation<
    { id: Id<'workspaces'>; name: string },
    void
  >(api.workspaces.update);

  // Self-host implementation
  const [isPending, setIsPending] = useState(false);

  const selfHostMutate = useCallback(
    async (
      args: { id: EntityId; name: string },
      options?: {
        onSuccess?: () => void;
        onError?: (error: Error) => void;
        onSettled?: () => void;
      }
    ) => {
      setIsPending(true);
      try {
        await provider.persistence.workspace.update(args.id, { name: args.name });
        options?.onSuccess?.();
      } catch (error) {
        options?.onError?.(error as Error);
        throw error;
      } finally {
        setIsPending(false);
        options?.onSettled?.();
      }
    },
    [provider]
  );

  // Return appropriate implementation based on provider
  if (providerId === 'convex') {
    return {
      mutate: async (
        args: { id: EntityId; name: string },
        options?: {
          onSuccess?: () => void;
          onError?: (error: Error) => void;
          onSettled?: () => void;
        }
      ) => {
        try {
          await convexMutation.mutate({
            id: args.id as Id<'workspaces'>,
            name: args.name,
          });
          options?.onSuccess?.();
        } catch (error) {
          options?.onError?.(error as Error);
          throw error;
        } finally {
          options?.onSettled?.();
        }
      },
      isPending: convexMutation.isPending,
    };
  }

  return { mutate: selfHostMutate, isPending };
}

/**
 * Remove (delete) a workspace.
 *
 * Provider-agnostic: Works with Convex (default) and self-host (when implemented).
 */
export function useRemoveWorkspace() {
  const { provider } = useBackend();
  const providerId = useProviderId();

  // Always call hooks unconditionally (React Rules of Hooks)
  const convexMutation = useConvexMutation<
    { id: Id<'workspaces'> },
    Id<'workspaces'>
  >(api.workspaces.remove);

  // Self-host implementation
  const [isPending, setIsPending] = useState(false);

  const selfHostMutate = useCallback(
    async (
      args: { id: EntityId },
      options?: {
        onSuccess?: () => void;
        onError?: (error: Error) => void;
        onSettled?: () => void;
      }
    ) => {
      setIsPending(true);
      try {
        await provider.persistence.workspace.remove(args.id);
        options?.onSuccess?.();
      } catch (error) {
        options?.onError?.(error as Error);
        throw error;
      } finally {
        setIsPending(false);
        options?.onSettled?.();
      }
    },
    [provider]
  );

  // Return appropriate implementation based on provider
  if (providerId === 'convex') {
    return {
      mutate: async (
        args: { id: EntityId },
        options?: {
          onSuccess?: () => void;
          onError?: (error: Error) => void;
          onSettled?: () => void;
        }
      ) => {
        try {
          await convexMutation.mutate({ id: args.id as Id<'workspaces'> });
          options?.onSuccess?.();
        } catch (error) {
          options?.onError?.(error as Error);
          throw error;
        } finally {
          options?.onSettled?.();
        }
      },
      isPending: convexMutation.isPending,
    };
  }

  return { mutate: selfHostMutate, isPending };
}

/**
 * Regenerate join code for a workspace.
 *
 * Provider-agnostic: Works with Convex (default) and self-host (when implemented).
 */
export function useRegenerateJoinCode() {
  const { provider } = useBackend();
  const providerId = useProviderId();

  // Always call hooks unconditionally (React Rules of Hooks)
  const convexMutation = useConvexMutation<
    { workspaceId: Id<'workspaces'> },
    Id<'workspaces'>
  >(api.workspaces.newJoinCode);

  // Self-host implementation
  const [isPending, setIsPending] = useState(false);

  const selfHostMutate = useCallback(
    async (
      args: { workspaceId: EntityId },
      options?: {
        onSuccess?: (joinCode: string) => void;
        onError?: (error: Error) => void;
        onSettled?: () => void;
      }
    ) => {
      setIsPending(true);
      try {
        const joinCode = await provider.persistence.workspace.regenerateJoinCode(
          args.workspaceId
        );
        options?.onSuccess?.(joinCode);
        return joinCode;
      } catch (error) {
        options?.onError?.(error as Error);
        throw error;
      } finally {
        setIsPending(false);
        options?.onSettled?.();
      }
    },
    [provider]
  );

  // Return appropriate implementation based on provider
  if (providerId === 'convex') {
    return {
      mutate: async (
        args: { workspaceId: EntityId },
        options?: {
          onSuccess?: (joinCode: string) => void;
          onError?: (error: Error) => void;
          onSettled?: () => void;
        }
      ) => {
        try {
          // Convex mutation returns workspaceId, so we need to fetch the workspace
          // to get the new join code
          await convexMutation.mutate({ workspaceId: args.workspaceId as Id<'workspaces'> });
          
          // Fetch the workspace to get the updated join code
          const client = getConvexClient();
          const workspace = await client.query(api.workspaces.getById, {
            id: args.workspaceId as Id<'workspaces'>,
          });
          
          if (!workspace) {
            throw new Error('Workspace not found after regenerating join code');
          }
          
          options?.onSuccess?.(workspace.joinCode);
        } catch (error) {
          options?.onError?.(error as Error);
          throw error;
        } finally {
          options?.onSettled?.();
        }
      },
      isPending: convexMutation.isPending,
    };
  }

  return { mutate: selfHostMutate, isPending };
}


/**
 * Generate a new join code for a workspace.
 *
 * Invalidates the old join code and creates a new one (admin only).
 * 
 * @deprecated Use `useRegenerateJoinCode` instead. This is kept for backward compatibility.
 */
export function useNewJoinCode() {
  const { mutate: regenerateJoinCode, isPending } = useRegenerateJoinCode();

  return {
    mutate: async (
      values: { workspaceId: Id<'workspaces'> },
      options?: {
        onSuccess?: (data: Id<'workspaces'> | null) => void;
        onError?: (error: Error) => void;
        onSettled?: () => void;
        throwError?: boolean;
      }
    ) => {
      try {
        // Don't pass onError to avoid double invocation - handle it in outer catch
        await regenerateJoinCode(
          { workspaceId: values.workspaceId },
          {
            onSuccess: () => options?.onSuccess?.(values.workspaceId),
            onSettled: options?.onSettled,
          }
        );
        return values.workspaceId;
      } catch (error) {
        // Only call onError once here (Bug 2 fix)
        options?.onError?.(error as Error);
        if (options?.throwError !== false) throw error;
        return null;
      }
    },
    data: null as Id<'workspaces'> | null,
    error: null as Error | null,
    isPending,
    isSuccess: false,
    isError: false,
    isSettled: !isPending,
  };
}
