'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_LINES = 300;

function isDebugEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_MOBILE_DEBUG_CONSOLE === 'true') return true;
  if (process.env.NODE_ENV === 'development') return true;
  return false;
}

/**
 * Captures console output into a small on-screen panel (dev or when
 * NEXT_PUBLIC_MOBILE_DEBUG_CONSOLE=true) for mobile / remote debugging.
 */
export default function MobileDebugConsole() {
  const enabled = isDebugEnabled();
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const buffer = useRef<string[]>([]);

  const append = useCallback((level: string, args: unknown[]) => {
    const text = args
      .map((a) => {
        if (typeof a === 'string') return a;
        try {
          return JSON.stringify(a);
        } catch {
          return String(a);
        }
      })
      .join(' ');
    const line = `${new Date().toISOString().slice(11, 23)} [${level}] ${text}`;
    buffer.current = [...buffer.current.slice(-(MAX_LINES - 1)), line];
    setLines([...buffer.current]);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const oLog = console.log;
    const oWarn = console.warn;
    const oErr = console.error;
    console.log = (...a: unknown[]) => {
      oLog(...a);
      append('log', a);
    };
    console.warn = (...a: unknown[]) => {
      oWarn(...a);
      append('warn', a);
    };
    console.error = (...a: unknown[]) => {
      oErr(...a);
      append('error', a);
    };
    return () => {
      console.log = oLog;
      console.warn = oWarn;
      console.error = oErr;
    };
  }, [enabled, append]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
    } catch {
      /* ignore */
    }
  }, [lines]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-2 right-2 z-[9999] font-mono text-xs">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md bg-foreground/90 px-2 py-1 text-background shadow-md"
        >
          dbg
        </button>
      ) : (
        <div className="flex max-h-[40vh] w-[min(100vw-1rem,22rem)] flex-col rounded-md border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between gap-2 border-b border-border px-2 py-1">
            <span className="text-[10px] text-muted-foreground">console</span>
            <div className="flex gap-1">
              <button type="button" className="text-[10px] underline" onClick={copy}>
                copy
              </button>
              <button type="button" className="text-[10px] underline" onClick={() => setOpen(false)}>
                hide
              </button>
            </div>
          </div>
          <pre className="max-h-[min(35vh,320px)] overflow-auto p-2 text-[10px] leading-tight text-foreground">
            {lines.length === 0 ? <span className="text-muted-foreground">(no logs yet)</span> : lines.join('\n')}
          </pre>
        </div>
      )}
    </div>
  );
}
