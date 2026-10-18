import React, { useState, useEffect, useCallback } from 'react';
import { soundService } from '../../services/soundService';
import { useInteraction } from '../../services/interactionContext';
import './DreamLibrary.css';

const TRACKS = [
  {
    id: 'cloud-pillow',
    title: 'Cloud Pillow Parade',
    artist: 'Baby Giggles & The Stardust Orchestra',
    duration: 45,
    genre: 'Music Box Lullaby',
    vibe: '☁️ Dreamy & Whimsical',
    description: 'A gentle chime waltz through fields of fluffy marshmallow clouds.',
  },
  {
    id: 'moonlight-milkshake',
    title: 'Moonlight Milkshake',
    artist: 'Giggles Sleepy Sound System',
    duration: 45,
    genre: 'Pastel Ambient Synth',
    vibe: '🥛 Sweet & Serene',
    description: 'Soft celestial bells with a warm strawberry milk sub-bass groove.',
  },
  {
    id: 'sleepy-star',
    title: 'Sleepy Star Express',
    artist: 'The Night Sky Express',
    duration: 45,
    genre: 'Celestial Glockenspiel',
    vibe: '⭐ Twinkly & Cozy',
    description: 'A sleepy midnight train chugging across rainbow stardust tracks.',
  },
  {
    id: 'marshmallow-rain',
    title: 'Marshmallow Rain',
    artist: 'Pillow Fort Trio',
    duration: 45,
    genre: 'Soothing Rhodes Dream',
    vibe: '🌧️ Warm & Tender',
    description: 'Peaceful raindrops tapping on sugar windows with warm velvet chords.',
  },
  {
    id: 'tiny-moon',
    title: 'Tiny Moon Lullaby',
    artist: 'Baby Giggles',
    duration: 45,
    genre: 'Music Box Classic',
    vibe: '🌙 Soft & Hypnotic',
    description: 'A delicate music-box rendition of timeless bedtime cadence.',
  },
];

export function DreamLibrary() {
  const { gigglesReact, incrementHitCount } = useInteraction();

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [loopMode, setLoopMode] = useState('all'); // 'all' | 'one'
  const playlist = TRACKS;
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(null); // null | 1 | 5 | 10 | 15
  const [sleepSecondsLeft, setSleepSecondsLeft] = useState(null);

  const activeTrack = playlist[currentTrackIndex] || TRACKS[0];

  const handleNextTrack = useCallback(() => {
    if (loopMode === 'one') {
      soundService.playMusicTrack(activeTrack.id, 0);
      setCurrentTime(0);
      return;
    }

    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
    setCurrentTime(0);
    soundService.playMusicTrack(playlist[nextIndex].id, 0);
  }, [activeTrack.id, currentTrackIndex, loopMode, playlist]);

  const handlePrevTrack = useCallback(() => {
    const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    setCurrentTrackIndex(prevIndex);
    setCurrentTime(0);
    soundService.playMusicTrack(playlist[prevIndex].id, 0);
  }, [currentTrackIndex, playlist]);

  // Sync with soundService
  useEffect(() => {
    soundService.onTimeUpdate = (elapsed) => {
      setCurrentTime(elapsed);
    };

    soundService.onTrackEnded = () => {
      handleNextTrack();
    };

    return () => {
      soundService.stopMusic();
      soundService.onTimeUpdate = null;
      soundService.onTrackEnded = null;
    };
  }, [handleNextTrack]);

  // Handle sleep timer countdown
  useEffect(() => {
    if (sleepSecondsLeft === null) return;

    const timer = setInterval(() => {
      setSleepSecondsLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timer);
          soundService.stopMusic();
          setIsPlaying(false);
          setSleepTimerMinutes(null);
          gigglesReact('sleep_timer_ended');
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sleepSecondsLeft, gigglesReact]);

  const handlePlayPause = () => {
    if (isPlaying) {
      soundService.pauseMusic();
      setIsPlaying(false);
      gigglesReact('track_paused');
    } else {
      soundService.playMusicTrack(activeTrack.id, currentTime);
      setIsPlaying(true);
      incrementHitCount();
      gigglesReact('track_played', { trackName: activeTrack.title });
    }
  };

  const handleTrackSelect = (index) => {
    setCurrentTrackIndex(index);
    setCurrentTime(0);
    soundService.playMusicTrack(playlist[index].id, 0);
    setIsPlaying(true);
    incrementHitCount();
    gigglesReact('track_played', { trackName: playlist[index].title });
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (isPlaying) {
      soundService.playMusicTrack(activeTrack.id, newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    soundService.setVolume(newVol);
  };

  const handleSetSleepTimer = (minutes) => {
    if (sleepTimerMinutes === minutes) {
      setSleepTimerMinutes(null);
      setSleepSecondsLeft(null);
    } else {
      setSleepTimerMinutes(minutes);
      setSleepSecondsLeft(minutes * 60);
      gigglesReact('sleep_timer_set');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="dream-library-root" role="region" aria-label="Giggles Dream Library Audio Experience">
      {/* Top Banner with Sleepy Pip Art */}
      <div className="library-hero-card">
        <img
          src="/images/pip_moon_sleep.jpg"
          alt="Baby Giggles sleeping on a crescent moon"
          className="library-hero-art"
        />
        <div className="library-hero-meta">
          <div className="library-badge">
            <span>🌙 Sleepy Sound Machine</span>
          </div>
          <h2 className="library-title">Giggles' Dream Library</h2>
          <p className="library-subtitle">
            Procedural, soothing retro lullabies crafted to calm baby minds and sweet humans.
          </p>
        </div>
      </div>

      {/* Main Player Box */}
      <div className="music-player-card">
        <div className="player-track-header">
          <div className="track-album-art">
            <span className="album-art-emoji">{activeTrack.vibe.split(' ')[0]}</span>
          </div>
          <div className="track-text-details">
            <h3 className="track-main-title">{activeTrack.title}</h3>
            <span className="track-artist-name">{activeTrack.artist}</span>
            <span className="track-vibe-tag">{activeTrack.genre}</span>
          </div>
        </div>

        {/* Audio Wave Visualizer */}
        <div className={`audio-visualizer-bars ${isPlaying ? 'playing' : ''}`} aria-hidden="true">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="wave-bar"
              style={{ animationDelay: `${(i % 5) * 0.15}s` }}
            />
          ))}
        </div>

        {/* Seek Bar */}
        <div className="player-progress-row">
          <span className="time-display">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={activeTrack.duration}
            step="0.5"
            value={currentTime}
            onChange={handleSeek}
            className="seek-slider"
            aria-label="Seek track position"
          />
          <span className="time-display">{formatTime(activeTrack.duration)}</span>
        </div>

        {/* Primary Controls */}
        <div className="player-primary-controls">
          <button
            type="button"
            className="ctrl-btn secondary"
            onClick={handlePrevTrack}
            title="Previous track"
            aria-label="Previous track"
          >
            ⏮
          </button>

          <button
            type="button"
            className="ctrl-btn play-pause-btn"
            onClick={handlePlayPause}
            title={isPlaying ? 'Pause lullaby' : 'Play lullaby'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <button
            type="button"
            className="ctrl-btn secondary"
            onClick={handleNextTrack}
            title="Next track"
            aria-label="Next track"
          >
            ⏭
          </button>

          {/* Loop toggle */}
          <button
            type="button"
            className={`ctrl-btn loop-btn ${loopMode === 'one' ? 'loop-one' : ''}`}
            onClick={() => setLoopMode((m) => (m === 'all' ? 'one' : 'all'))}
            title={`Loop Mode: ${loopMode === 'all' ? 'All Tracks' : 'Repeat Single Track'}`}
            aria-label={`Toggle loop mode. Currently looping ${loopMode}`}
          >
            {loopMode === 'one' ? '🔂' : '🔁'}
          </button>
        </div>

        {/* Bottom Options Row (Volume & Sleep Timer) */}
        <div className="player-bottom-options">
          {/* Volume Slider */}
          <div className="volume-group" title="Volume">
            <span className="vol-icon" aria-hidden="true">🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="vol-slider"
              aria-label="Adjust volume"
            />
          </div>

          {/* Sleep Timer */}
          <div className="sleep-timer-group">
            <span className="sleep-label">💤 Sleep Timer:</span>
            {[1, 5, 10, 15].map((mins) => (
              <button
                key={mins}
                type="button"
                className={`sleep-btn ${sleepTimerMinutes === mins ? 'active' : ''}`}
                onClick={() => handleSetSleepTimer(mins)}
                aria-label={`Set sleep timer for ${mins} minutes`}
              >
                {mins}m
              </button>
            ))}
            {sleepSecondsLeft !== null && (
              <span className="sleep-countdown" aria-live="polite">
                ({formatTime(sleepSecondsLeft)} left)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Playlist Section */}
      <div className="playlist-container">
        <h4 className="playlist-heading">Bedtime Playlist ({playlist.length} Lullabies)</h4>
        <div className="playlist-list" role="list">
          {playlist.map((track, idx) => {
            const isCurrent = idx === currentTrackIndex;
            return (
              <button
                key={track.id}
                type="button"
                className={`playlist-item-card ${isCurrent ? 'active' : ''}`}
                onClick={() => handleTrackSelect(idx)}
                role="listitem"
                aria-label={`${track.title} by ${track.artist}. ${isCurrent ? 'Currently playing.' : ''}`}
              >
                <div className="item-left">
                  <span className="item-number">{isCurrent && isPlaying ? '🎶' : idx + 1}</span>
                  <div className="item-meta">
                    <span className="item-title">{track.title}</span>
                    <span className="item-desc">{track.description}</span>
                  </div>
                </div>
                <div className="item-right">
                  <span className="item-vibe">{track.vibe}</span>
                  <span className="item-duration">{formatTime(track.duration)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
