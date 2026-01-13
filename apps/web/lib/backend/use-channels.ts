'use client';

/**
 * Channel Hooks
 *
 * Provider-aware hooks for channel operations.
 * Currently delegates to Convex; will support self-host when implemented.
 */

import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { useProviderId } from '@/lib/provider';
import { useMemo } from 'react';
import type { Id } from '@/../convex/_generated/dataModel';
import type { Channel } from '@kiiaren/core';

/**
 * Get all channels for a workspace.
 */
export function useGetChannels(workspaceId: Id<'workspaces'>) {
  const providerId = useProviderId();

  if (providerId !== 'convex') {
    throw new Error(
      `[${providerId}] channels.get is not implemented. ` +
        `See docs/EDITIONING.md for self-host status.`
    );
  }

  const data = useQuery(api.channels.get, { workspaceId });
  const isLoading = data === undefined;

  // Transform to provider-agnostic type
  const channels: Channel[] | undefined = useMemo(() => {
    if (!data) return undefined;
    return data.map((c) => ({
      id: c._id,
      workspaceId: c.workspaceId,
      name: c.name,
      createdAt: c._creationTime,
    }));
  }, [data]);

  return { data: channels, isLoading };
}

/**
 * Get a single channel by ID.
 */
export function useGetChannel(id: Id<'channels'>) {
  const providerId = useProviderId();

  if (providerId !== 'convex') {
    throw new Error(
      `[${providerId}] channels.getById is not implemented. ` +
        `See docs/EDITIONING.md for self-host status.`
    );
  }

  const data = useQuery(api.channels.getById, { id });
  const isLoading = data === undefined;

  const channel: Channel | null | undefined = useMemo(() => {
    if (data === undefined) return undefined;
    if (data === null) return null;
    return {
      id: data._id,
      workspaceId: data.workspaceId,
      name: data.name,
      createdAt: data._creationTime,
    };
  }, [data]);

  return { data: channel, isLoading };
}
