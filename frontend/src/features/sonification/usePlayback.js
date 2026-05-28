import { useCallback, useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { createInstruments } from './createInstruments.js';
import { schedulePacketSounds } from './schedulePacketSounds.js';

export const PlaybackStatus = { IDLE: 'idle', PLAYING: 'playing', PAUSED: 'paused' };

export function usePlayback(data) {
  const [status, setStatus] = useState(PlaybackStatus.IDLE);
  const [currentTime, setCurrentTime] = useState(0);
  const [synthsReady, setSynthsReady] = useState(false);
  const synthsRef = useRef(null);
  const duration = data?.capture?.duration_seconds ?? 0;
  const isReady = Boolean(data && synthsReady);

  const resetTransport = useCallback(() => {
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    if (synthsRef.current) synthsRef.current.releaseAll();
    setStatus(PlaybackStatus.IDLE);
    setCurrentTime(0);
  }, []);

  useEffect(() => {
    synthsRef.current = createInstruments(); // incarca sintetizatoarele o singura data, si le pastreaza in memorie pe toata durata vizualizarii capturii
    setSynthsReady(true);

    return () => {
      Tone.Transport.stop();
      Tone.Transport.cancel(0);
      if (synthsRef.current) {
        synthsRef.current.releaseAll();
        synthsRef.current.dispose();
        synthsRef.current = null;
      }
      setSynthsReady(false);
    };
  }, []);

  useEffect(() => {
    if (!data || !synthsRef.current) 
      return;
 // de fiecare data cand se incarca o captura noua, resetam transportul si programam toate notele pentru noua captura
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    synthsRef.current.releaseAll();

    const sizeRange = {
      min: data.capture.size_min,
      max: data.capture.size_max,
    };

    schedulePacketSounds(data.packets, sizeRange, synthsRef.current, {
      endTime: duration + 0.8,
      onComplete: resetTransport,
    });

    setStatus(PlaybackStatus.IDLE);
    setCurrentTime(0);
  }, [data, duration, resetTransport]);

  useEffect(() => {
    if (status !== PlaybackStatus.PLAYING) 
      return;
// requestAnimationFrame actualizeaza currentTime pentru afisarea timpului curent si detectia sfarsitului redarii
    let rafId;
    const tick = () => {
      const t = Tone.Transport.seconds;
      setCurrentTime(t);

      if (duration > 0 && t >= duration + 0.8) {
        resetTransport();
        return;
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [status, duration, resetTransport]);

  const play = useCallback(async () => { 
    await Tone.start();
    Tone.Transport.start();
    setStatus(PlaybackStatus.PLAYING);
  }, []);

  const pause = useCallback(() => {
    Tone.Transport.pause();
    if (synthsRef.current) 
      synthsRef.current.releaseAll();
    setStatus(PlaybackStatus.PAUSED);
  }, []);

  const stop = useCallback(() => {
    resetTransport();
  }, [resetTransport]);

  return { status, currentTime, duration, play, pause, stop, isReady };
}
