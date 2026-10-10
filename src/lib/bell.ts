// Qo'ng'iroq: Web Audio bilan uch marta "din". Fayl kerak emas.
let ctx: AudioContext | null = null;

// Brauzer ovozni faqat foydalanuvchi bosgandan keyin ruxsat beradi: Start tugmasida chaqiramiz.
export function unlockAudio() {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    // ovoz qo'llab-quvvatlanmaydi
  }
}

export function ring() {
  unlockAudio();
  if (!ctx) return;
  const c = ctx;
  [0, 0.4, 0.8].forEach((delay) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.frequency.value = 880;
    osc.connect(gain).connect(c.destination);
    const t = c.currentTime + delay;
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.start(t);
    osc.stop(t + 0.35);
  });
}
