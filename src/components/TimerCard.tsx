import { useShallow } from 'zustand/react/shallow';

import { dur, levelKey } from '../lib/i18n';
import * as P from '../lib/plan';
import { cx } from '../lib/styles';
import { usePlanner, useTr } from '../store/plannerStore';
import { Button, Card, Eyebrow, Pill } from './ui';

// Bosqichga qarab rang: ish, tanaffus, kun tugadi
const TONE = {
  work: { card: '', text: 'text-fg', bar: 'bg-accent', label: '' },
  brk: { card: 'border-brk', text: 'text-brk', bar: 'bg-brk', label: 'text-brk' },
  done: { card: 'border-done', text: 'text-done', bar: 'bg-done', label: 'text-done' },
} as const;

export function TimerCard() {
  const tr = useTr();
  const { s, now, toggleRun, doneNext, skipBreak, restart } = usePlanner(
    useShallow((st) => ({ s: st.s, now: st.now, toggleRun: st.toggleRun, doneNext: st.doneNext, skipBreak: st.skipBreak, restart: st.restart })),
  );

  const empty = s.tasks.length === 0;
  const done = P.allDone(s);
  const brk = s.phase === 'brk' && !done;
  const left = empty ? 0 : P.remaining(s, now);
  const pct = done ? 100 : empty ? 0 : Math.min(100, Math.max(0, 100 * (1 - left / P.total(s))));
  const tone = TONE[done ? 'done' : brk ? 'brk' : 'work'];
  const cur = P.current(s);
  const next = s.tasks[s.cur + 1];

  const [label, title, sub] = empty
    ? [tr('now'), tr('noTasks'), tr('noTasksHint')]
    : done
      ? [tr('dayDone'), tr('allDone'), tr('stats', { n: s.tasks.length, t: dur(tr, s.tasks.reduce((a, t) => a + t.min, 0)) })]
      : brk
        ? [tr('brk'), tr('breakText'), next ? tr('next', { name: next.name }) : '']
        : [tr('now'), cur?.name ?? '', `${tr(levelKey(cur?.pr ?? 2))} · ${next ? tr('next', { name: next.name }) : tr('lastOne')}`];

  const startLabel = tr(s.running ? 'pause' : !empty && left < P.total(s) ? 'resume' : 'start');

  return (
    <Card className={tone.card}>
      <div className="flex items-start justify-between gap-3" aria-live="polite">
        <div className="grid min-w-0 gap-0.5">
          <Eyebrow className={tone.label}>{label}</Eyebrow>
          <h2 className="font-display text-xl font-semibold break-words">{title}</h2>
          <p className="text-sm text-muted">{sub}</p>
        </div>
        {!empty && <Pill tone={done ? 'done' : 'muted'}>{tr('progress', { d: P.doneCount(s), n: s.tasks.length })}</Pill>}
      </div>

      <p className={cx('font-mono text-6xl font-bold tracking-tight tabular-nums sm:text-7xl', tone.text)}>
        {done ? '✓' : P.fmt(left)}
      </p>
      <div className="h-1.5 overflow-hidden rounded-full bg-line">
        <div className={cx('h-full transition-[width] duration-500 motion-reduce:transition-none', tone.bar)} style={{ width: `${pct}%` }} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" className="min-w-32" disabled={done || empty} onClick={toggleRun}>{startLabel}</Button>
        <Button disabled={done || empty || brk} onClick={doneNext}>{tr('doneNext')}</Button>
        {brk && <Button onClick={skipBreak}>{tr('skipBreak')}</Button>}
        <Button variant="ghost" disabled={empty || !P.started(s)} onClick={restart}>{tr('restart')}</Button>
      </div>
    </Card>
  );
}
