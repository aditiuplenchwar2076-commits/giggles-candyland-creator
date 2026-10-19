import React, { useState, useEffect, useCallback } from 'react';
import { soundService } from '../../services/soundService';
import { useInteraction } from '../../services/interactionContext';
import './DreamLibrary.css';

export const TRACK_CATALOG = [
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

const INITIAL_CUSTOM_PLAYLISTS = [
  {
    id: 'giggles-favorites',
    name: "Giggles' Cozy Bedtime Mix",
    trackIds: ['cloud-pillow', 'sleepy-star', 'tiny-moon'],
  },
];

export function DreamLibrary() {
  const { gigglesReact, incrementHitCount } = useInteraction();

  // Mode: 'all' (Master Catalog) or 'custom' (User Playlists)
  const [playlistMode, setPlaylistMode] = useState('all');

  // Custom Playlists State (persisted to localStorage)
  const [customPlaylists, setCustomPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem('giggles_custom_playlists');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((p) => (p.id === 'pips-favorites' ? { ...p, id: 'giggles-favorites' } : p));
      }
      return INITIAL_CUSTOM_PLAYLISTS;
    } catch {
      return INITIAL_CUSTOM_PLAYLISTS;
    }
  });
  const [activeCustomPlaylistId, setActiveCustomPlaylistId] = useState('giggles-favorites');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [selectedTrackToAdd, setSelectedTrackToAdd] = useState('cloud-pillow');

  // Active playlist resolution
  const activeCustomPlaylist =
    customPlaylists.find((p) => p.id === activeCustomPlaylistId) || customPlaylists[0];

  const currentPlaylistTracks =
    playlistMode === 'all'
      ? TRACK_CATALOG
      : activeCustomPlaylist
      ? activeCustomPlaylist.trackIds
          .map((id) => TRACK_CATALOG.find((t) => t.id === id))
          .filter(Boolean)
      : [];

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [loopMode, setLoopMode] = useState('all'); // 'all' | 'one'
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(null); // null | 1 | 5 | 10 | 15
  const [sleepSecondsLeft, setSleepSecondsLeft] = useState(null);

  const activeTrack = currentPlaylistTracks[currentTrackIndex] || TRACK_CATALOG[0];

  // Save custom playlists to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('giggles_custom_playlists', JSON.stringify(customPlaylists));
    } catch {
      // ignore
    }
  }, [customPlaylists]);

  const handleNextTrack = useCallback(() => {
    if (currentPlaylistTracks.length === 0) return;

    if (loopMode === 'one' && activeTrack) {
      soundService.playMusicTrack(activeTrack.id, 0);
      setCurrentTime(0);
      return;
    }

    const nextIndex = (currentTrackIndex + 1) % currentPlaylistTracks.length;
    setCurrentTrackIndex(nextIndex);
    setCurrentTime(0);
    const nextTrack = currentPlaylistTracks[nextIndex];
    if (nextTrack) {
      soundService.playMusicTrack(nextTrack.id, 0);
    }
  }, [activeTrack, currentPlaylistTracks, currentTrackIndex, loopMode]);

  const handlePrevTrack = useCallback(() => {
    if (currentPlaylistTracks.length === 0) return;
    const prevIndex = (currentTrackIndex - 1 + currentPlaylistTracks.length) % currentPlaylistTracks.length;
    setCurrentTrackIndex(prevIndex);
    setCurrentTime(0);
    const prevTrack = currentPlaylistTracks[prevIndex];
    if (prevTrack) {
      soundService.playMusicTrack(prevTrack.id, 0);
    }
  }, [currentPlaylistTracks, currentTrackIndex]);

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
    if (!activeTrack || currentPlaylistTracks.length === 0) return;

    if (isPlaying) {
      soundService.pauseMusic();
      setIsPlaying(false);
      gigglesReact('track_paused');
    } else {
      setIsLoadingTrack(true);
      soundService.playMusicTrack(activeTrack.id, currentTime);
      setTimeout(() => setIsLoadingTrack(false), 250);
      setIsPlaying(true);
      incrementHitCount();
      gigglesReact('track_played', { trackName: activeTrack.title });
    }
  };

  const handleTrackSelect = (index) => {
    if (!currentPlaylistTracks[index]) return;
    setCurrentTrackIndex(index);
    setCurrentTime(0);
    setIsLoadingTrack(true);
    soundService.playMusicTrack(currentPlaylistTracks[index].id, 0);
    setTimeout(() => setIsLoadingTrack(false), 250);
    setIsPlaying(true);
    incrementHitCount();
    gigglesReact('track_played', { trackName: currentPlaylistTracks[index].title });
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (isPlaying && activeTrack) {
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

  // Custom Playlist Management Functions
  const handleCreateNewPlaylist = (e) => {
    e.preventDefault();
    const trimmed = newPlaylistName.trim();
    if (!trimmed) return;

    const newPl = {
      id: `pl-${Date.now()}`,
      name: trimmed,
      trackIds: [],
    };
    setCustomPlaylists((prev) => [...prev, newPl]);
    setActiveCustomPlaylistId(newPl.id);
    setNewPlaylistName('');
    setIsCreatingPlaylist(false);
    gigglesReact('track_played', { trackName: `Created playlist: ${trimmed}` });
  };

  const handleAddTrackToCurrentPlaylist = () => {
    if (!activeCustomPlaylist) return;
    setCustomPlaylists((prev) =>
      prev.map((pl) =>
        pl.id === activeCustomPlaylist.id
          ? { ...pl, trackIds: [...pl.trackIds, selectedTrackToAdd] }
          : pl
      )
    );
  };

  const handleRemoveTrackFromPlaylist = (e, indexToRemove) => {
    e.stopPropagation();
    if (!activeCustomPlaylist) return;
    setCustomPlaylists((prev) =>
      prev.map((pl) =>
        pl.id === activeCustomPlaylist.id
          ? { ...pl, trackIds: pl.trackIds.filter((_, i) => i !== indexToRemove) }
          : pl
      )
    );
    if (currentTrackIndex >= indexToRemove && currentTrackIndex > 0) {
      setCurrentTrackIndex((i) => i - 1);
    }
  };

  const handleMoveTrackOrder = (e, index, direction) => {
    e.stopPropagation();
    if (!activeCustomPlaylist) return;
    const ids = [...activeCustomPlaylist.trackIds];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= ids.length) return;

    const temp = ids[index];
    ids[index] = ids[targetIdx];
    ids[targetIdx] = temp;

    setCustomPlaylists((prev) =>
      prev.map((pl) => (pl.id === activeCustomPlaylist.id ? { ...pl, trackIds: ids } : pl))
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="dream-library-root" role="region" aria-label="Giggles Dream Library Audio Experience">
      {/* Top Banner with Sleepy Giggles Art */}
      <div className="library-hero-card">
        <img
          src="/images/pip_moon_sleep.jpg"
          alt="Baby Giggles sleeping peacefully on a crescent moon"
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
            <span className="album-art-emoji">
              {activeTrack ? activeTrack.vibe.split(' ')[0] : '🎵'}
            </span>
          </div>
          <div className="track-text-details">
            <h3 className="track-main-title">
              {isLoadingTrack ? 'Tuning melody... ✨' : activeTrack ? activeTrack.title : 'No Track Selected'}
            </h3>
            <span className="track-artist-name">
              {activeTrack ? activeTrack.artist : 'Select or create a playlist below'}
            </span>
            {activeTrack && <span className="track-vibe-tag">{activeTrack.genre}</span>}
          </div>
        </div>

        {/* Audio Wave Visualizer & Loading State */}
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
            max={activeTrack ? activeTrack.duration : 45}
            step="0.5"
            value={currentTime}
            onChange={handleSeek}
            disabled={!activeTrack || currentPlaylistTracks.length === 0}
            className="seek-slider"
            aria-label="Seek track position"
          />
          <span className="time-display">{formatTime(activeTrack ? activeTrack.duration : 45)}</span>
        </div>

        {/* Primary Controls */}
        <div className="player-primary-controls">
          <button
            type="button"
            className="ctrl-btn secondary"
            onClick={handlePrevTrack}
            disabled={currentPlaylistTracks.length === 0}
            title="Previous track"
            aria-label="Previous track"
          >
            ⏮
          </button>

          <button
            type="button"
            className="ctrl-btn play-pause-btn"
            onClick={handlePlayPause}
            disabled={currentPlaylistTracks.length === 0}
            title={isPlaying ? 'Pause lullaby' : 'Play lullaby'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <button
            type="button"
            className="ctrl-btn secondary"
            onClick={handleNextTrack}
            disabled={currentPlaylistTracks.length === 0}
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
            title={`Loop Mode: ${loopMode === 'all' ? 'Repeat Entire Playlist' : 'Repeat Single Track'}`}
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

      {/* Playlist Navigation & Management Bar */}
      <div className="playlist-tabs-wrapper">
        <div className="playlist-mode-switcher">
          <button
            type="button"
            className={`pl-mode-btn ${playlistMode === 'all' ? 'active' : ''}`}
            onClick={() => {
              setPlaylistMode('all');
              setCurrentTrackIndex(0);
            }}
          >
            ⭐ Master Catalog (5 Lullabies)
          </button>
          <button
            type="button"
            className={`pl-mode-btn ${playlistMode === 'custom' ? 'active' : ''}`}
            onClick={() => {
              setPlaylistMode('custom');
              setCurrentTrackIndex(0);
            }}
          >
            ✨ Custom Playlists ({customPlaylists.length})
          </button>
        </div>

        {/* Custom Playlist Selector & Creation Controls */}
        {playlistMode === 'custom' && (
          <div className="custom-pl-controls-card">
            <div className="custom-pl-header-row">
              <div className="custom-pl-select-group">
                <label htmlFor="custom-pl-select" className="custom-pl-label">Active Playlist:</label>
                <select
                  id="custom-pl-select"
                  className="custom-pl-dropdown"
                  value={activeCustomPlaylistId}
                  onChange={(e) => {
                    setActiveCustomPlaylistId(e.target.value);
                    setCurrentTrackIndex(0);
                  }}
                >
                  {customPlaylists.map((pl) => (
                    <option key={pl.id} value={pl.id}>
                      {pl.name} ({pl.trackIds.length} tracks)
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="btn-create-pl"
                onClick={() => setIsCreatingPlaylist((prev) => !prev)}
              >
                {isCreatingPlaylist ? '✕ Cancel' : '➕ New Playlist'}
              </button>
            </div>

            {/* Create New Playlist Input Form */}
            {isCreatingPlaylist && (
              <form onSubmit={handleCreateNewPlaylist} className="create-pl-form">
                <input
                  type="text"
                  placeholder="Playlist name (e.g. Starry Cloud Nap)..."
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="create-pl-input"
                  maxLength={30}
                  autoFocus
                />
                <button type="submit" className="btn-confirm-pl">
                  Create Playlist
                </button>
              </form>
            )}

            {/* Add Track to Playlist Bar */}
            {activeCustomPlaylist && (
              <div className="add-track-bar">
                <span className="add-track-label">Add to "{activeCustomPlaylist.name}":</span>
                <select
                  className="track-to-add-select"
                  value={selectedTrackToAdd}
                  onChange={(e) => setSelectedTrackToAdd(e.target.value)}
                >
                  {TRACK_CATALOG.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.vibe})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-add-track-confirm"
                  onClick={handleAddTrackToCurrentPlaylist}
                >
                  ➕ Add Track
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Playlist Tracks List or Empty State */}
      <div className="playlist-container">
        <h4 className="playlist-heading">
          {playlistMode === 'all'
            ? 'Bedtime Lullabies Catalog (5 Tracks)'
            : `${activeCustomPlaylist ? activeCustomPlaylist.name : 'Custom Playlist'} (${currentPlaylistTracks.length} Tracks)`}
        </h4>

        {currentPlaylistTracks.length === 0 ? (
          /* Empty State Display */
          <div className="empty-playlist-card" role="status">
            <span className="empty-emoji" aria-hidden="true">🌙💤</span>
            <h5 className="empty-title">This Playlist Is Quiet As a Sleeping Cloud!</h5>
            <p className="empty-desc">
              There are no lullabies in this playlist yet. Use the "Add Track" selector above to add your favorite sleepy melodies!
            </p>
          </div>
        ) : (
          <div className="playlist-list" role="list">
            {currentPlaylistTracks.map((track, idx) => {
              const isCurrent = idx === currentTrackIndex;
              return (
                <div
                  key={`${track.id}-${idx}`}
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

                    {/* Custom playlist order and delete buttons */}
                    {playlistMode === 'custom' && (
                      <div className="item-custom-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="btn-reorder"
                          onClick={(e) => handleMoveTrackOrder(e, idx, -1)}
                          disabled={idx === 0}
                          title="Move up"
                          aria-label="Move track up"
                        >
                          ⬆
                        </button>
                        <button
                          type="button"
                          className="btn-reorder"
                          onClick={(e) => handleMoveTrackOrder(e, idx, 1)}
                          disabled={idx === currentPlaylistTracks.length - 1}
                          title="Move down"
                          aria-label="Move track down"
                        >
                          ⬇
                        </button>
                        <button
                          type="button"
                          className="btn-remove-track"
                          onClick={(e) => handleRemoveTrackFromPlaylist(e, idx)}
                          title="Remove track from playlist"
                          aria-label="Remove track from playlist"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
