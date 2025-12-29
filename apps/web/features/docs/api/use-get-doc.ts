import { useQuery } from 'convex/react';

import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';

interface UseGetDocProps {
  id: Id<'docs'>;
}

export const useGetDoc = ({ id }: UseGetDocProps) => {
  const data = useQuery(api.docs.getById, { id });
  const isLoading = data === undefined;

  return { data, isLoading };
};
