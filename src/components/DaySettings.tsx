import type { ReactNode } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { FOCUS, cx } from '../lib/styles';
import { usePlanner, useTr } from '../store/plannerStore';
import { Button, Card, Stepper } from './ui';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <span>{label}</span>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  );
}

export function DaySettings() {
  const tr = useTr();
  // Faqat shu karta uchun kerakli maydonlar: vazifalar o'zgarsa, bu karta qayta chizilmaydi
  const { start, brk, sound, helpSeen, shiftStart, startNow, setBreak, toggleSound, setHelpSeen } = usePlanner(
    useShallow((st) => ({
      start: st.s.start, brk: st.s.brk, sound: st.s.sound, helpSeen: st.s.helpSeen,
      shiftStart: st.shiftStart, startNow: st.startNow, setBreak: st.setBreak, toggleSound: st.toggleSound, setHelpSeen: st.setHelpSeen,
    })),
  );
  return (
    <Card>
      <h2 className="font-display text-lg font-semibold">{tr('settings')}</h2>
      <Row label={tr('startAt')}>
        <Stepper label={tr('startAt')} value={start} onMinus={() => shiftStart(-5)} onPlus={() => shiftStart(5)} />
        <Button variant="link" small onClick={startNow}>{tr('nowTime')}</Button>
      </Row>
      <Row label={tr('breakLen')}>
        <Stepper label={tr('breakLen')} value={`${brk} ${tr('min')}`} onMinus={() => setBreak(brk - 5)} onPlus={() => setBreak(brk + 5)} />
      </Row>
      <Row label={tr('sound')}>
        <button
          type="button"
          role="switch"
          aria-checked={sound}
          aria-label={tr('sound')}
          onClick={toggleSound}
          className={cx(
            'flex h-7 w-12 cursor-pointer items-center rounded-full p-0.5 transition-colors',
            FOCUS,
            sound ? 'justify-end bg-accent' : 'bg-line',
          )}
        >
          <span className="size-6 rounded-full bg-surface shadow" />
        </button>
      </Row>
      {helpSeen && (
        <Button variant="link" small className="justify-self-start" onClick={() => setHelpSeen(false)}>
          {tr('showHelp')}
        </Button>
      )}
    </Card>
  );
}
