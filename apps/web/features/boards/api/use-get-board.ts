import { useQuery } from 'convex/react';

import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';

interface UseGetBoardProps {
  id: Id<'boards'>;
}

export const useGetBoard = ({ id }: UseGetBoardProps) => {
  const data = useQuery(api.boards.getById, { id });
  const isLoading = data === undefined;

  return { data, isLoading };
};
