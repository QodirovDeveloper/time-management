import type { Key } from '../lib/i18n';
import { usePlanner, useTr } from '../store/plannerStore';
import { Button } from './ui';

const STEPS: Key[] = ['step1', 'step2', 'step3'];

export function HelpCard() {
  const tr = useTr();
  const setHelpSeen = usePlanner((st) => st.setHelpSeen);
  return (
    <section className="grid gap-3 rounded-2xl bg-accent-soft p-5">
      <h2 className="font-display text-base font-semibold">{tr('helpTitle')}</h2>
      <ol className="grid gap-2.5">
        {STEPS.map((key, i) => (
          <li key={key} className="grid grid-cols-[1.75rem_1fr] items-start gap-2.5">
            <span className="grid size-6 place-items-center rounded-full bg-accent font-mono text-xs font-bold text-on-accent">{i + 1}</span>
            <span>{tr(key)}</span>
          </li>
        ))}
      </ol>
      <Button variant="primary" className="justify-self-start" onClick={() => setHelpSeen(true)}>
        {tr('gotIt')}
      </Button>
    </section>
  );
}
