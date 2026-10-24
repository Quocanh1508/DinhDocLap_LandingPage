// Web Audio API Ambient Soundscape & Sound FX Engine
// Generates 1970s radio vinyl warmth, subtle nostalgic Saigon jazz chords, and realistic tactile sound FX

class SoundscapeEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.radioGain = null;
    this.musicGain = null;
    this.intervalId = null;
    this.noiseNode = null;
    this.chordStep = 0;
    
    // Nostalgic Saigon Jazz pentatonic / minor 7th chords:
    // Dm9, G13, Cmaj7, Am9, Fmaj7#11, Em7, A7alt
    this.chords = [
      [146.83, 220.00, 261.63, 329.63, 440.00], // Dm9
      [196.00, 246.94, 329.63, 392.00, 440.00], // G13
      [130.81, 196.00, 246.94, 293.66, 329.63], // Cmaj7
      [110.00, 164.81, 220.00, 261.63, 329.63], // Am9
      [174.61, 220.00, 261.63, 329.63, 370.00], // Fmaj7#11
      [164.81, 196.00, 246.94, 293.66, 392.00], // Em7
    ];
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.radioGain = this.ctx.createGain();
    this.radioGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    this.radioGain.connect(this.masterGain);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);
  }

  toggle() {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  start() {
    this.isPlaying = true;
    this.startVinylNoise();
    this.playAmbientChordLoop();
    this.intervalId = setInterval(() => {
      if (this.isPlaying) this.playAmbientChordLoop();
    }, 4200);
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
      } catch (e) {}
      this.noiseNode = null;
    }
  }

  startVinylNoise() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Pink noise + vinyl crackles
      const crackle = Math.random() < 0.0015 ? (Math.random() * 0.8 - 0.4) : 0;
      output[i] = (Math.random() * 2 - 1) * 0.03 + crackle;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    // Filter to simulate 1970s tube radio bandwidth
    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(1400, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(1.8, this.ctx.currentTime);

    this.noiseNode.connect(bandpass);
    bandpass.connect(this.radioGain);
    this.noiseNode.start();
  }

  playAmbientChordLoop() {
    if (!this.ctx || !this.isPlaying) return;
    const chord = this.chords[this.chordStep % this.chords.length];
    this.chordStep++;
    const now = this.ctx.currentTime;

    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Warm vintage electric piano / muted vibraphone tone
      osc.type = idx === 0 ? "triangle" : (idx % 2 === 0 ? "sine" : "triangle");
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(950, now);
      filter.frequency.exponentialRampToValueAtTime(350, now + 3.8);

      // Slow attack, long dreamy sustain, smooth release
      noteGain.gain.setValueAtTime(0.0001, now + idx * 0.08);
      noteGain.gain.exponentialRampToValueAtTime(0.06 / (idx + 1), now + idx * 0.08 + 0.6);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.0);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.musicGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + 4.2);
    });
  }

  // Sound FX: Heavy Lacquer Stamp Thud
  playStampSound() {
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    
    // Impact thud (low oscillator)
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.28);

    oscGain.gain.setValueAtTime(0.4, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.32);

    // Click / wooden slap
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = "sawtooth";
    snapOsc.frequency.setValueAtTime(800, now);
    snapOsc.frequency.exponentialRampToValueAtTime(120, now + 0.06);

    snapGain.gain.setValueAtTime(0.2, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    snapOsc.connect(snapGain);
    snapGain.connect(this.masterGain);
    snapOsc.start(now);
    snapOsc.stop(now + 0.09);
  }

  // Sound FX: Perfume Mist Spray (White noise sweep)
  playSpraySound() {
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const dur = 0.55;
    const bufferSize = this.ctx.sampleRate * dur;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const sprayNode = this.ctx.createBufferSource();
    sprayNode.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(3200, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + dur);
    filter.Q.setValueAtTime(2.2, now);

    const sprayGain = this.ctx.createGain();
    sprayGain.gain.setValueAtTime(0.001, now);
    sprayGain.gain.linearRampToValueAtTime(0.25, now + 0.06);
    sprayGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    sprayNode.connect(filter);
    filter.connect(sprayGain);
    sprayGain.connect(this.masterGain);

    sprayNode.start(now);
    sprayNode.stop(now + dur + 0.05);
  }

  // Sound FX: Chime / Success
  playChime() {
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0.001, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.09 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.85);
    });
  }
}

export const soundscape = new SoundscapeEngine();
