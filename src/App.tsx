import { useEffect } from 'react';

import { DaySettings } from './components/DaySettings';
import { Header } from './components/Header';
import { HelpCard } from './components/HelpCard';
import { TaskList } from './components/TaskList';
import { TimerCard } from './components/TimerCard';
import { Toast } from './components/Toast';
import { fmt, remaining } from './lib/plan';
import { usePlanner, useTr } from './store/plannerStore';

// Soat, brauzer sarlavhasi va Probel tugmasi. Store bilan to'g'ridan-to'g'ri ishlaydi,
// shuning uchun App har yarim soniyada qayta chizilmaydi.
function useAppEffects() {
  useEffect(() => {
    const { tick } = usePlanner.getState();
    const timer = setInterval(tick, 500);

    const unsubscribe = usePlanner.subscribe(({ s, now }) => {
      document.title = (s.running ? fmt(remaining(s, now)) + ' · ' : '') + 'Time management';
      document.documentElement.lang = s.lang ?? 'uz';
    });

    const onKey = (e: KeyboardEvent) => {
      const { s, toggleRun } = usePlanner.getState();
      if (e.code === 'Space' && e.target === document.body && s.tasks.length > 0) {
        e.preventDefault();
        toggleRun();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      clearInterval(timer);
      unsubscribe();
      document.removeEventListener('keydown', onKey);
    };
  }, []);
}

export default function App() {
  useAppEffects();
  const tr = useTr();
  const helpSeen = usePlanner((st) => st.s.helpSeen);

  return (
    <>
      <main className="mx-auto grid w-full max-w-xl gap-5 px-4 pt-6 pb-28">
        <Header />
        {!helpSeen && <HelpCard />}
        <TimerCard />
        <DaySettings />
        <TaskList />
        <footer className="flex flex-wrap justify-between gap-2 text-[13px] text-muted">
          <span>{tr('privacy')}</span>
          <span className="hidden font-mono pointer-fine:inline">{tr('spaceHint')}</span>
        </footer>
      </main>
      <Toast />
    </>
  );
}
