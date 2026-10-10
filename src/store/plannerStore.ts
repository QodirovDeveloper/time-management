import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { ring, unlockAudio } from '../lib/bell';
import type { Key } from '../lib/i18n';
import { TEMPLATES, makeTr } from '../lib/i18n';
import * as P from '../lib/plan';

export type Toast = { key: Key; canUndo: boolean; id: number };
type Result = { state: P.State; restarted: boolean };

type PlannerStore = {
  s: P.State; // kun rejasi (localStorage'da saqlanadi)
  now: number; // soat, har 0,5 soniyada yangilanadi
  toast: Toast | null;
  undoTo: P.State | null; // «Qaytarish» uchun oldingi holat

  tick: () => void;
  // vazifalar
  addTask: (name: string, min: number, pr: P.Level) => void;
  editTask: (id: string, name: string, min: number, pr: P.Level) => void;
  moveTask: (i: number, dir: -1 | 1) => void;
  removeTask: (id: string) => void;
  clearAll: () => void;
  loadTemplate: (i: number) => void;
  undo: () => void;
  closeToast: () => void;
  // taymer
  toggleRun: () => void;
  doneNext: () => void;
  skipBreak: () => void;
  restart: () => void;
  // sozlamalar
  shiftStart: (min: number) => void;
  startNow: () => void;
  setBreak: (brk: number) => void;
  toggleSound: () => void;
  setLang: (lang: P.Lang) => void;
  setHelpSeen: (helpSeen: boolean) => void;
};

export const usePlanner = create<PlannerStore>()(
  persist(
    (set, get) => {
      // Kichik yordamchilar: har bir amal shulardan biri orqali o'tadi (DRY)
      const update = (fn: (s: P.State) => P.State) => set({ s: fn(get().s) });
      const notify = (key: Key, undoTo: P.State | null = null) =>
        set({ toast: { key, canUndo: !!undoTo, id: Date.now() }, undoTo });
      const commit = ({ state, restarted }: Result, okKey?: Key) => {
        set({ s: state });
        if (restarted) notify('orderChanged');
        else if (okKey) notify(okKey);
      };
      // O'zgartirishdan oldingi holatni «Qaytarish» uchun eslab qoladi
      const undoable = (key: Key, fn: (s: P.State) => P.State) => {
        const before = get().s;
        set({ s: fn(before) });
        notify(key, before);
      };

      return {
        s: P.blank(new Date()),
        now: Date.now(),
        toast: null,
        undoTo: null,

        tick: () => {
          const now = Date.now();
          const { s } = get();
          if (s.running && P.remaining(s, now) <= 0) {
            if (s.sound) ring();
            set({ now, s: P.finishPhase(s, now) });
          } else {
            set({ now });
          }
        },

        addTask: (name, min, pr) => commit(P.addTask(get().s, name, min, pr), 'added'),
        editTask: (id, name, min, pr) => commit(P.editTask(get().s, id, name, min, pr, Date.now())),
        moveTask: (i, dir) => commit(P.moveTask(get().s, i, dir)),
        removeTask: (id) => undoable('deleted', (s) => P.removeTask(s, id).state),
        clearAll: () => undoable('cleared', (s) => P.resetProgress(s, [])),
        loadTemplate: (i) => {
          const tpl = TEMPLATES[get().s.lang ?? 'uz'][i];
          if (!tpl) return;
          update((s) => P.resetProgress(s, tpl.tasks.map(([name, min, pr]) => ({ id: P.uid(), name, min, pr, done: false }))));
          notify('templateLoaded');
        },
        undo: () => {
          const { undoTo } = get();
          set({ toast: null, undoTo: null, ...(undoTo && { s: undoTo }) });
        },
        closeToast: () => set({ toast: null, undoTo: null }),

        toggleRun: () => {
          unlockAudio(); // brauzer ovozga faqat bosishdan keyin ruxsat beradi
          update((s) => P.toggleRun(s, Date.now()));
        },
        doneNext: () => update((s) => P.finishPhase({ ...s, left: P.remaining(s, Date.now()) }, Date.now())),
        skipBreak: () => update((s) => P.finishPhase({ ...s, left: 0 }, Date.now())),
        restart: () => {
          update((s) => P.resetProgress(s, s.tasks));
          notify('restarted');
        },

        shiftStart: (min) => update((s) => ({ ...s, start: P.hm(P.toMin(s.start) + min) })),
        startNow: () => update((s) => ({ ...s, start: P.roundNow(new Date()) })),
        setBreak: (brk) => update((s) => P.setBreak(s, brk)),
        toggleSound: () => {
          if (!get().s.sound) ring();
          update((s) => ({ ...s, sound: !s.sound }));
        },
        setLang: (lang) => update((s) => ({ ...s, lang })),
        setHelpSeen: (helpSeen) => update((s) => ({ ...s, helpSeen })),
      };
    },
    {
      name: 'time-management',
      storage: createJSONStorage(() => localStorage),
      // Faqat reja saqlanadi; soat, xabar va «Qaytarish» saqlanmaydi
      partialize: (store) => ({ s: store.s }),
      // Eski yoki chala yozuv bo'lsa, yetishmagan maydonlar standart qiymat oladi
      merge: (saved, current) => ({
        ...current,
        s: { ...current.s, ...(saved as { s?: Partial<P.State> } | undefined)?.s },
      }),
    },
  ),
);

// Til va tarjima funksiyasi: faqat til o'zgarganda qayta hisoblanadi
export const useLang = () => usePlanner((st) => st.s.lang ?? 'uz');
export function useTr() {
  const lang = useLang();
  return useMemo(() => makeTr(lang), [lang]);
}
