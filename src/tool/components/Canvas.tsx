'use client';

import React from 'react';
import {
  generateCss,
  previewContainerStyle,
  previewItemStyle,
  type FlexItem,
  type FlexboxState,
} from '../types';

interface CanvasProps {
  state: FlexboxState;
  onChange?: (state: FlexboxState) => void;
}

const CONTAINER_BG = 'rgba(139, 92, 246, 0.08)';
const ITEM_BG = 'rgba(139, 92, 246, 0.25)';

const itemChipBase: React.CSSProperties = {
  padding: '20px 14px',
  borderRadius: 8,
  background: ITEM_BG,
  border: '1px solid rgba(139, 92, 246, 0.5)',
  color: '#4c1d95',
  fontWeight: 600,
  fontSize: 13,
  textAlign: 'center',
  minWidth: 60,
  minHeight: 48,
  boxSizing: 'border-box',
};

export const Canvas: React.FC<CanvasProps> = ({ state, onChange }) => {
  const selectedId = state.items[0]?.id ?? '';
  const containerStyle: React.CSSProperties = {
    ...previewContainerStyle(state),
    background: CONTAINER_BG,
    border: '2px dashed rgba(139, 92, 246, 0.5)',
    borderRadius: 10,
    padding: 12,
    minHeight: 220,
  };

  const handleSelect = (item: FlexItem) => {
    // Selecting reorders the item list so its controls appear first; onChange
    // is called with the same items (order preserved) to signal selection.
    if (!onChange) return;
    onChange({ ...state, items: state.items.map((it) => (it.id === item.id ? { ...it } : it)) });
  };

  return (
    <div className="p-4" data-testid="flexbox-canvas">
      <div
        data-testid="flex-preview"
        role="region"
        aria-label="Flexbox preview"
        style={containerStyle}
      >
        {state.items.map((item, index) => (
          <div
            key={item.id}
            data-testid="flex-item"
            data-item-id={item.id}
            onClick={() => handleSelect(item)}
            style={{
              ...itemChipBase,
              ...previewItemStyle(item),
              ...(item.id === selectedId ? { outline: '2px solid #7c3aed' } : {}),
            }}
            title={item.label}
          >
            {item.label}
            <span
              style={{ display: 'block', fontSize: 10, fontWeight: 400, color: '#6b21a8' }}
              data-testid="flex-item-index"
            >
              {index + 1}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Generated CSS</h3>
        </div>
        <pre
          data-testid="generated-css"
          className="max-h-72 overflow-auto rounded-md bg-gray-900 p-3 text-xs leading-relaxed text-gray-100"
        >
          {generateCss(state)}
        </pre>
      </div>
    </div>
  );
};

export default Canvas;
