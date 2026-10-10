import { useState } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { TEMPLATES, dur, levelKey } from '../lib/i18n';
import * as P from '../lib/plan';
import { TaskForm } from './TaskForm';
import { cx } from '../lib/styles';
import { useLang, usePlanner, useTr } from '../store/plannerStore';
import { Button, Card, Dot, IconButton, Pill } from './ui';

function TimeCell({ from, to }: { from: number; to: number }) {
  return (
    <div className="font-mono text-[13px] leading-tight text-muted tabular-nums">
      <b className="block text-[15px] text-fg">{P.hm(from)}</b>
      {P.hm(to)}
    </div>
  );
}

const ROW = 'grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3 border-t border-line py-3';

export function TaskList() {
  const tr = useTr();
  const lang = useLang();
  // st.now tanlanmagan: soat yurganda ro'yxat qayta chizilmaydi
  const { s, addTask, editTask, moveTask, removeTask, loadTemplate, clearAll } = usePlanner(
    useShallow((st) => ({
      s: st.s, addTask: st.addTask, editTask: st.editTask, moveTask: st.moveTask,
      removeTask: st.removeTask, loadTemplate: st.loadTemplate, clearAll: st.clearAll,
    })),
  );
  const [editId, setEditId] = useState<string | null>(null);
  const plan = P.schedule(s);
  const empty = s.tasks.length === 0;
  const done = P.allDone(s);

  return (
    <section className="grid gap-4">
      <div>
        <h2 className="font-display text-lg font-semibold">{tr('tasksTitle')}</h2>
        {!empty && <p className="font-mono text-[13px] text-muted">{tr('total', { t: dur(tr, plan.sum), end: P.hm(plan.end) })}</p>}
      </div>

      <Card>
        <TaskForm tr={tr} submitLabel={tr('add')} onSubmit={({ name, min, pr }) => addTask(name, min, pr)} />
      </Card>

      {empty ? (
        <div className="grid gap-3 rounded-2xl border border-dashed border-line p-5 text-muted">
          <p>{tr('empty')}</p>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES[lang].map((tpl, i) => (
              <Button key={tpl.label} onClick={() => loadTemplate(i)} className="gap-2">
                {tpl.label}
                <small className="font-mono font-medium text-muted">{dur(tr, tpl.tasks.reduce((a, t) => a + t[1], 0))}</small>
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <ol className="border-b border-line">
          {plan.slots.map((slot) => {
            if (slot.kind === 'brk') {
              const isNow = slot.index === s.cur && s.phase === 'brk' && !done;
              return (
                <li key={`b${slot.index}`} className={cx('rounded-md py-1.5 pl-[4.25rem] font-mono text-xs text-brk', isNow && 'bg-brk-soft font-bold')}>
                  {isNow && '▸ '}
                  {tr('breakRow', { m: s.brk })} · {P.hm(slot.from)}–{P.hm(slot.to)}
                </li>
              );
            }

            const i = slot.index;
            const task = s.tasks[i]!;

            if (task.id === editId) {
              return (
                <li key={task.id} className={ROW}>
                  <TimeCell from={slot.from} to={slot.to} />
                  <TaskForm
                    tr={tr}
                    initial={task}
                    submitLabel={tr('save')}
                    onCancel={() => setEditId(null)}
                    onSubmit={({ name, min, pr }) => {
                      editTask(task.id, name, min, pr);
                      setEditId(null);
                    }}
                  />
                </li>
              );
            }

            const active = i === s.cur && s.phase === 'work' && !task.done;
            const prev = s.tasks[i - 1], next = s.tasks[i + 1];
            return (
              <li key={task.id} className={cx(ROW, task.done && 'opacity-70')}>
                <TimeCell from={slot.from} to={slot.to} />
                <div className="grid min-w-0 gap-1.5">
                  <p className={cx('font-semibold break-words', active && 'text-accent', task.done && 'text-muted line-through')}>
                    {i + 1}. {task.name}
                  </p>
                  <p className="flex items-center gap-1.5 text-[13px] text-muted">
                    <Dot pr={task.pr} />
                    {tr(levelKey(task.pr))} · {dur(tr, task.min)}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Pill tone={task.done ? 'done' : active ? 'active' : 'muted'}>
                      {tr(task.done ? 'stDone' : active ? 'stActive' : 'stWait')}
                    </Pill>
                    <div className="flex gap-1.5">
                      {/* tartibni faqat o'z darajasi ichida o'zgartirsa bo'ladi */}
                      <IconButton aria-label={tr('up')} disabled={prev?.pr !== task.pr} onClick={() => moveTask(i, -1)}>↑</IconButton>
                      <IconButton aria-label={tr('down')} disabled={next?.pr !== task.pr} onClick={() => moveTask(i, 1)}>↓</IconButton>
                      <IconButton aria-label={tr('edit')} onClick={() => setEditId(task.id)}>✎</IconButton>
                      <IconButton aria-label={tr('del')} danger onClick={() => removeTask(task.id)}>✕</IconButton>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {!empty && (
        <Button variant="link" small className="justify-self-start" onClick={clearAll}>
          {tr('clearAll')}
        </Button>
      )}
    </section>
  );
}
