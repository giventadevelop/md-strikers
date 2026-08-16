'use client';

import { useCallback, useEffect, useRef } from 'react';
import { FC_IMG } from './fcUnitedConstants';

/**
 * Ambient hero MP4 (public path). Encode with `scripts/encode-hero-video.ps1`.
 * Chrome often mishandles video-only MP4s (-an): mid-playback freeze + broken loop.
 * Re-encode with a silent AAC track; this component also loops in JS and recovers stuck time.
 * @see documentation/fc-united/HOME_HERO_VIDEO_ENCODING_GUIDE.html
 */
export const HERO_HOME_AMBIENT_MP4 = '/images/md_strikers_media/md_media/hero-home-ambient.mp4';

type Props = {
  className?: string;
};

export function FcUnitedHeroVideo({ className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  const playIfPaused = useCallback((video: HTMLVideoElement) => {
    video.muted = true;
    video.defaultMuted = true;
    if (video.paused) {
      const p = video.play();
      if (p !== undefined) void p.catch(() => {});
    }
  }, []);

  const restartFromStart = useCallback((video: HTMLVideoElement) => {
    video.muted = true;
    video.defaultMuted = true;
    video.currentTime = 0;
    const p = video.play();
    if (p !== undefined) void p.catch(() => {});
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    playIfPaused(v);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') playIfPaused(v);
    };

    const onEnded = () => restartFromStart(v);

    document.addEventListener('visibilitychange', onVisibility);
    v.addEventListener('ended', onEnded);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      v.removeEventListener('ended', onEnded);
    };
  }, [playIfPaused, restartFromStart]);

  /** Chrome: decoder can stall mid-stream on video-only MP4s; nudge currentTime or restart loop. */
  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    let lastT = -1;
    let stuckMs = 0;
    const tickMs = 400;

    const iv = window.setInterval(() => {
      if (v.paused || v.seeking) {
        lastT = v.currentTime;
        stuckMs = 0;
        return;
      }
      if (v.ended) {
        lastT = -1;
        stuckMs = 0;
        return;
      }

      const t = v.currentTime;
      const dur = v.duration;
      if (!Number.isFinite(dur) || dur <= 0) return;

      if (lastT >= 0 && Math.abs(t - lastT) < 0.002) {
        stuckMs += tickMs;
        if (stuckMs >= 1200) {
          stuckMs = 0;
          if (t >= dur - 0.3) {
            restartFromStart(v);
          } else {
            v.currentTime = Math.min(t + 0.05, dur - 0.02);
            void v.play().catch(() => {});
          }
        }
      } else {
        stuckMs = 0;
      }
      lastT = t;
    }, tickMs);

    return () => window.clearInterval(iv);
  }, [restartFromStart]);

  return (
    <video
      ref={ref}
      className={className}
      src={HERO_HOME_AMBIENT_MP4}
      autoPlay
      muted
      playsInline
      preload="auto"
      controls={false}
      disablePictureInPicture
      poster={`${FC_IMG}/anim-bg-copyright.jpg`}
      aria-hidden
    />
  );
}
