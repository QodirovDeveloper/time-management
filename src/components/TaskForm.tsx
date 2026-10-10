import { useState } from 'react';
import type { FormEvent } from 'react';

import type { Tr } from '../lib/i18n';
import type { Level } from '../lib/plan';
import { clampMin } from '../lib/plan';
import { inputClass } from '../lib/styles';
import { Button, LevelPicker, Stepper } from './ui';

type Values = { name: string; min: number; pr: Level };

// Qo'shish ham, tahrirlash ham shu forma: faqat tugmalari va boshlang'ich qiymati boshqa
export function TaskForm(props: {
  tr: Tr;
  initial?: Values;
  submitLabel: string;
  onSubmit: (v: Values) => void;
  onCancel?: () => void;
}) {
  const { tr } = props;
  const [v, setV] = useState<Values>(props.initial ?? { name: '', min: 30, pr: 2 });
  const set = (patch: Partial<Values>) => setV({ ...v, ...patch });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const name = v.name.trim();
    if (!name) return;
    props.onSubmit({ ...v, name });
    if (!props.onCancel) set({ name: '' }); // qo'shgandan keyin maydon tozalanadi
  };

  return (
    <form onSubmit={submit} className="grid gap-3">
      <input
        className={inputClass}
        value={v.name}
        onChange={(e) => set({ name: e.target.value })}
        placeholder={tr('addPlaceholder')}
        aria-label={tr('addPlaceholder')}
        maxLength={60}
        autoFocus={!!props.onCancel}
        onKeyDown={(e) => e.key === 'Escape' && props.onCancel?.()}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Stepper
          label={tr('min')}
          value={`${v.min} ${tr('min')}`}
          onMinus={() => set({ min: clampMin(v.min - 5) })}
          onPlus={() => set({ min: clampMin(v.min + 5) })}
        />
        <LevelPicker value={v.pr} onChange={(pr) => set({ pr })} tr={tr} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="primary" disabled={!v.name.trim()} className="grow sm:grow-0">
          {props.submitLabel}
        </Button>
        {props.onCancel && <Button onClick={props.onCancel}>{tr('cancel')}</Button>}
      </div>
    </form>
  );
}
