'use client';

/**
 * Invite Link Hooks
 *
 * Hooks for invite link management.
 * Admin operations for creating and managing invite links.
 */

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { useProviderId } from '@/lib/provider';
import { useCallback, useState } from 'react';
import type { Id } from '@/../convex/_generated/dataModel';

/**
 * Create an invite link.
 *
 * Admin-only operation.
 */
export function useCreateInviteLink() {
  const providerId = useProviderId();
  const mutation = useMutation(api.inviteLinks.create);
  const [isPending, setIsPending] = useState(false);

  if (providerId !== 'convex') {
    throw new Error(
      `[${providerId}] inviteLinks.create is not implemented. ` +
        `See docs/EDITIONING.md for self-host status.`
    );
  }

  const mutate = useCallback(
    async (
      args: {
        workspaceId: Id<'workspaces'>;
        expiresInHours: number;
        scope:
          | { type: 'workspace' }
          | { type: 'channel'; channelId: Id<'channels'> };
        maxUses?: number;
      },
      options?: {
        onSuccess?: (result: { id: Id<'inviteLinks'>; code: string }) => void;
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
 * List all invite links for a workspace.
 *
 * Admin-only operation.
 */
export function useListInviteLinks(workspaceId: Id<'workspaces'>) {
  const providerId = useProviderId();

  if (providerId !== 'convex') {
    throw new Error(
      `[${providerId}] inviteLinks.list is not implemented. ` +
        `See docs/EDITIONING.md for self-host status.`
    );
  }

  const data = useQuery(api.inviteLinks.list, { workspaceId });
  const isLoading = data === undefined;

  return { data, isLoading };
}

/**
 * Revoke an invite link.
 *
 * Admin-only operation.
 */
export function useRevokeInviteLink() {
  const providerId = useProviderId();
  const mutation = useMutation(api.inviteLinks.revoke);
  const [isPending, setIsPending] = useState(false);

  if (providerId !== 'convex') {
    throw new Error(
      `[${providerId}] inviteLinks.revoke is not implemented. ` +
        `See docs/EDITIONING.md for self-host status.`
    );
  }

  const mutate = useCallback(
    async (
      args: { inviteLinkId: Id<'inviteLinks'> },
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
 * Validate an invite link for redemption.
 *
 * Public operation - validates before join attempt.
 */
export function useValidateInviteLink(code: string | undefined) {
  const providerId = useProviderId();

  if (providerId !== 'convex') {
    throw new Error(
      `[${providerId}] inviteLinks.validate is not implemented. ` +
        `See docs/EDITIONING.md for self-host status.`
    );
  }

  const data = useQuery(
    api.inviteLinks.validateForRedemption,
    code ? { code } : 'skip'
  );
  const isLoading = data === undefined && code !== undefined;

  return { data, isLoading };
}
