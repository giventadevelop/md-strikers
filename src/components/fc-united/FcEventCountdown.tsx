'use client';

import { useEffect, useMemo, useState } from 'react';

function toParts(msRemaining: number) {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

export function FcEventCountdown({ targetIso }: { targetIso: string }) {
  const targetMs = useMemo(() => new Date(targetIso).getTime(), [targetIso]);
  /** null until mount — avoids SSR vs client Date.now() mismatch (hydration error). */
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNowMs(Date.now());
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const { days, hours, minutes, seconds } =
    nowMs === null ? { days: 0, hours: 0, minutes: 0, seconds: 0 } : toParts(targetMs - nowMs);

  return (
    <>
      <div className="mt-2 grid grid-cols-4 gap-2 text-center font-mono text-lg text-white">
        <span>{pad2(days)}</span>
        <span>{pad2(hours)}</span>
        <span>{pad2(minutes)}</span>
        <span>{pad2(seconds)}</span>
      </div>
      <p className="mt-1 grid grid-cols-4 gap-2 text-center text-[10px] uppercase text-[#848992]">
        <span>days</span>
        <span>hrs</span>
        <span>mins</span>
        <span>secs</span>
      </p>
    </>
  );
}
