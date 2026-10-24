// Web Audio & Background Soundscape Engine
// Plays "優しく舞う桜 – Cherry Blossoms Fall Softly (NOQURA)" as atmospheric background music
// with auto-start, smooth fade-in/fade-out, and ultra-refined luxury tactile sound FX (perfume spray, stamp, chime).

import { translations } from './translations.js';

class SoundscapeEngine {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.audioUrl = '/assets/audio/cherry-blossoms-fall-softly.mp3';
    this.targetVolume = 0.45; // Gentle, elegant background volume
    this.fadeInterval = null;
    this.hasInteracted = false;

    // Web Audio Context for low-latency tactile sound FX
    this.ctx = null;
    this.fxGain = null;
  }

  // Initialize HTML5 Audio Element for background music
  initAudioElement() {
    if (this.audio) return;
    this.audio = new Audio(this.audioUrl);
    this.audio.loop = true;
    this.audio.preload = 'auto';
    this.audio.volume = 0;

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.updateUIState(true);
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updateUIState(false);
    });

    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      this.updateUIState(false);
    });
  }

  // Initialize Web Audio API for tactile sound FX (spray, stamp, chime)
  initAudioContext() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    this.fxGain = this.ctx.createGain();
    this.fxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
    this.fxGain.connect(this.ctx.destination);
  }

  // Auto-start music on page load, handling browser autoplay restrictions
  async autoStart() {
    this.initAudioElement();

    try {
      this.audio.volume = 0;
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        await playPromise;
        this.isPlaying = true;
        this.fadeIn(1500);
        this.updateUIState(true);
      }
    } catch (err) {
      // Browser blocked autoplay without user gesture -> listen for first interaction
      this.setupFirstInteractionListener();
    }
  }

  // When browser autoplay is blocked, start music on first touch/click/scroll
  setupFirstInteractionListener() {
    const triggerStart = async () => {
      if (this.hasInteracted) return;
      this.hasInteracted = true;

      const events = ['pointerdown', 'touchstart', 'click', 'scroll', 'keydown'];
      events.forEach(ev => window.removeEventListener(ev, triggerStart, { capture: true }));

      if (!this.isPlaying) {
        try {
          this.initAudioElement();
          this.audio.volume = 0;
          await this.audio.play();
          this.isPlaying = true;
          this.fadeIn(1500);
          this.updateUIState(true);
        } catch (e) {
          console.warn("Audio start on interaction note:", e);
        }
      }
    };

    const events = ['pointerdown', 'touchstart', 'click', 'scroll', 'keydown'];
    events.forEach(ev => window.addEventListener(ev, triggerStart, { capture: true, once: true }));
  }

  // Smooth Volume Fade In
  fadeIn(duration = 1200) {
    if (!this.audio) return;
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    const steps = 30;
    const stepTime = duration / steps;
    const volIncrement = this.targetVolume / steps;

    this.fadeInterval = setInterval(() => {
      if (!this.audio) {
        clearInterval(this.fadeInterval);
        return;
      }
      if (this.audio.volume + volIncrement >= this.targetVolume) {
        this.audio.volume = this.targetVolume;
        clearInterval(this.fadeInterval);
      } else {
        this.audio.volume += volIncrement;
      }
    }, stepTime);
  }

  // Smooth Volume Fade Out
  fadeOut(callback, duration = 600) {
    if (!this.audio) {
      if (callback) callback();
      return;
    }
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    const steps = 20;
    const stepTime = duration / steps;
    const volDecrement = this.audio.volume / steps;

    this.fadeInterval = setInterval(() => {
      if (!this.audio || this.audio.volume - volDecrement <= 0.01) {
        if (this.audio) this.audio.volume = 0;
        clearInterval(this.fadeInterval);
        if (callback) callback();
      } else {
        this.audio.volume = Math.max(0, this.audio.volume - volDecrement);
      }
    }, stepTime);
  }

  // User Manual Toggle Button in Header
  async toggle() {
    this.initAudioElement();

    if (this.isPlaying) {
      this.fadeOut(() => {
        this.audio.pause();
        this.isPlaying = false;
        this.updateUIState(false);
      }, 500);
      return false;
    } else {
      try {
        await this.audio.play();
        this.isPlaying = true;
        this.fadeIn(800);
        this.updateUIState(true);
        return true;
      } catch (err) {
        console.warn("Manual audio play error:", err);
        return false;
      }
    }
  }

  // Synchronize UI header button, equalizer bars, and label
  updateUIState(playing) {
    const audioBtn = document.getElementById('audio-toggle-btn');
    const soundWaves = document.getElementById('sound-waves-indicator');
    const audioStatusText = document.getElementById('audio-status-text');
    const activeLang = document.documentElement.lang || 'vi';
    const dict = translations[activeLang] || translations.vi;

    if (audioBtn) {
      audioBtn.classList.toggle('playing', playing);
    }
    if (soundWaves) {
      soundWaves.classList.toggle('active', playing);
    }
    if (audioStatusText) {
      audioStatusText.textContent = playing 
        ? (dict.audio_playing_text || 'Đang phát: Hoa Anh Đào Rơi Dịu Dàng (NOQURA)')
        : (dict.audio_muted_text || 'Âm thanh: Đang tắt');
    }
  }

  // =========================================================================
  // TACTILE SOUND FX: ULTRA-REFINED LUXURY PERFUME MIST SPRAY
  // =========================================================================
  async playSpraySound() {
    this.initAudioContext();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      try { await this.ctx.resume(); } catch(e) {}
    }

    const now = this.ctx.currentTime;

    // 1. Mechanical Atomizer Valve Micro-Click (Subtle metallic precision)
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    const clickFilter = this.ctx.createBiquadFilter();

    clickOsc.type = "triangle";
    clickOsc.frequency.setValueAtTime(5400, now);
    clickOsc.frequency.exponentialRampToValueAtTime(1400, now + 0.015);

    clickFilter.type = "highpass";
    clickFilter.frequency.setValueAtTime(2600, now);

    clickGain.gain.setValueAtTime(0.0001, now);
    clickGain.gain.linearRampToValueAtTime(0.05, now + 0.003);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

    clickOsc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(this.fxGain);

    clickOsc.start(now);
    clickOsc.stop(now + 0.022);

    // 2. Silky Aerated Mist Vapor (Smooth filtered pink/white whisper)
    const dur = 0.52;
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Soft one-pole filter for pinkish, natural aerosol character
      lastOut = (lastOut * 0.4) + (white * 0.6);
      data[i] = lastOut;
    }

    const spraySource = this.ctx.createBufferSource();
    spraySource.buffer = noiseBuffer;

    // Bandpass centered at silky 5600Hz - characteristic of fine fragrance nozzles
    const sprayFilter = this.ctx.createBiquadFilter();
    sprayFilter.type = "bandpass";
    sprayFilter.frequency.setValueAtTime(5600, now);
    sprayFilter.frequency.exponentialRampToValueAtTime(3400, now + dur);
    sprayFilter.Q.setValueAtTime(1.5, now);

    // Highpass to eliminate any rumble or harsh thud
    const highpass = this.ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(2400, now);

    const sprayGain = this.ctx.createGain();
    // Gentle curve: smooth attack (25ms) -> gentle body -> organic tail
    sprayGain.gain.setValueAtTime(0.0001, now + 0.004);
    sprayGain.gain.linearRampToValueAtTime(0.16, now + 0.035);
    sprayGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    spraySource.connect(highpass);
    highpass.connect(sprayFilter);
    sprayFilter.connect(sprayGain);
    sprayGain.connect(this.fxGain);

    spraySource.start(now + 0.004);
    spraySource.stop(now + dur + 0.03);

    // 3. Delicate Crystalline Resonance (Aura of fine fragrance blooming)
    // Dreamy, ethereal chord [C#6, G#6, E7] ringing like micro-droplets in sunlight
    const auraNotes = [1108.73, 1661.22, 2637.02];
    auraNotes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      const noteStart = now + 0.04 + idx * 0.02;
      const noteDur = 0.52 - idx * 0.05;

      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.linearRampToValueAtTime(0.024 / (idx + 1), noteStart + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + noteDur);

      osc.connect(gain);
      gain.connect(this.fxGain);

      osc.start(noteStart);
      osc.stop(noteStart + noteDur + 0.04);
    });
  }

  // =========================================================================
  // TACTILE SOUND FX: GENTLE LACQUER STAMP & HARMONIOUS SEAL
  // =========================================================================
  async playStampSound() {
    this.initAudioContext();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      try { await this.ctx.resume(); } catch(e) {}
    }

    const now = this.ctx.currentTime;
    
    // 1. Soft Warm Felt Press (Gentle rounded tone)
    const pressOsc = this.ctx.createOscillator();
    const pressGain = this.ctx.createGain();
    const pressFilter = this.ctx.createBiquadFilter();

    pressOsc.type = "sine";
    pressOsc.frequency.setValueAtTime(130, now);
    pressOsc.frequency.exponentialRampToValueAtTime(70, now + 0.15);

    pressFilter.type = "lowpass";
    pressFilter.frequency.setValueAtTime(240, now);

    pressGain.gain.setValueAtTime(0.001, now);
    pressGain.gain.linearRampToValueAtTime(0.2, now + 0.015);
    pressGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    pressOsc.connect(pressFilter);
    pressFilter.connect(pressGain);
    pressGain.connect(this.fxGain);

    pressOsc.start(now);
    pressOsc.stop(now + 0.25);

    // 2. Delicate Silk Parchment Friction (Very soft velvet touch)
    const noiseDur = 0.07;
    const bufSize = Math.floor(this.ctx.sampleRate * noiseDur);
    const noiseBuf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const output = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noiseBuf;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(900, now);
    noiseFilter.Q.setValueAtTime(1.8, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.linearRampToValueAtTime(0.045, now + 0.01);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + noiseDur);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.fxGain);

    noiseNode.start(now);
    noiseNode.stop(now + noiseDur + 0.02);

    // 3. Gentle Heritage Chime (Delicate harmonic aura of completion)
    const chimeFreqs = [523.25, 783.99]; // C5, G5 harmonic interval
    chimeFreqs.forEach((freq, idx) => {
      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();

      chimeOsc.type = "sine";
      chimeOsc.frequency.setValueAtTime(freq, now + 0.02 + idx * 0.03);

      chimeGain.gain.setValueAtTime(0.0001, now + 0.02 + idx * 0.03);
      chimeGain.gain.linearRampToValueAtTime(0.055 / (idx + 1), now + 0.04 + idx * 0.03);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55 + idx * 0.03);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.fxGain);

      chimeOsc.start(now + 0.02 + idx * 0.03);
      chimeOsc.stop(now + 0.6);
    });
  }

  // =========================================================================
  // TACTILE SOUND FX: CHIME / SUCCESS
  // =========================================================================
  async playChime() {
    this.initAudioContext();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      try { await this.ctx.resume(); } catch(e) {}
    }
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0.001, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.09 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 0.7);

      osc.connect(gain);
      gain.connect(this.fxGain);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.75);
    });
  }
}

export const soundscape = new SoundscapeEngine();
