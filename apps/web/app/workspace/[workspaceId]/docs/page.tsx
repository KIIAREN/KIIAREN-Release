'use client';

import { FileText, Loader, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useCreateDoc } from '@/features/docs/api/use-create-doc';
import { useGetDocs } from '@/features/docs/api/use-get-docs';
import { useWorkspaceId } from '@/hooks/use-workspace-id';

export default function DocsPage() {
  const router = useRouter();
  const workspaceId = useWorkspaceId();

  const { data: docs, isLoading } = useGetDocs({ workspaceId });
  const { mutate: createDoc, isPending } = useCreateDoc();

  const handleCreateDoc = () => {
    createDoc(
      {
        title: 'Untitled',
        workspaceId,
      },
      {
        onSuccess: (docId) => {
          toast.success('Document created');
          if (docId) {
            router.push(`/workspace/${workspaceId}/docs/${docId}`);
          }
        },
        onError: () => {
          toast.error('Failed to create document');
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
          <h1 className="text-lg font-semibold">Documents</h1>
          <Button onClick={handleCreateDoc} disabled={isPending} size="sm">
            <Plus className="mr-2 size-4" />
            New Document
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {!docs || docs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-y-4 text-muted-foreground">
            <FileText className="size-12" />
            <p className="text-sm">No documents yet</p>
            <Button onClick={handleCreateDoc} disabled={isPending} variant="outline" size="sm">
              <Plus className="mr-2 size-4" />
              Create your first document
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {docs.map((doc: { _id: string; icon?: string; title: string; updatedAt: number }) => (
              <button
                key={doc._id}
                onClick={() => router.push(`/workspace/${workspaceId}/docs/${doc._id}`)}
                className="group flex flex-col gap-y-2 rounded-lg border bg-card p-4 text-left transition hover:bg-accent"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-x-2">
                    {doc.icon ? (
                      <span className="text-2xl">{doc.icon}</span>
                    ) : (
                      <FileText className="size-5 text-muted-foreground" />
                    )}
                    <h3 className="font-medium line-clamp-1">{doc.title}</h3>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Updated {new Date(doc.updatedAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
