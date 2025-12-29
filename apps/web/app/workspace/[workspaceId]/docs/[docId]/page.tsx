'use client';

import { Loader } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import type { Id } from '@/../convex/_generated/dataModel';
import { Editor } from '@/components/docs/editor';
import { useGetDoc } from '@/features/docs/api/use-get-doc';
import { useUpdateDoc } from '@/features/docs/api/use-update-doc';

export default function DocPage() {
  const params = useParams();
  const docId = useMemo(() => params?.docId as Id<'docs'>, [params?.docId]);

  const { data: doc, isLoading } = useGetDoc({ id: docId });
  const { mutate: updateDoc } = useUpdateDoc();

  const debouncedUpdate = useDebouncedCallback((content: string) => {
    updateDoc({
      id: docId,
      content,
    });
  }, 750);

  const handleEditorChange = (content: string) => {
    debouncedUpdate(content);
  };

  if (isLoading || !doc) {
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
          defaultValue={doc.title}
          onBlur={(e) => {
            if (e.target.value !== doc.title) {
              updateDoc({ id: docId, title: e.target.value });
            }
          }}
          className="w-full bg-transparent text-2xl font-bold outline-none"
          placeholder="Untitled"
        />
      </div>

      <div className="flex-1 overflow-auto p-4">
        <Editor onChange={handleEditorChange} initialContent={doc.content} />
      </div>
    </div>
  );
}
