// Tailwind klasslari uchun umumiy yordamchilar

// Klasslarni birlashtirish: false/undefined qiymatlar tashlab yuboriladi
export const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');

export const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export const inputClass = cx(
  'w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-base text-fg placeholder:text-muted',
  FOCUS,
);
