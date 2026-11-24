// ── CSS Flexbox Playground state model ────────────────────────────────────

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
export type JustifyContent =
  'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
export type AlignItems = 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
export type AlignContent = AlignItems | 'space-between' | 'space-around' | 'space-evenly';
export type AlignSelf = 'auto' | AlignItems;

export interface FlexItem {
  /** Stable unique identifier. */
  id: string;
  /** Human label shown in the preview chip. */
  label: string;
  /** flex-grow number as string (empty = 0). */
  flexGrow: string;
  /** flex-shrink number as string (empty = 1). */
  flexShrink: string;
  /** flex-basis length as string (empty = auto). */
  flexBasis: string;
  /** align-self override; 'auto' inherits container alignment. */
  alignSelf: AlignSelf;
  /** order as string (empty = 0). */
  order: string;
}

export interface FlexboxState {
  direction: FlexDirection;
  wrap: FlexWrap;
  justifyContent: JustifyContent;
  alignItems: AlignItems;
  alignContent: AlignContent;
  /** Row gap in px as string. */
  gapRow: string;
  /** Column gap in px as string. */
  gapColumn: string;
  items: FlexItem[];
}

export const DEFAULT_ITEM: Omit<FlexItem, 'id'> = {
  label: 'Item',
  flexGrow: '0',
  flexShrink: '1',
  flexBasis: 'auto',
  alignSelf: 'auto',
  order: '0',
};

let itemCounter = 0;

/** Create a new flex item with a unique id. */
export function createItem(patch: Partial<Omit<FlexItem, 'id'>> = {}): FlexItem {
  itemCounter += 1;
  return { id: `item-${Date.now().toString(36)}-${itemCounter}`, ...DEFAULT_ITEM, ...patch };
}

export const DEFAULT_STATE: FlexboxState = {
  direction: 'row',
  wrap: 'nowrap',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  alignContent: 'stretch',
  gapRow: '8',
  gapColumn: '8',
  items: [
    createItem({ label: 'One', flexGrow: '1' }),
    createItem({ label: 'Two' }),
    createItem({ label: 'Three' }),
  ],
};

export const MIN_ITEMS = 1;
export const MAX_ITEMS = 24;

/** Parse a non-negative number; returns null for empty/unparseable/negative input. */
export function parseNumber(input: string): number | null {
  if (!input.trim()) return null;
  const value = Number(input);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export interface ChangeResult {
  change: number | null;
  direction: 'increase' | 'decrease' | 'none' | 'undefined';
}

/** Direction-aware difference summary for two sizes (unused for CSS, kept for helpers). */
export function changeResult(from: number, to: number): ChangeResult {
  if (from === 0 && to === 0) return { change: 0, direction: 'none' };
  if (from === 0) return { change: null, direction: 'undefined' };
  const change = ((to - from) / Math.abs(from)) * 100;
  if (change > 0) return { change, direction: 'increase' };
  if (change < 0) return { change, direction: 'decrease' };
  return { change, direction: 'none' };
}

/** Parse a (possibly negative) number; returns null for empty/unparseable input. */
export function parseSigned(input: string): number | null {
  if (!input.trim()) return null;
  const value = Number(input);
  return Number.isFinite(value) ? value : null;
}

/** Sanitize a gap input into a CSS px fragment ('0px' when invalid). */
export function gapValue(input: string): string {
  const value = parseNumber(input);
  return `${Number.isFinite(value) ? (value as number) : 0}px`;
}

/** flex-basis fragment; 'auto' for empty or invalid values. */
export function basisValue(input: string): string {
  const trimmed = input.trim();
  if (!trimmed || trimmed === 'auto') return 'auto';
  if (/^[+-]?\d+(\.\d+)?(px|%|rem|em|vh|vw|ch)$/.test(trimmed)) return trimmed;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) && numeric >= 0 ? `${numeric}px` : 'auto';
}

/** Generated CSS for the container rule. */
export function containerCss(state: FlexboxState): string {
  const lines = [
    '  display: flex;',
    `  flex-direction: ${state.direction};`,
    `  flex-wrap: ${state.wrap};`,
    `  justify-content: ${state.justifyContent};`,
    `  align-items: ${state.alignItems};`,
    `  align-content: ${state.alignContent};`,
    `  gap: ${gapValue(state.gapRow)} ${gapValue(state.gapColumn)};`,
  ];
  return `.flex-container {\n${lines.join('\n')}\n}`;
}

/** Generated CSS for a single item rule (id-suffixed class). */
export function itemCss(item: FlexItem, index: number): string {
  const grow = parseNumber(item.flexGrow) ?? 0;
  const shrink = parseNumber(item.flexShrink) ?? 1;
  const basis = basisValue(item.flexBasis);
  const lines = [`  flex: ${grow} ${shrink} ${basis};`];
  if (item.alignSelf !== 'auto') {
    lines.push(`  align-self: ${item.alignSelf};`);
  }
  const order = parseSigned(item.order) ?? 0;
  if (order !== 0) {
    lines.push(`  order: ${order};`);
  }
  return `.flex-item-${index + 1} {\n${lines.join('\n')}\n}`;
}

/** Full stylesheet: container rule followed by one rule per item. */
export function generateCss(state: FlexboxState): string {
  const rules = [containerCss(state), ...state.items.map((item, i) => itemCss(item, i))];
  return rules.join('\n\n');
}

/** Inline style object for the live preview container. */
export function previewContainerStyle(state: FlexboxState): React.CSSProperties {
  return {
    display: 'flex',
    flexDirection: state.direction,
    flexWrap: state.wrap,
    justifyContent: state.justifyContent,
    alignItems: state.alignItems,
    alignContent: state.alignContent,
    rowGap: gapValue(state.gapRow),
    columnGap: gapValue(state.gapColumn),
  };
}

/** Inline style object for one preview item. */
export function previewItemStyle(item: FlexItem): React.CSSProperties {
  const style: React.CSSProperties = {
    flex: `${parseNumber(item.flexGrow) ?? 0} ${parseNumber(item.flexShrink) ?? 1} ${basisValue(item.flexBasis)}`,
  };
  if (item.alignSelf !== 'auto') style.alignSelf = item.alignSelf;
  const order = parseSigned(item.order) ?? 0;
  if (order !== 0) style.order = order;
  return style;
}

/** Compact summary used by status bar and copy actions. */
export function summaryText(state: FlexboxState): string {
  return `${state.items.length} item${state.items.length === 1 ? '' : 's'} · ${state.direction} · ${state.justifyContent}`;
}

/** Type guard: loose structural check of a serialized payload. */
export function isState(value: unknown): value is FlexboxState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<FlexboxState>;
  return typeof v.direction === 'string' && Array.isArray(v.items);
}
