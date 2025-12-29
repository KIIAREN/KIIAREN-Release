import { useMutation } from 'convex/react';
import { useCallback, useMemo, useState } from 'react';

import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';

type RequestType = {
  title: string;
  workspaceId: Id<'workspaces'>;
  parentDocumentId?: Id<'docs'>;
};

type ResponseType = Id<'docs'> | null;

type Options = {
  onSuccess?: (data: ResponseType) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  throwError?: boolean;
};

export const useCreateDoc = () => {
  const [data, setData] = useState<ResponseType>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<'success' | 'error' | 'settled' | 'pending' | null>(null);

  const isPending = useMemo(() => status === 'pending', [status]);
  const isSuccess = useMemo(() => status === 'success', [status]);
  const isError = useMemo(() => status === 'error', [status]);
  const isSettled = useMemo(() => status === 'settled', [status]);

  const mutation = useMutation(api.docs.create);

  const mutate = useCallback(
    async (values: RequestType, options?: Options) => {
      try {
        setData(null);
        setError(null);
        setStatus('pending');

        const response = await mutation(values);

        options?.onSuccess?.(response);

        setStatus('success');
        setData(response);

        return response;
      } catch (err) {
        const error = err as Error;

        setStatus('error');
        setError(error);

        options?.onError?.(error);

        if (options?.throwError) throw err;
      } finally {
        options?.onSettled?.();
        setStatus('settled');
      }
    },
    [mutation],
  );

  return { mutate, data, error, isPending, isSuccess, isError, isSettled };
};
