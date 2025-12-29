'use client';

import { Loader } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import type { Id } from '@/../convex/_generated/dataModel';
import { useGetBoard } from '@/features/boards/api/use-get-board';
import { useUpdateBoard } from '@/features/boards/api/use-update-board';

// Lazy load Excalidraw to avoid large bundle on initial load
const ExcalidrawWrapper = dynamic(() => import('@/components/whiteboard/excalidraw-wrapper').then((mod) => ({ default: mod.ExcalidrawWrapper })), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <Loader className="size-6 animate-spin text-muted-foreground" />
    </div>
  ),
});

export default function BoardPage() {
  const params = useParams();
  const boardId = useMemo(() => params?.boardId as Id<'boards'>, [params?.boardId]);

  const { data: board, isLoading } = useGetBoard({ id: boardId });
  const { mutate: updateBoard } = useUpdateBoard();

  const debouncedUpdate = useDebouncedCallback((excalidrawData: string) => {
    updateBoard({
      id: boardId,
      excalidrawData,
    });
  }, 750);

  const handleChange = (data: string) => {
    debouncedUpdate(data);
  };

  if (isLoading || !board) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-background p-4">
        <input
          type="text"
          defaultValue={board.title}
          onBlur={(e) => {
            if (e.target.value !== board.title) {
              updateBoard({ id: boardId, title: e.target.value });
            }
          }}
          className="w-full bg-transparent text-2xl font-bold outline-none"
          placeholder="Untitled Board"
        />
      </div>

      <div className="flex-1">
        <ExcalidrawWrapper initialData={board.excalidrawData} onChange={handleChange} />
      </div>
    </div>
  );
}
