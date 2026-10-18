// Web Audio API procedural sound effects and dreamy lullaby synthesizer
// 100% local, self-contained, and legal. No external MP3 downloads needed.

class SoundService {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.volume = 0.7;
    this.currentMusicNode = null;
    this.musicTimer = null;
    this.currentTrackId = null;
    this.isPlayingMusic = false;
    this.musicGainNode = null;
    this.trackDuration = 45; // 45s simulated track loop length
    this.trackElapsed = 0;
    this.onTimeUpdate = null;
    this.onTrackEnded = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setValueAtTime(
        muted ? 0 : this.volume * 0.4,
        this.ctx.currentTime
      );
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.musicGainNode && this.ctx && !this.isMuted) {
      this.musicGainNode.gain.setValueAtTime(this.volume * 0.4, this.ctx.currentTime);
    }
  }

  // --- Sound Effects ---

  // Bubble pop (for button taps, planting candies)
  playPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // AudioContext policy safe catch
    }
  }

  // Sweet chime (for successes, achievements)
  playChime() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = now + idx * 0.06;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(this.volume * 0.22, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.35);
      });
    } catch {}
  }

  // Boop sound (when poking Giggles)
  playBoop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);

      gain.gain.setValueAtTime(this.volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  // Slingshot stretch sound
  playStretch(intensity = 0.5) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = 180 + intensity * 250;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.linearRampToValueAtTime(baseFreq + 40, now + 0.05);

      gain.gain.setValueAtTime(this.volume * 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  // Slingshot release / launch sound
  playLaunch() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.15);

      gain.gain.setValueAtTime(this.volume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  // Target hit / Piñata explosion sound
  playHit() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Multi-note pop chord + noise burst
      [440, 554.37, 659.25, 880].forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(this.volume * 0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
      });
    } catch {}
  }

  // Victory fanfare
  playFanfare() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const melody = [
        { f: 523.25, t: 0.0 }, // C5
        { f: 523.25, t: 0.1 }, // C5
        { f: 523.25, t: 0.2 }, // C5
        { f: 659.25, t: 0.3 }, // E5
        { f: 783.99, t: 0.45 }, // G5
        { f: 1046.5, t: 0.65 }, // C6
      ];

      melody.forEach(({ f, t }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = now + t;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, time);

        gain.gain.setValueAtTime(this.volume * 0.28, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.22);
      });
    } catch {}
  }

  // Mysterious secret star chime (Easter Egg)
  playSecret() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const freqs = [392.0, 587.33, 783.99, 987.77, 1174.66]; // G4, D5, G5, B5, D6

      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = now + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(this.volume * 0.25, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.6);
      });
    } catch {}
  }

  // --- Dream Library Music Synthesizer ---

  // Track melodie scales for procedural lullaby generator
  getTrackPattern(trackId) {
    switch (trackId) {
      case 'cloud-pillow': // Cloud Pillow Parade - playful music box
        return [
          523.25, 659.25, 783.99, 659.25, 880.0, 783.99, 659.25, 523.25,
          587.33, 698.46, 880.0, 698.46, 783.99, 659.25, 587.33, 523.25,
        ];
      case 'moonlight-milkshake': // Moonlight Milkshake - ambient jazz chimes
        return [
          440.0, 523.25, 659.25, 783.99, 987.77, 880.0, 659.25, 523.25,
          493.88, 587.33, 740.0, 880.0, 783.99, 659.25, 587.33, 440.0,
        ];
      case 'sleepy-star': // Sleepy Star Express - celestial bells
        return [
          659.25, 783.99, 987.77, 1318.5, 987.77, 783.99, 880.0, 659.25,
          587.33, 783.99, 880.0, 1174.66, 880.0, 783.99, 659.25, 523.25,
        ];
      case 'marshmallow-rain': // Marshmallow Rain - gentle soft Rhodes
        return [
          392.0, 493.88, 587.33, 783.99, 698.46, 587.33, 493.88, 392.0,
          440.0, 523.25, 659.25, 880.0, 783.99, 659.25, 523.25, 440.0,
        ];
      case 'tiny-moon': // Tiny Moon Lullaby - Brahms lullaby cadence
      default:
        return [
          523.25, 523.25, 659.25, 523.25, 523.25, 659.25, 523.25, 659.25,
          783.99, 698.46, 659.25, 587.33, 523.25, 587.33, 659.25, 523.25,
        ];
    }
  }

  playMusicTrack(trackId, startOffset = 0) {
    this.init();
    this.stopMusic();

    this.currentTrackId = trackId;
    this.isPlayingMusic = true;
    this.trackElapsed = startOffset;

    if (!this.ctx) return;

    // Master music gain node
    this.musicGainNode = this.ctx.createGain();
    this.musicGainNode.gain.setValueAtTime(
      this.isMuted ? 0 : this.volume * 0.35,
      this.ctx.currentTime
    );
    this.musicGainNode.connect(this.ctx.destination);

    const pattern = this.getTrackPattern(trackId);
    let noteIndex = Math.floor((this.trackElapsed / 0.5) % pattern.length);

    // Sequence the music notes every 500ms
    const interval = setInterval(() => {
      if (!this.isPlayingMusic || !this.ctx) {
        clearInterval(interval);
        return;
      }

      this.trackElapsed += 0.5;
      if (this.onTimeUpdate) {
        this.onTimeUpdate(this.trackElapsed, this.trackDuration);
      }

      // Check loop / track end
      if (this.trackElapsed >= this.trackDuration) {
        this.trackElapsed = 0;
        if (this.onTrackEnded) {
          this.onTrackEnded();
        }
      }

      // Synthesize note
      if (!this.isMuted) {
        try {
          const freq = pattern[noteIndex % pattern.length];
          const now = this.ctx.currentTime;

          const osc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();

          osc.type = trackId === 'marshmallow-rain' ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          // Soft lullaby envelope
          noteGain.gain.setValueAtTime(0.001, now);
          noteGain.gain.linearRampToValueAtTime(0.2, now + 0.08);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

          osc.connect(noteGain);
          noteGain.connect(this.musicGainNode);

          osc.start(now);
          osc.stop(now + 0.5);

          // Sub-bass root note every 4 beats for richness
          if (noteIndex % 4 === 0) {
            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            bassOsc.type = 'sine';
            bassOsc.frequency.setValueAtTime(freq / 2, now);

            bassGain.gain.setValueAtTime(0.12, now);
            bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

            bassOsc.connect(bassGain);
            bassGain.connect(this.musicGainNode);

            bassOsc.start(now);
            bassOsc.stop(now + 1.2);
          }
        } catch {}
      }

      noteIndex++;
    }, 500);

    this.musicTimer = interval;
  }

  pauseMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  resumeMusic() {
    if (this.currentTrackId) {
      this.playMusicTrack(this.currentTrackId, this.trackElapsed);
    }
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    this.trackElapsed = 0;
  }
}

export const soundService = new SoundService();
