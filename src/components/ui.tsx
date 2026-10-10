import type { ComponentProps, ReactNode } from 'react';

import type { Tr } from '../lib/i18n';
import { levelKey } from '../lib/i18n';
import type { Level } from '../lib/plan';
import { FOCUS, cx } from '../lib/styles';

const BUTTON = {
  default: 'border border-line bg-surface text-fg hover:bg-bg',
  primary: 'bg-accent text-on-accent hover:brightness-110',
  ghost: 'text-muted hover:text-fg',
  link: 'px-0! py-1! text-accent hover:underline',
} as const;

type ButtonProps = ComponentProps<'button'> & { variant?: keyof typeof BUTTON; small?: boolean };

export function Button({ variant = 'default', small, className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={cx(
        'inline-flex items-center justify-center rounded-lg font-semibold whitespace-nowrap transition',
        'cursor-pointer disabled:cursor-not-allowed disabled:opacity-40',
        small ? 'px-3 py-1.5 text-sm' : 'px-4 py-2.5',
        BUTTON[variant],
        FOCUS,
        className,
      )}
      {...props}
    />
  );
}

export function IconButton({ danger, className, ...props }: ComponentProps<'button'> & { danger?: boolean }) {
  return (
    <button
      type="button"
      className={cx(
        'grid size-8 cursor-pointer place-items-center rounded-lg border border-line font-mono text-sm transition hover:bg-bg',
        'disabled:cursor-not-allowed disabled:opacity-30',
        danger ? 'text-danger' : 'text-fg',
        FOCUS,
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cx('grid gap-4 rounded-2xl border border-line bg-surface p-5', className)}>{children}</section>;
}

export function Eyebrow({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cx('text-[11px] font-semibold tracking-[.12em] text-muted uppercase', className)}>{children}</p>;
}

export function Stepper(props: { value: string; onMinus: () => void; onPlus: () => void; label: string }) {
  const step = cx('grid h-9 w-9 cursor-pointer place-items-center text-lg font-bold text-accent hover:bg-bg', FOCUS);
  return (
    <div role="group" aria-label={props.label} className="inline-flex items-center overflow-hidden rounded-lg border border-line bg-surface">
      <button type="button" className={step} onClick={props.onMinus} aria-label="−5">−</button>
      <output className="min-w-20 text-center font-mono font-bold tabular-nums">{props.value}</output>
      <button type="button" className={step} onClick={props.onPlus} aria-label="+5">+</button>
    </div>
  );
}

const DOT: Record<Level, string> = { 1: 'bg-danger', 2: 'bg-accent', 3: 'bg-muted' };

export function Dot({ pr }: { pr: Level }) {
  return <i className={cx('inline-block size-2 shrink-0 rounded-full', DOT[pr])} />;
}

export function LevelPicker(props: { value: Level; onChange: (pr: Level) => void; tr: Tr }) {
  return (
    <div role="radiogroup" className="flex flex-wrap gap-1.5">
      {([1, 2, 3] as const).map((pr) => {
        const on = props.value === pr;
        return (
          <button
            key={pr}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => props.onChange(pr)}
            className={cx(
              'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold',
              on ? 'border-fg bg-bg text-fg' : 'border-line text-muted hover:text-fg',
              FOCUS,
            )}
          >
            <Dot pr={pr} />
            {props.tr(levelKey(pr))}
          </button>
        );
      })}
    </div>
  );
}

const PILL = {
  muted: 'bg-line text-muted',
  active: 'bg-accent-soft text-accent',
  done: 'bg-done-soft text-done',
} as const;

export function Pill({ tone = 'muted', children }: { tone?: keyof typeof PILL; children: ReactNode }) {
  return <span className={cx('rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap', PILL[tone])}>{children}</span>;
}
