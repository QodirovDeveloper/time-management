import { today } from '../lib/i18n';
import type { Lang } from '../lib/plan';
import { cx } from '../lib/styles';
import { useLang, usePlanner, useTr } from '../store/plannerStore';
import { Eyebrow } from './ui';

const LANGS: Lang[] = ['uz', 'ru', 'en'];

export function Header() {
  const lang = useLang();
  const tr = useTr();
  const setLang = usePlanner((st) => st.setLang);
  // Selektor kunni satr qilib qaytaradi: komponent soat yurganda emas, faqat yangi kunda qayta chiziladi
  const day = usePlanner((st) => new Date(st.now).toDateString());
  return (
    <header className="grid gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <Eyebrow>{today(lang, new Date(day))}</Eyebrow>
        <div className="flex overflow-hidden rounded-lg border border-line bg-surface" role="group" aria-label={tr('language')}>
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={l === lang}
              onClick={() => setLang(l)}
              className={cx(
                'cursor-pointer px-3 py-1 font-mono text-xs font-bold uppercase',
                l === lang ? 'bg-accent-soft text-accent' : 'text-muted hover:text-fg',
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <h1 className="font-display text-3xl font-bold tracking-tight text-balance">Time management</h1>
      <p className="max-w-prose text-muted">{tr('tagline')}</p>
    </header>
  );
}
