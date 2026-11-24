import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DEFAULT_STATE, generateCss, type FlexboxState, type FlexItem } from '@/tool/types';
import { Canvas } from '@/tool/components/Canvas';
import { Sidebar } from '@/tool/components/Sidebar';
import { Toolbar } from '@/tool/components/Toolbar';
import { cssFlexboxPlaygroundTool } from '@/tool/tool-definition';

const item = (patch: Partial<Omit<FlexItem, 'id'>> = {}, id = 'i1'): FlexItem => ({
  id,
  label: 'Item',
  flexGrow: '0',
  flexShrink: '1',
  flexBasis: 'auto',
  alignSelf: 'auto',
  order: '0',
  ...patch,
});

const baseState: FlexboxState = {
  ...DEFAULT_STATE,
  items: [item({ label: 'A' }, 'a'), item({ label: 'B' }, 'b')],
};

let current: FlexboxState = baseState;
const change = (next: FlexboxState) => {
  current = next;
};

describe('Sidebar item management', () => {
  beforeEach(() => {
    current = baseState;
  });

  it('adding an item updates state and CSS output', () => {
    render(<Sidebar state={current} onChange={change} />);
    expect(current.items).toHaveLength(2);
    fireEvent.click(screen.getByTestId('btn-add-item'));
    expect(current.items).toHaveLength(3);
    expect(generateCss(current)).toContain('.flex-item-3 {');
  });

  it('removing an item updates state and CSS output', () => {
    render(<Sidebar state={current} onChange={change} />);
    fireEvent.click(screen.getByTestId('btn-remove-0'));
    expect(current.items).toHaveLength(1);
    const css = generateCss(current);
    expect(css).toContain('.flex-item-1 {');
    expect(css).not.toContain('.flex-item-2');
  });

  it('duplicate inserts a copy with a fresh id next to the source', () => {
    render(<Sidebar state={current} onChange={change} />);
    fireEvent.click(screen.getByTestId('btn-duplicate-0'));
    expect(current.items).toHaveLength(3);
    expect(current.items[0]?.label).toBe('A');
    expect(current.items[1]?.label).toBe('A');
    expect(current.items[0]?.id).not.toBe(current.items[1]?.id);
  });

  it('per-item flex-grow change is reflected in generated CSS', () => {
    render(<Sidebar state={current} onChange={change} />);
    fireEvent.change(screen.getByTestId('item-grow-1'), { target: { value: '4' } });
    expect(current.items[1]?.flexGrow).toBe('4');
    expect(generateCss(current)).toContain('flex: 4 1 auto;');
  });

  it('per-item order change is reflected in generated CSS', () => {
    render(<Sidebar state={current} onChange={change} />);
    fireEvent.change(screen.getByTestId('item-order-0'), { target: { value: '5' } });
    expect(generateCss(current)).toContain('order: 5;');
  });

  it('resize adds 20px to a px basis', () => {
    current = { ...baseState, items: [item({ flexBasis: '100px' }, 'a')] };
    render(<Sidebar state={current} onChange={change} />);
    const bigger = () => {
      // Sidebar reads `state` from props; re-render with the latest captured state.
      render(<Sidebar state={current} onChange={change} />);
    };
    bigger();
    fireEvent.click(screen.getAllByTestId('btn-bigger-0').pop() as HTMLElement);
    expect(current.items[0]?.flexBasis).toBe('120px');
    bigger();
    fireEvent.click(screen.getAllByTestId('btn-smaller-0').pop() as HTMLElement);
    expect(current.items[0]?.flexBasis).toBe('100px');
  });

  it('container selects update state', () => {
    render(<Sidebar state={current} onChange={change} />);
    fireEvent.change(screen.getByTestId('ctl-direction'), { target: { value: 'column' } });
    expect(current.direction).toBe('column');
    fireEvent.change(screen.getByTestId('ctl-justify'), { target: { value: 'space-evenly' } });
    expect(current.justifyContent).toBe('space-evenly');
    fireEvent.change(screen.getByTestId('ctl-align-items'), { target: { value: 'baseline' } });
    expect(current.alignItems).toBe('baseline');
    fireEvent.change(screen.getByTestId('ctl-align-content'), { target: { value: 'center' } });
    expect(current.alignContent).toBe('center');
    fireEvent.change(screen.getByTestId('ctl-gap-row'), { target: { value: '20' } });
    expect(current.gapRow).toBe('20');
  });

  it('preset loading replaces current state fully', () => {
    const messy: FlexboxState = {
      direction: 'column-reverse',
      wrap: 'wrap-reverse',
      justifyContent: 'flex-end',
      alignItems: 'baseline',
      alignContent: 'space-evenly',
      gapRow: '99',
      gapColumn: '99',
      items: [item({ label: 'x' }, 'z1'), item({ label: 'y' }, 'z2'), item({ label: 'z' }, 'z3')],
    };
    render(<Sidebar state={messy} onChange={change} />);
    fireEvent.click(screen.getByTestId('preset-hero'));
    expect(current.direction).toBe('column');
    expect(current.justifyContent).toBe('center');
    expect(current.items).toHaveLength(2);
    const restored = cssFlexboxPlaygroundTool.deserialize(
      JSON.parse(cssFlexboxPlaygroundTool.serialize(current))
    );
    expect(restored.success).toBe(true);
    if (restored.success) expect(restored.data).toEqual(current);
    expect(generateCss(current)).toContain('flex-direction: column;');
  });

  it('all four presets load valid states', () => {
    render(<Sidebar state={baseState} onChange={change} />);
    for (const name of ['navbar', 'hero', 'cards', 'sidebar']) {
      current = baseState;
      fireEvent.click(screen.getByTestId(`preset-${name}`));
      expect(current.items.length).toBeGreaterThan(0);
      expect(generateCss(current)).toContain('display: flex;');
    }
  });
});

describe('Canvas and Toolbar', () => {
  it('renders items and generated CSS with preview styles', () => {
    render(<Canvas state={current} onChange={change} />);
    expect(screen.getAllByTestId('flex-item')).toHaveLength(2);
    expect(screen.getByTestId('generated-css').textContent).toContain('display: flex;');
  });

  it('copy button writes CSS to clipboard', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    render(<Toolbar state={current} onChange={change} />);
    const btn = screen.getByTestId('btn-copy-css');
    fireEvent.click(btn);
    await vi.waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('.flex-container {')
      )
    );
    await vi.waitFor(() => expect(btn.textContent).toBe('Copied!'));
  });
});
