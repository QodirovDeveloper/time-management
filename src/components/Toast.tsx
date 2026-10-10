import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { usePlanner, useTr } from '../store/plannerStore';

export function Toast() {
  const tr = useTr();
  const { toast, undo, closeToast } = usePlanner(
    useShallow((st) => ({ toast: st.toast, undo: st.undo, closeToast: st.closeToast })),
  );

  // Bir necha soniyadan keyin yopiladi, «Qaytarish» imkoniyati ham shu bilan tugaydi
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(closeToast, toast.canUndo ? 6000 : 2500);
    return () => clearTimeout(id);
  }, [toast, closeToast]);

  if (!toast) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] mx-auto flex max-w-md items-center justify-between gap-4 rounded-xl bg-fg px-4 py-3 text-sm text-bg shadow-lg"
    >
      <span>{tr(toast.key)}</span>
      {toast.canUndo && (
        <button type="button" onClick={undo} className="cursor-pointer font-semibold text-accent-soft hover:underline">
          {tr('undo')}
        </button>
      )}
    </div>
  );
}
