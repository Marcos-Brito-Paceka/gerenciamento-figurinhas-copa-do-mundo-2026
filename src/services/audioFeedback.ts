// src/services/audioFeedback.ts

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  const AudioConstructor = window.AudioContext;

  if (!AudioConstructor) return null;

  if (!audioContext) {
    audioContext = new AudioConstructor();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

export function playTapSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";

  // som suave com leve subida de pitch
  osc.frequency.setValueAtTime(420, now);
  osc.frequency.exponentialRampToValueAtTime(520, now + 0.08);

  // volume bem discreto
  gain.gain.setValueAtTime(0.0000001, now);
  gain.gain.exponentialRampToValueAtTime(0.015, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0000001, now + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.02);
}