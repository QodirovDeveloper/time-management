# Time management

Kun rejasi ilovasi: vazifalar muhimlik bo'yicha, taymer, tanaffus va qo'ng'iroq.
**React 19 + TypeScript + Zustand + Tailwind CSS v4 + Vite.**

## Imkoniyatlar

- Uch daraja: «Eng muhim», «Muhim», «Keyinroq». Eng muhimi doim tepada
- Vazifa qo'shish, tahrirlash, ↑ ↓ bilan tartiblash (daraja ichida), o'chirish va «Qaytarish»
- Taymer: vazifa → tanaffus → keyingi vazifa, qo'ng'iroq ovozi (Web Audio)
- Kun boshlanish vaqti va tanaffus uzunligi, jadval vaqti o'zi hisoblanadi
- Tayyor namunalar: Maktab, Universitet, Ish, Uy
- Tillar: o'zbekcha, ruscha, inglizcha
- Yorug' va qorong'i tema (tizim sozlamasiga qarab), telefonda ishlaydi
- Probel: boshlash / pauza
- Hammasi `localStorage`'da saqlanadi (Zustand `persist`)

## Ishga tushirish

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # mantiq va store testlari (Vitest)
npm run build    # TypeScript tekshiruvi + production build
npm run lint     # oxlint
```

## Tuzilishi

```
src/
  lib/
    plan.ts        mantiq: toza funksiyalar, React'ga bog'liq emas (Lynx versiyasi bilan bir xil)
    plan.test.ts   mantiq testlari
    i18n.ts        3 tildagi matnlar, sanalar, namunalar
    bell.ts        qo'ng'iroq ovozi
    styles.ts      cx() va umumiy Tailwind klasslari
  store/
    plannerStore.ts       Zustand store: holat + barcha amallar + persist
    plannerStore.test.ts  store testlari
  components/
    ui.tsx         Button, IconButton, Card, Stepper, LevelPicker, Pill, Dot
    Header, HelpCard, TimerCard, DaySettings, TaskForm, TaskList, Toast
  App.tsx          bo'limlarni yig'adi, soat (tick) va Probel tugmasini ulaydi
```

## KISS va DRY

- **Bitta manba:** butun holat va amallar Zustand store'da (`usePlanner`). Provider ham, props zanjiri ham yo'q.
- **Mantiq alohida:** `plan.ts`'dagi funksiyalar holatni o'zgartirmaydi, yangisini qaytaradi. Shuning uchun ularni test qilish oson.
- **Bitta forma:** vazifa qo'shish va tahrirlash bitta `TaskForm`, faqat tugmasi boshqa.
- **Variantlar xaritada:** tugma, belgi va bosqich ranglari obyektda (`BUTTON`, `PILL`, `TONE`), `if` zanjirlari yo'q.
- **Ranglar bir joyda:** `index.css`'dagi CSS o'zgaruvchilari, Tailwind'da `bg-surface`, `text-muted` kabi nomlar bilan. Qorong'i temada faqat qiymatlar almashadi.

## Zustand qanday ishlatilgan

```ts
// 1. Komponent faqat kerakli qismni oladi (selektor)
const helpSeen = usePlanner((st) => st.s.helpSeen);

// 2. Bir nechta qiymat: useShallow bilan, aks holda har safar yangi obyekt = cheksiz qayta chizish
const { s, now, toggleRun } = usePlanner(useShallow((st) => ({ s: st.s, now: st.now, toggleRun: st.toggleRun })));

// 3. Komponentdan tashqarida (interval, klaviatura): getState()
setInterval(usePlanner.getState().tick, 500);
```

- `tick()` har 0,5 soniyada faqat `now`'ni yangilaydi. `TaskList` va `DaySettings` `now`'ni tanlamagan, shuning uchun ular soat yurganda qayta chizilmaydi.
- `Header` sanani `toDateString()` satri qilib tanlaydi: u faqat yangi kun boshlanganda qayta chiziladi.
- `persist` + `partialize`: `localStorage`'ga faqat reja (`s`) yoziladi; soat, xabar va «Qaytarish» saqlanmaydi.
- `merge`: eski yoki chala yozuvda yetishmagan maydonlar standart qiymat oladi.

## Internetga joylash

`npm run build` → `dist/` papkasini Netlify (app.netlify.com/drop), Vercel yoki GitHub Pages'ga yuklang.
