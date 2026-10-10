import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import * as P from '../lib/plan';

// Node'da localStorage yo'q: store yuklanishidan oldin oddiy xotira bilan almashtiramiz
const mem = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
});
const { usePlanner } = await import('./plannerStore');

const NOW = new Date(2026, 9, 10, 9, 0);
const get = () => usePlanner.getState();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  usePlanner.setState({ s: P.blank(NOW), toast: null, undoTo: null });
});
afterEach(() => vi.useRealTimers());

describe('plannerStore', () => {
  test("o'chirilgan vazifani «Qaytarish» tiklaydi", () => {
    get().addTask('Matematika', 40, 1);
    get().addTask('Kitob', 30, 3);
    const id = get().s.tasks[0]!.id;

    get().removeTask(id);
    expect(get().s.tasks.map((t) => t.name)).toEqual(['Kitob']);
    expect(get().toast).toMatchObject({ key: 'deleted', canUndo: true });

    get().undo();
    expect(get().s.tasks.map((t) => t.name)).toEqual(['Matematika', 'Kitob']);
    expect(get().toast).toBeNull();
  });

  test("vaqt tugaganda tick() tanaffusga o'tkazadi", () => {
    usePlanner.setState((st) => ({ s: { ...st.s, sound: false } }));
    get().addTask('Matematika', 40, 1);
    get().addTask('Kitob', 30, 2);
    get().toggleRun();

    vi.setSystemTime(NOW.getTime() + 39 * 60_000);
    get().tick();
    expect(get().s.phase).toBe('work');

    vi.setSystemTime(NOW.getTime() + 40 * 60_000);
    get().tick();
    expect(get().s.phase).toBe('brk');
    expect(get().s.tasks[0]!.done).toBe(true);
  });

  test("localStorage'ga faqat reja yoziladi", () => {
    get().addTask('Matematika', 40, 1);
    const saved = JSON.parse(mem.get('time-management')!);
    expect(Object.keys(saved.state)).toEqual(['s']);
    expect(saved.state.s.tasks[0].name).toBe('Matematika');
  });
});
