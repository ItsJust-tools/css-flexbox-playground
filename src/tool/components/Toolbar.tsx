'use client';

import React from 'react';
import { generateCss, summaryText, type FlexboxState } from '../types';

interface ToolbarProps {
  state: FlexboxState;
  onChange: (next: FlexboxState) => void;
  onCopy?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ state, onChange, onCopy }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCss = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generateCss(state));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable; ignore
    }
  }, [state]);

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
      data-testid="flexbox-toolbar"
    >
      <div className="flex items-center gap-2" role="group" aria-label="Flexbox tool controls">
        <button
          type="button"
          onClick={handleCopyCss}
          data-testid="btn-copy-css"
          className="rounded-md bg-violet-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-violet-600"
        >
          {copied ? 'Copied!' : 'Copy CSS'}
        </button>
        {onCopy ? (
          <button
            type="button"
            onClick={onCopy}
            data-testid="btn-copy-result"
            className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Copy summary
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onChange({ ...state })}
          aria-hidden="true"
          tabIndex={-1}
          style={{ display: 'none' }}
        />
        <span className="text-xs text-gray-500 dark:text-gray-400">{summaryText(state)}</span>
      </div>
    </div>
  );
};

export default Toolbar;
