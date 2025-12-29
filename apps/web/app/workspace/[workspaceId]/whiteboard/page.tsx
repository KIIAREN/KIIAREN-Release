'use client';

import { Loader, Presentation, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useCreateBoard } from '@/features/boards/api/use-create-board';
import { useGetBoards } from '@/features/boards/api/use-get-boards';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

export default function WhiteboardPage() {
  const router = useRouter();
  const workspaceId = useWorkspaceId();

  const { data: boards, isLoading } = useGetBoards({ workspaceId });
  const { mutate: createBoard, isPending } = useCreateBoard();

  const handleCreateBoard = () => {
    createBoard(
      {
        title: 'Untitled Board',
        workspaceId,
      },
      {
        onSuccess: (boardId) => {
          toast.success('Board created');
          if (boardId) {
            router.push(`/workspace/${workspaceId}/whiteboard/${boardId}`);
          }
        },
        onError: () => {
          toast.error('Failed to create board');
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Whiteboards</h1>
          <Button onClick={handleCreateBoard} disabled={isPending} size="sm">
            <Plus className="mr-2 size-4" />
            New Board
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {!boards || boards.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-y-4 text-muted-foreground">
            <Presentation className="size-12" />
            <p className="text-sm">No whiteboards yet</p>
            <Button onClick={handleCreateBoard} disabled={isPending} variant="outline" size="sm">
              <Plus className="mr-2 size-4" />
              Create your first board
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board: { _id: string; title: string; updatedAt: number }) => (
              <button
                key={board._id}
                onClick={() => router.push(`/workspace/${workspaceId}/whiteboard/${board._id}`)}
                className="group flex flex-col gap-y-2 rounded-lg border bg-card p-4 text-left transition hover:bg-accent"
              >
                <div className="flex items-center gap-x-2">
                  <Presentation className="size-5 text-muted-foreground" />
                  <h3 className="font-medium line-clamp-1">{board.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Updated {new Date(board.updatedAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
