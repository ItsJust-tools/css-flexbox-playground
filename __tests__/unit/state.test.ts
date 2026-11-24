import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, createItem } from '@/tool/types';
import type { FlexboxState, FlexItem } from '@/tool/types';
import {
  deserializeState,
  serializeState,
  roundTrips,
  cssFlexboxPlaygroundTool,
} from '@/tool/tool-definition';
import { containerCss, itemCss, generateCss, isState, parseNumber } from '@/tool/types';

const item = (patch: Partial<Omit<FlexItem, 'id'>> = {}, id = 'i1'): FlexItem => ({
  id,
  label: 'Item',
  flexGrow: '0',
  flexShrink: '1',
  flexBasis: 'auto',
  alignSelf: 'auto' as FlexItem['alignSelf'],
  order: '0',
  ...patch,
});

const state = (patch: Partial<FlexboxState> = {}): FlexboxState => ({
  ...DEFAULT_STATE,
  items: [item()],
  ...patch,
});

describe('serialize/deserialize round-trip', () => {
  it('preserves all container and item settings', () => {
    const full: FlexboxState = {
      direction: 'column-reverse',
      wrap: 'wrap-reverse',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      alignContent: 'space-around',
      gapRow: '12',
      gapColumn: '24',
      items: [
        item(
          {
            label: 'A',
            flexGrow: '2',
            flexShrink: '0',
            flexBasis: '150px',
            alignSelf: 'center',
            order: '-1',
          },
          'x1'
        ),
        item({ label: 'B', flexGrow: '1' }, 'x2'),
      ],
    };
    const restored = deserializeState(JSON.parse(serializeState(full)));
    expect(restored.success).toBe(true);
    if (restored.success) {
      expect(restored.data).toEqual(full);
    }
    expect(roundTrips(full)).toBe(true);
  });

  it('round-trips through the Tool object', () => {
    const serialized = cssFlexboxPlaygroundTool.serialize(state());
    const restored = cssFlexboxPlaygroundTool.deserialize(JSON.parse(serialized));
    expect(restored.success).toBe(true);
    if (restored.success) {
      expect(restored.data.items).toHaveLength(1);
      expect(restored.data.direction).toBe(DEFAULT_STATE.direction);
    }
  });

  it('repairs invalid payloads with defaults', () => {
    const repaired = deserializeState({ nope: true });
    expect(repaired.success).toBe(true);
    if (repaired.success) {
      expect(repaired.data.direction).toBe(DEFAULT_STATE.direction);
      expect(repaired.data.items).toEqual([]);
    }
    expect(deserializeState('nonsense' as unknown).success).toBe(false);
    expect(deserializeState(null).success).toBe(false);
  });

  it('preserves numeric input values as strings', () => {
    const restored = deserializeState({ ...state(), gapRow: 16, items: [{ id: 'a', label: 'L' }] });
    expect(restored.success).toBe(true);
    if (restored.success) {
      expect(restored.data.gapRow).toBe('16');
      expect(restored.data.items[0]?.label).toBe('L');
    }
  });
});

describe('generateCss', () => {
  it('emits container declarations', () => {
    const css = containerCss(
      state({
        direction: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gapRow: '10',
        gapColumn: '20',
      })
    );
    expect(css).toContain('.flex-container {');
    expect(css).toContain('display: flex;');
    expect(css).toContain('flex-direction: column;');
    expect(css).toContain('justify-content: center;');
    expect(css).toContain('align-items: center;');
    expect(css).toContain('gap: 10px 20px;');
  });

  it('emits per-item flex shorthand, align-self and order', () => {
    const s = state({
      items: [
        item({
          flexGrow: '2',
          flexShrink: '3',
          flexBasis: '80px',
          alignSelf: 'center',
          order: '2',
        }),
      ],
    });
    const css = generateCss(s);
    expect(css).toContain('.flex-item-1 {');
    expect(css).toContain('flex: 2 3 80px;');
    expect(css).toContain('align-self: center;');
    expect(css).toContain('order: 2;');
  });

  it('omits align-self auto and zero order', () => {
    const css = itemCss(item(), 0);
    expect(css).not.toContain('align-self');
    expect(css).not.toContain('order');
  });

  it('normalizes invalid basis and gap values', () => {
    const s = state({
      items: [item({ flexBasis: 'bogus', flexGrow: 'x', order: '-3' })],
      gapRow: 'bad',
      gapColumn: '',
    });
    const css = generateCss(s);
    expect(css).toContain('flex: 0 1 auto;');
    expect(css).toContain('gap: 0px 0px;');
    expect(css).toContain('order: -3;');
  });

  it('separates container and item rules', () => {
    const css = generateCss(state({ items: [item({}, 'a'), item({}, 'b')] }));
    const parts = css.split('\n\n');
    expect(parts).toHaveLength(3);
    expect(parts[0]).toContain('.flex-container');
    expect(parts[1]).toContain('.flex-item-1');
    expect(parts[2]).toContain('.flex-item-2');
  });
});

describe('parseNumber', () => {
  it('accepts non-negative numbers only', () => {
    expect(parseNumber('5')).toBe(5);
    expect(parseNumber('2.5')).toBe(2.5);
    expect(parseNumber('')).toBeNull();
    expect(parseNumber('-1')).toBeNull();
    expect(parseNumber('abc')).toBeNull();
  });
});

describe('isState', () => {
  it('checks structure loosely', () => {
    expect(isState(state())).toBe(true);
    expect(isState({ direction: 'row', items: [] })).toBe(true);
    expect(isState({})).toBe(false);
    expect(isState(null)).toBe(false);
  });
});

describe('createItem', () => {
  it('creates unique ids and applies patch', () => {
    const a = createItem({ label: 'A' });
    const b = createItem({ label: 'B' });
    expect(a.id).not.toBe(b.id);
    expect(a.label).toBe('A');
    expect(a.flexGrow).toBe('0');
  });
});
