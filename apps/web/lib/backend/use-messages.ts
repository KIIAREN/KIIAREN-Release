'use client';

/**
 * Message Hooks
 *
 * Provider-aware hooks for message operations.
 * Currently delegates to Convex; will support self-host when implemented.
 */

import { usePaginatedQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { useProviderId } from '@/lib/provider';
import { useCallback, useMemo, useState } from 'react';
import type { Id } from '@/../convex/_generated/dataModel';

const BATCH_SIZE = 20;

interface UseGetMessagesProps {
  channelId?: Id<'channels'>;
  conversationId?: Id<'conversations'>;
  parentMessageId?: Id<'messages'>;
}

export type GetMessagesReturnType = (typeof api.messages.get._returnType)['page'];

/**
 * Get messages with pagination.
 *
 * Supports:
 * - Channel messages
 * - Conversation (DM) messages
 * - Thread messages (via parentMessageId)
 */
export function useGetMessages({
  channelId,
  conversationId,
  parentMessageId,
}: UseGetMessagesProps) {
  const providerId = useProviderId();

  if (providerId !== 'convex') {
    throw new Error(
      `[${providerId}] messages.get is not implemented. ` +
        `See docs/EDITIONING.md for self-host status.`
    );
  }

  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.get,
    { channelId, conversationId, parentMessageId },
    { initialNumItems: BATCH_SIZE }
  );

  return {
    results,
    status,
    loadMore: () => loadMore(BATCH_SIZE),
  };
}

type CreateMessageInput = {
  body: string;
  image?: Id<'_storage'>;
  workspaceId: Id<'workspaces'>;
  channelId?: Id<'channels'>;
  conversationId?: Id<'conversations'>;
  parentMessageId?: Id<'messages'>;
};

type CreateMessageOptions = {
  onSuccess?: (data: Id<'messages'> | null) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  throwError?: boolean;
};

/**
 * Create a new message.
 *
 * Supports:
 * - Channel messages
 * - Conversation (DM) messages
 * - Thread replies (via parentMessageId)
 * - Image attachments
 */
export function useCreateMessage() {
  const providerId = useProviderId();

  if (providerId !== 'convex') {
    throw new Error(
      `[${providerId}] messages.create is not implemented. ` +
        `See docs/EDITIONING.md for self-host status.`
    );
  }

  const [data, setData] = useState<Id<'messages'> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<
    'success' | 'error' | 'settled' | 'pending' | null
  >(null);

  const isPending = useMemo(() => status === 'pending', [status]);
  const isSuccess = useMemo(() => status === 'success', [status]);
  const isError = useMemo(() => status === 'error', [status]);
  const isSettled = useMemo(() => status === 'settled', [status]);

  const mutation = useMutation(api.messages.create);

  const mutate = useCallback(
    async (values: CreateMessageInput, options?: CreateMessageOptions) => {
      try {
        setData(null);
        setError(null);
        setStatus('pending');

        const response = await mutation(values);
        setData(response);
        setStatus('success');
        options?.onSuccess?.(response);

        return response;
      } catch (err) {
        setError(err as Error);
        setStatus('error');
        options?.onError?.(err as Error);

        if (options?.throwError !== false) throw err;
        return null;
      } finally {
        setStatus('settled');
        options?.onSettled?.();
      }
    },
    [mutation]
  );

  return {
    mutate,
    data,
    error,
    isPending,
    isError,
    isSuccess,
    isSettled,
  };
}
