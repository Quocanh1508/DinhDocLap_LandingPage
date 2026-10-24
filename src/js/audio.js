// Web Audio API Ambient Soundscape & Sound FX Engine
// Generates nostalgic 1970s Saigon Jazz, vintage radio tuning, warm vinyl crackle, and realistic tactile sound FX

class SoundscapeEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.radioGain = null;
    this.musicGain = null;
    this.noiseNode = null;
    this.loopTimer = null;
    this.bassTimer = null;
    this.leadTimer = null;
    this.step = 0;
    
    // Rich 1970s Saigon Jazz Chords (Frequencies in Hz)
    // Dm9 -> G13 -> Cmaj9 -> Am11 -> Fmaj7#11 -> Em9 -> A7alt -> Dm11
    this.chordProgression = [
      {
        name: "Dm9",
        bass: 73.42, // D2
        walking: [73.42, 82.41, 98.00, 110.00],
        notes: [146.83, 174.61, 220.00, 261.63, 329.63], // D3, F3, A3, C4, E4
        melody: [440.00, 392.00, 329.63] // A4, G4, E4
      },
      {
        name: "G13",
        bass: 98.00, // G2
        walking: [98.00, 110.00, 123.47, 130.81],
        notes: [196.00, 246.94, 293.66, 329.63, 440.00], // G3, B3, D4, E4, A4
        melody: [392.00, 329.63, 293.66] // G4, E4, D4
      },
      {
        name: "Cmaj9",
        bass: 65.41, // C2
        walking: [65.41, 82.41, 98.00, 110.00],
        notes: [130.81, 164.81, 196.00, 246.94, 293.66], // C3, E3, G3, B3, D4
        melody: [293.66, 329.63, 392.00] // D4, E4, G4
      },
      {
        name: "Am11",
        bass: 110.00, // A2
        walking: [110.00, 98.00, 87.31, 73.42],
        notes: [220.00, 261.63, 293.66, 329.63, 392.00], // A3, C4, D4, E4, G4
        melody: [440.00, 493.88, 440.00] // A4, B4, A4
      },
      {
        name: "Fmaj7",
        bass: 87.31, // F2
        walking: [87.31, 98.00, 110.00, 123.47],
        notes: [174.61, 220.00, 261.63, 329.63, 369.99], // F3, A3, C4, E4, F#4
        melody: [349.23, 329.63, 293.66] // F4, E4, D4
      },
      {
        name: "Em9",
        bass: 82.41, // E2
        walking: [82.41, 98.00, 110.00, 116.54],
        notes: [164.81, 196.00, 246.94, 293.66, 369.99], // E3, G3, B3, D4, F#4
        melody: [329.63, 293.66, 246.94] // E4, D4, B3
      },
      {
        name: "A7alt",
        bass: 110.00, // A2
        walking: [110.00, 123.47, 138.59, 146.83],
        notes: [220.00, 277.18, 329.63, 392.00, 415.30], // A3, C#4, E4, G4, G#4
        melody: [415.30, 392.00, 329.63] // G#4, G4, E4
      },
      {
        name: "Dm11",
        bass: 73.42, // D2
        walking: [73.42, 82.41, 98.00, 110.00],
        notes: [146.83, 220.00, 261.63, 293.66, 349.23], // D3, A3, C4, D4, F4
        melody: [440.00, 349.23, 293.66] // A4, F4, D4
      }
    ];
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Master Output Gain (Audible & Warm)
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Sub-gains
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.radioGain = this.ctx.createGain();
    this.radioGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
    this.radioGain.connect(this.masterGain);
  }

  async toggle() {
    this.init();
    
    // Ensure context is running after user click
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (err) {
        console.warn("Could not resume AudioContext:", err);
      }
    }

    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      await this.start();
      return true;
    }
  }

  async start() {
    this.isPlaying = true;

    // 1. Play realistic 1970s Radio Dial Tuning & Needle Drop
    this.playRadioTuningIntro();

    // 2. Start Warm Vinyl Crackle in background
    setTimeout(() => {
      if (this.isPlaying) {
        this.startVinylNoise();
      }
    }, 400);

    // 3. Start the Vintage Saigon Jazz Arrangement after short tuning effect
    setTimeout(() => {
      if (this.isPlaying) {
        this.step = 0;
        this.playJazzCycle();
        this.loopTimer = setInterval(() => {
          if (this.isPlaying) {
            this.playJazzCycle();
          }
        }, 4000);
      }
    }, 550);
  }

  stop() {
    this.isPlaying = false;
    if (this.loopTimer) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
    if (this.bassTimer) {
      clearInterval(this.bassTimer);
      this.bassTimer = null;
    }
    if (this.leadTimer) {
      clearInterval(this.leadTimer);
      this.leadTimer = null;
    }
    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
      } catch (e) {}
      this.noiseNode = null;
    }
  }

  // 1970s Analog Radio Dial Sweep & Needle Drop
  playRadioTuningIntro() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // High dial sweep whistle
    const sweepOsc = this.ctx.createOscillator();
    const sweepGain = this.ctx.createGain();
    sweepOsc.type = "sine";
    sweepOsc.frequency.setValueAtTime(1800, now);
    sweepOsc.frequency.exponentialRampToValueAtTime(750, now + 0.35);
    sweepOsc.frequency.linearRampToValueAtTime(1200, now + 0.5);

    sweepGain.gain.setValueAtTime(0.001, now);
    sweepGain.gain.linearRampToValueAtTime(0.12, now + 0.1);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    sweepOsc.connect(sweepGain);
    sweepGain.connect(this.radioGain);
    sweepOsc.start(now);
    sweepOsc.stop(now + 0.52);

    // Needle drop thump
    const popOsc = this.ctx.createOscillator();
    const popGain = this.ctx.createGain();
    popOsc.type = "triangle";
    popOsc.frequency.setValueAtTime(90, now + 0.35);
    popOsc.frequency.exponentialRampToValueAtTime(30, now + 0.45);

    popGain.gain.setValueAtTime(0.25, now + 0.35);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

    popOsc.connect(popGain);
    popGain.connect(this.masterGain);
    popOsc.start(now + 0.35);
    popOsc.stop(now + 0.5);
  }

  // Continuous Warm Vinyl Noise + Crackle Pops
  startVinylNoise() {
    if (!this.ctx || this.noiseNode) return;
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 3; // 3 seconds loop
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Gentle surface hiss
      const hiss = (Math.random() * 2 - 1) * 0.025;
      // Periodic distinct vinyl crackles & pops
      const crackle = Math.random() < 0.003 ? (Math.random() * 0.5 - 0.25) : 0;
      data[i] = hiss + crackle;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    // Tube radio bandpass filter (Warm vintage tone)
    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(1200, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(1.2, this.ctx.currentTime);

    this.noiseNode.connect(bandpass);
    bandpass.connect(this.radioGain);
    this.noiseNode.start();
  }

  // Play One 4-second Jazz Cycle (Chord + Walking Bass + Soulful Melody)
  playJazzCycle() {
    if (!this.ctx || !this.isPlaying) return;
    const item = this.chordProgression[this.step % this.chordProgression.length];
    this.step++;
    const now = this.ctx.currentTime;

    // A. Lush Fender Rhodes / Electric Piano Chords
    item.notes.forEach((freq, idx) => {
      // Main fundamental oscillator
      const osc1 = this.ctx.createOscillator();
      // Slight detune for warm vintage analog chorus
      const osc2 = this.ctx.createOscillator();
      const chordGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(freq, now + idx * 0.05);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(freq * 1.002, now + idx * 0.05); // +3 cents detune

      // Vintage Warm Lowpass Filter
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(380, now + 3.8);

      // Volume envelope (Cleanly audible)
      const peakVol = 0.16 / (idx + 1) * 1.8;
      chordGain.gain.setValueAtTime(0.001, now + idx * 0.05);
      chordGain.gain.linearRampToValueAtTime(peakVol, now + idx * 0.05 + 0.18);
      chordGain.gain.exponentialRampToValueAtTime(0.001, now + 3.9);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(chordGain);
      chordGain.connect(this.musicGain);

      osc1.start(now + idx * 0.05);
      osc2.start(now + idx * 0.05);
      osc1.stop(now + 4.0);
      osc2.stop(now + 4.0);
    });

    // B. Plucked Acoustic Double-Bass (Walking Bass on Beats 1, 2, 3, 4)
    item.walking.forEach((bFreq, beatIdx) => {
      const beatTime = now + beatIdx * 0.95;
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      const bassFilter = this.ctx.createBiquadFilter();

      bassOsc.type = "triangle";
      bassOsc.frequency.setValueAtTime(bFreq, beatTime);

      bassFilter.type = "lowpass";
      bassFilter.frequency.setValueAtTime(220, beatTime);

      // Acoustic pluck envelope
      bassGain.gain.setValueAtTime(0.001, beatTime);
      bassGain.gain.linearRampToValueAtTime(0.38, beatTime + 0.04);
      bassGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.85);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.musicGain);

      bassOsc.start(beatTime);
      bassOsc.stop(beatTime + 0.9);
    });

    // C. Soulful Nostalgic Tenor Sax / Trumpet Lead
    item.melody.forEach((mFreq, mIdx) => {
      const mTime = now + 0.6 + mIdx * 1.1;
      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();
      const vibrato = this.ctx.createOscillator();
      const vibratoGain = this.ctx.createGain();
      const leadFilter = this.ctx.createBiquadFilter();

      leadOsc.type = "sawtooth";
      leadOsc.frequency.setValueAtTime(mFreq, mTime);

      // 5Hz Subtle Vibrato
      vibrato.frequency.setValueAtTime(5.2, mTime);
      vibratoGain.gain.setValueAtTime(4.5, mTime); // +/- 4.5Hz pitch vibrato
      vibrato.connect(leadOsc.frequency);

      // Soft Saxophone Formant Filter
      leadFilter.type = "bandpass";
      leadFilter.frequency.setValueAtTime(1100, mTime);
      leadFilter.Q.setValueAtTime(2.2, mTime);

      leadGain.gain.setValueAtTime(0.001, mTime);
      leadGain.gain.linearRampToValueAtTime(0.18, mTime + 0.15);
      leadGain.gain.exponentialRampToValueAtTime(0.001, mTime + 1.05);

      leadOsc.connect(leadFilter);
      leadFilter.connect(leadGain);
      leadGain.connect(this.musicGain);

      vibrato.start(mTime);
      leadOsc.start(mTime);
      vibrato.stop(mTime + 1.1);
      leadOsc.stop(mTime + 1.1);
    });
  }

  // Tactile Sound FX: Gentle Lacquer Stamp & Harmonious Seal
  async playStampSound() {
    this.init();
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
    pressGain.connect(this.masterGain);

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
    noiseGain.connect(this.masterGain);

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
      chimeGain.connect(this.masterGain);

      chimeOsc.start(now + 0.02 + idx * 0.03);
      chimeOsc.stop(now + 0.6);
    });
  }

  // Tactile Sound FX: Perfume Mist Spray
  async playSpraySound() {
    this.init();
    if (this.ctx.state === 'suspended') {
      try { await this.ctx.resume(); } catch(e) {}
    }

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
    filter.frequency.setValueAtTime(3400, now);
    filter.frequency.exponentialRampToValueAtTime(1600, now + dur);
    filter.Q.setValueAtTime(2.2, now);

    const sprayGain = this.ctx.createGain();
    sprayGain.gain.setValueAtTime(0.001, now);
    sprayGain.gain.linearRampToValueAtTime(0.4, now + 0.05);
    sprayGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    sprayNode.connect(filter);
    filter.connect(sprayGain);
    sprayGain.connect(this.masterGain);

    sprayNode.start(now);
    sprayNode.stop(now + dur + 0.05);
  }

  // Tactile Sound FX: Chime / Success
  async playChime() {
    this.init();
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
      gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.09 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.85);
    });
  }
}

export const soundscape = new SoundscapeEngine();
