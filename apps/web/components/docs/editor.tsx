'use client';

import { BlockNoteEditor, PartialBlock } from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

export const Editor = ({ onChange, initialContent, editable = true }: EditorProps) => {
  const { resolvedTheme } = useTheme();

  const initialBlocks = useMemo(() => {
    if (!initialContent) return undefined;
    try {
      return JSON.parse(initialContent) as PartialBlock[];
    } catch {
      return undefined;
    }
  }, [initialContent]);

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: initialBlocks,
  });

  const handleEditorChange = () => {
    onChange(JSON.stringify(editor.document, null, 2));
  };

  return (
    <div className="w-full">
      <BlockNoteView
        editable={editable}
        editor={editor}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        onChange={handleEditorChange}
      />
    </div>
  );
};
