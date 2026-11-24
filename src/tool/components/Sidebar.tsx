'use client';

import React from 'react';
import {
  DEFAULT_STATE,
  MAX_ITEMS,
  MIN_ITEMS,
  createItem,
  type AlignContent,
  type AlignItems,
  type AlignSelf,
  type FlexDirection,
  type FlexItem,
  type FlexWrap,
  type FlexboxState,
  type JustifyContent,
} from '../types';

interface SidebarProps {
  state: FlexboxState;
  onChange: (next: FlexboxState) => void;
}

const PRESETS: { name: string; label: string; state: Partial<FlexboxState> }[] = [
  {
    name: 'navbar',
    label: 'Navbar',
    state: {
      direction: 'row',
      wrap: 'nowrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      gapRow: '8',
      gapColumn: '8',
      items: [
        createItem({ label: 'Logo', flexGrow: '1' }),
        createItem({ label: 'Home' }),
        createItem({ label: 'About' }),
        createItem({ label: 'Contact' }),
      ],
    },
  },
  {
    name: 'hero',
    label: 'Centered hero',
    state: {
      direction: 'column',
      wrap: 'nowrap',
      justifyContent: 'center',
      alignItems: 'center',
      gapRow: '12',
      gapColumn: '8',
      items: [createItem({ label: 'Title' }), createItem({ label: 'Subtitle' })],
    },
  },
  {
    name: 'cards',
    label: 'Card row',
    state: {
      direction: 'row',
      wrap: 'wrap',
      justifyContent: 'space-evenly',
      alignItems: 'stretch',
      alignContent: 'center',
      gapRow: '16',
      gapColumn: '16',
      items: [
        createItem({ label: 'Card A', flexGrow: '1', flexBasis: '160px' }),
        createItem({ label: 'Card B', flexGrow: '1', flexBasis: '160px' }),
        createItem({ label: 'Card C', flexGrow: '1', flexBasis: '160px' }),
      ],
    },
  },
  {
    name: 'sidebar',
    label: 'Sidebar layout',
    state: {
      direction: 'row',
      wrap: 'nowrap',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      gapRow: '8',
      gapColumn: '24',
      items: [
        createItem({ label: 'Sidebar', flexBasis: '120px' }),
        createItem({ label: 'Main', flexGrow: '1' }),
      ],
    },
  },
];

const selectClass =
  'mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100';
const inputClass =
  'mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100';
const labelClass = 'block text-xs font-medium text-gray-700 dark:text-gray-300';
const opt = (values: readonly string[]) => values.map((v) => ({ value: v, label: v }));

export const Sidebar: React.FC<SidebarProps> = ({ state, onChange }) => {
  const set = (patch: Partial<FlexboxState>) => onChange({ ...state, ...patch });
  const setItem = (id: string, patch: Partial<Omit<FlexItem, 'id'>>) =>
    set({ items: state.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });

  const selectedId = state.items[0]?.id ?? '';
  const selected = state.items.find((it) => it.id === selectedId);

  const addItem = () => {
    if (state.items.length >= MAX_ITEMS) return;
    set({ items: [...state.items, createItem({ label: `Item ${state.items.length + 1}` })] });
  };

  const removeItem = (id: string) => {
    if (state.items.length <= MIN_ITEMS) return;
    set({ items: state.items.filter((it) => it.id !== id) });
  };

  const duplicateItem = (id: string) => {
    if (state.items.length >= MAX_ITEMS) return;
    const index = state.items.findIndex((it) => it.id === id);
    if (index < 0) return;
    const source = state.items[index];
    const copy = createItem({ ...source, id: undefined } as Partial<FlexItem>);
    const items = [...state.items];
    items.splice(index + 1, 0, copy);
    set({ items });
  };

  const resizeItem = (id: string, delta: number) => {
    const item = state.items.find((it) => it.id === id);
    if (!item) return;
    const basis = parseFloat(item.flexBasis) || 120;
    setItem(id, { flexBasis: `${Math.max(20, Math.round(basis + delta))}px` });
  };

  return (
    <div className="h-full space-y-6 overflow-y-auto p-4 text-sm" data-testid="flexbox-sidebar">
      {/* Presets */}
      <section>
        <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Presets</h3>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              data-testid={`preset-${preset.name}`}
              onClick={() => onChange({ ...state, ...preset.state })}
              className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {/* Container controls */}
      <section>
        <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Container</h3>
        <div className="grid grid-cols-2 gap-2">
          <label className={labelClass}>
            flex-direction
            <select
              data-testid="ctl-direction"
              className={selectClass}
              value={state.direction}
              onChange={(e) => set({ direction: e.target.value as FlexDirection })}
            >
              {opt(['row', 'row-reverse', 'column', 'column-reverse']).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            flex-wrap
            <select
              data-testid="ctl-wrap"
              className={selectClass}
              value={state.wrap}
              onChange={(e) => set({ wrap: e.target.value as FlexWrap })}
            >
              {opt(['nowrap', 'wrap', 'wrap-reverse']).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            justify-content
            <select
              data-testid="ctl-justify"
              className={selectClass}
              value={state.justifyContent}
              onChange={(e) => set({ justifyContent: e.target.value as JustifyContent })}
            >
              {opt([
                'flex-start',
                'flex-end',
                'center',
                'space-between',
                'space-around',
                'space-evenly',
              ]).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            align-items
            <select
              data-testid="ctl-align-items"
              className={selectClass}
              value={state.alignItems}
              onChange={(e) => set({ alignItems: e.target.value as AlignItems })}
            >
              {opt(['stretch', 'flex-start', 'flex-end', 'center', 'baseline']).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            align-content
            <select
              data-testid="ctl-align-content"
              className={selectClass}
              value={state.alignContent}
              onChange={(e) => set({ alignContent: e.target.value as AlignContent })}
            >
              {opt([
                'stretch',
                'flex-start',
                'flex-end',
                'center',
                'baseline',
                'space-between',
                'space-around',
                'space-evenly',
              ]).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Gap row (px)
            <input
              data-testid="ctl-gap-row"
              type="text"
              inputMode="numeric"
              className={inputClass}
              value={state.gapRow}
              onChange={(e) => set({ gapRow: e.target.value })}
            />
          </label>
          <label className={labelClass}>
            Gap column (px)
            <input
              data-testid="ctl-gap-column"
              type="text"
              inputMode="numeric"
              className={inputClass}
              value={state.gapColumn}
              onChange={(e) => set({ gapColumn: e.target.value })}
            />
          </label>
        </div>
      </section>

      {/* Items */}
      <section>
        <h3 className="mb-2 flex items-center justify-between font-medium text-gray-900 dark:text-gray-100">
          Items
          <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
            {state.items.length}/{MAX_ITEMS}
          </span>
        </h3>

        <div className="mb-2 flex gap-2">
          <button
            type="button"
            data-testid="btn-add-item"
            onClick={addItem}
            disabled={state.items.length >= MAX_ITEMS}
            className="rounded-md bg-violet-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-600 disabled:opacity-50"
          >
            Add item
          </button>
        </div>

        <div className="space-y-3">
          {state.items.map((item, index) => (
            <div
              key={item.id}
              data-testid={`item-editor-${index}`}
              className="rounded-md border border-gray-200 p-2 dark:border-gray-700"
            >
              <div className="mb-2 flex items-center gap-2">
                <input
                  data-testid={`item-label-${index}`}
                  type="text"
                  className={inputClass + ' flex-1'}
                  value={item.label}
                  onChange={(e) => setItem(item.id, { label: e.target.value })}
                  aria-label={`Item ${index + 1} label`}
                />
                <button
                  type="button"
                  data-testid={`btn-duplicate-${index}`}
                  onClick={() => duplicateItem(item.id)}
                  title="Duplicate"
                  className="rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-700"
                >
                  ⧉
                </button>
                <button
                  type="button"
                  data-testid={`btn-remove-${index}`}
                  onClick={() => removeItem(item.id)}
                  disabled={state.items.length <= MIN_ITEMS}
                  title="Remove"
                  className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 disabled:opacity-50 dark:border-red-800"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className={labelClass}>
                  grow
                  <input
                    data-testid={`item-grow-${index}`}
                    type="text"
                    inputMode="numeric"
                    className={inputClass}
                    value={item.flexGrow}
                    onChange={(e) => setItem(item.id, { flexGrow: e.target.value })}
                  />
                </label>
                <label className={labelClass}>
                  shrink
                  <input
                    data-testid={`item-shrink-${index}`}
                    type="text"
                    inputMode="numeric"
                    className={inputClass}
                    value={item.flexShrink}
                    onChange={(e) => setItem(item.id, { flexShrink: e.target.value })}
                  />
                </label>
                <label className={labelClass}>
                  basis
                  <input
                    data-testid={`item-basis-${index}`}
                    type="text"
                    className={inputClass}
                    value={item.flexBasis}
                    onChange={(e) => setItem(item.id, { flexBasis: e.target.value })}
                  />
                </label>
                <label className={labelClass}>
                  align-self
                  <select
                    data-testid={`item-align-self-${index}`}
                    className={selectClass}
                    value={item.alignSelf}
                    onChange={(e) => setItem(item.id, { alignSelf: e.target.value as AlignSelf })}
                  >
                    {opt(['auto', 'stretch', 'flex-start', 'flex-end', 'center', 'baseline']).map(
                      (o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      )
                    )}
                  </select>
                </label>
                <label className={labelClass}>
                  order
                  <input
                    data-testid={`item-order-${index}`}
                    type="text"
                    inputMode="numeric"
                    className={inputClass}
                    value={item.order}
                    onChange={(e) => setItem(item.id, { order: e.target.value })}
                  />
                </label>
              </div>

              <div className="mt-2 flex gap-1">
                <button
                  type="button"
                  data-testid={`btn-smaller-${index}`}
                  onClick={() => resizeItem(item.id, -20)}
                  className="rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-700"
                >
                  −
                </button>
                <button
                  type="button"
                  data-testid={`btn-bigger-${index}`}
                  onClick={() => resizeItem(item.id, 20)}
                  className="rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-700"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selected ? null : (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Add items with the button above. Values map 1:1 to the generated CSS in the canvas.
        </p>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500">
        Defaults come from the template state (v
        {DEFAULT_STATE.gapRow}px gap).
      </p>
    </div>
  );
};

export default Sidebar;
