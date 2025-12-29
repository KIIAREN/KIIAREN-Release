import { useQuery } from 'convex/react';

import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';

interface UseGetDocsProps {
  workspaceId: Id<'workspaces'>;
  parentDocumentId?: Id<'docs'>;
}

export const useGetDocs = ({ workspaceId, parentDocumentId }: UseGetDocsProps) => {
  const data = useQuery(api.docs.list, { workspaceId, parentDocumentId });
  const isLoading = data === undefined;

  return { data, isLoading };
};
