'use client';

import { Excalidraw } from '@excalidraw/excalidraw';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExcalidrawImperativeAPI = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExcalidrawElement = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppState = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BinaryFiles = any;
import { useTheme } from 'next-themes';
import { useCallback, useState } from 'react';

interface ExcalidrawWrapperProps {
  initialData?: string;
  onChange: (data: string) => void;
}

export const ExcalidrawWrapper = ({ initialData, onChange }: ExcalidrawWrapperProps) => {
  const { resolvedTheme } = useTheme();
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);

  // Parse initial data
  const parsedData = initialData
    ? (() => {
        try {
          return JSON.parse(initialData);
        } catch {
          return { elements: [], appState: {}, files: {} };
        }
      })()
    : undefined;

  const handleChange = useCallback(
    (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
      const data = {
        elements,
        appState: {
          viewBackgroundColor: appState.viewBackgroundColor,
          currentItemStrokeColor: appState.currentItemStrokeColor,
          currentItemBackgroundColor: appState.currentItemBackgroundColor,
          currentItemFillStyle: appState.currentItemFillStyle,
          currentItemStrokeWidth: appState.currentItemStrokeWidth,
          currentItemRoughness: appState.currentItemRoughness,
          currentItemOpacity: appState.currentItemOpacity,
          currentItemFontFamily: appState.currentItemFontFamily,
          currentItemFontSize: appState.currentItemFontSize,
          currentItemTextAlign: appState.currentItemTextAlign,
          currentItemRoundness: appState.currentItemRoundness,
        },
        files,
      };

      onChange(JSON.stringify(data));
    },
    [onChange],
  );

  return (
    <div className="h-full w-full">
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={parsedData}
        onChange={handleChange}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      />
    </div>
  );
};
