import type { Tool, DeserializeResult } from '@itsjust/core';
import toolConfig from './tool.config';
import { DEFAULT_STATE, generateCss, isState, type FlexItem, type FlexboxState } from './types';

const itemCounter = 0;

function numberOr(value: unknown, fallback: string): string {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return typeof value === 'string' ? value : fallback;
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function sanitizeItems(value: unknown): FlexItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (entry): entry is Record<string, unknown> =>
        typeof entry === 'object' && entry !== null && typeof (entry as FlexItem).id === 'string'
    )
    .map((entry) => ({
      id: String(entry.id),
      label: stringOr(entry.label, 'Item'),
      flexGrow: numberOr(entry.flexGrow, '0'),
      flexShrink: numberOr(entry.flexShrink, '1'),
      flexBasis: stringOr(entry.flexBasis, 'auto'),
      alignSelf: (typeof entry.alignSelf === 'string'
        ? entry.alignSelf
        : 'auto') as FlexItem['alignSelf'],
      order: numberOr(entry.order, '0'),
    }));
}

/** Serialize tool state into a compact JSON string for share/import. */
export function serializeState(state: FlexboxState): string {
  return JSON.stringify({
    direction: state.direction,
    wrap: state.wrap,
    justifyContent: state.justifyContent,
    alignItems: state.alignItems,
    alignContent: state.alignContent,
    gapRow: state.gapRow,
    gapColumn: state.gapColumn,
    items: state.items,
  });
}

/** Validate and recover tool state from an arbitrary payload. */
export function deserializeState(data: unknown): DeserializeResult<FlexboxState> {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return {
      success: false,
      error: 'Invalid data format: expected flexbox playground state object',
    };
  }
  const v = data as Record<string, unknown>;
  const state: FlexboxState = {
    direction: stringOr(v.direction, DEFAULT_STATE.direction) as FlexboxState['direction'],
    wrap: stringOr(v.wrap, DEFAULT_STATE.wrap) as FlexboxState['wrap'],
    justifyContent: stringOr(
      v.justifyContent,
      DEFAULT_STATE.justifyContent
    ) as FlexboxState['justifyContent'],
    alignItems: stringOr(v.alignItems, DEFAULT_STATE.alignItems) as FlexboxState['alignItems'],
    alignContent: stringOr(
      v.alignContent,
      DEFAULT_STATE.alignContent
    ) as FlexboxState['alignContent'],
    gapRow: numberOr(v.gapRow, DEFAULT_STATE.gapRow),
    gapColumn: numberOr(v.gapColumn, DEFAULT_STATE.gapColumn),
    items: sanitizeItems(v.items),
  };
  return { success: true, data: state };
}

/** True when a serialized string round-trips back to the same state. */
export function roundTrips(state: FlexboxState): boolean {
  try {
    const restored = deserializeState(JSON.parse(serializeState(state)));
    return restored.success && JSON.stringify(restored.data) === JSON.stringify(state);
  } catch {
    return false;
  }
}

export const cssFlexboxPlaygroundTool: Tool<FlexboxState> = {
  id: toolConfig.id,
  name: toolConfig.name,
  version: toolConfig.version,
  config: toolConfig,
  initialState: { ...DEFAULT_STATE, items: [...DEFAULT_STATE.items] },
  serialize: serializeState,
  deserialize: deserializeState,
  exporters: [
    { format: 'png', loader: () => import('./exporters/png') },
    { format: 'jpeg', loader: () => import('./exporters/jpeg') },
    { format: 'webp', loader: () => import('./exporters/webp') },
    { format: 'pdf', loader: () => import('./exporters/pdf') },
  ],
};

export { generateCss, isState, DEFAULT_STATE, itemCounter };
