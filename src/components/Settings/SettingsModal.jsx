import React from 'react';
import { useInteraction } from '../../services/interactionContext';
import './Settings.css';

export function SettingsModal() {
  const {
    theme,
    setTheme,
    globalMute,
    setGlobalMute,
    chaosMode,
    setChaosMode,
    commentaryMuted,
    setCommentaryMuted,
    hitCount,
    gigglesReact,
  } = useInteraction();

  const handleResetCounter = () => {
    if (confirm('Reset your sweet meter interactions count to 0?')) {
      localStorage.setItem('giggles_hit_count', '0');
      window.location.reload();
    }
  };

  return (
    <div className="settings-window-root" role="region" aria-label="System Settings">
      <div className="settings-header">
        <span className="settings-icon">⚙️</span>
        <div>
          <h3 className="settings-title">Control Panel & Preferences</h3>
          <p className="settings-subtitle">Customize themes, audio, commentary & fun modes</p>
        </div>
      </div>

      <div className="settings-sections-list">
        {/* Desktop Theme Switching Section */}
        <section className="setting-card">
          <div className="setting-card-header">
            <span className="card-icon">🎨</span>
            <div className="card-titles">
              <span className="card-title">Desktop Theme</span>
              <span className="card-desc">Switch shared wallpaper, titlebars & pastel colors</span>
            </div>
          </div>
          <div className="setting-card-controls theme-picker-row" role="radiogroup" aria-label="Select desktop theme">
            <button
              type="button"
              className={`theme-chip-btn ${theme === 'candy-pink' ? 'active' : ''}`}
              onClick={() => {
                setTheme('candy-pink');
                gigglesReact('design_changed');
              }}
              role="radio"
              aria-checked={theme === 'candy-pink'}
            >
              <span className="theme-color-dot dot-pink" />
              <span>Candy Pink</span>
            </button>
            <button
              type="button"
              className={`theme-chip-btn ${theme === 'dream-blue' ? 'active' : ''}`}
              onClick={() => {
                setTheme('dream-blue');
                gigglesReact('design_changed');
              }}
              role="radio"
              aria-checked={theme === 'dream-blue'}
            >
              <span className="theme-color-dot dot-blue" />
              <span>Dream Blue</span>
            </button>
            <button
              type="button"
              className={`theme-chip-btn ${theme === 'lavender-night' ? 'active' : ''}`}
              onClick={() => {
                setTheme('lavender-night');
                gigglesReact('design_changed');
              }}
              role="radio"
              aria-checked={theme === 'lavender-night'}
            >
              <span className="theme-color-dot dot-lavender" />
              <span>Lavender Night</span>
            </button>
          </div>
        </section>
        {/* Audio section */}
        <section className="setting-card">
          <div className="setting-card-header">
            <span className="card-icon">🔊</span>
            <div className="card-titles">
              <span className="card-title">Sound & Audio</span>
              <span className="card-desc">Procedural Web Audio sound effects and music</span>
            </div>
          </div>
          <div className="setting-card-controls">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={!globalMute}
                onChange={(e) => setGlobalMute(!e.target.checked)}
                className="toggle-checkbox"
              />
              <span className="toggle-custom" />
              <span>Enable Interface Sounds & Music</span>
            </label>
          </div>
        </section>

        {/* Companion settings */}
        <section className="setting-card">
          <div className="setting-card-header">
            <span className="card-icon">👶🏻</span>
            <div className="card-titles">
              <span className="card-title">Giggles Companion Commentary</span>
              <span className="card-desc">Control automatic speech bubble commentary</span>
            </div>
          </div>
          <div className="setting-card-controls">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={!commentaryMuted}
                onChange={(e) => setCommentaryMuted(!e.target.checked)}
                className="toggle-checkbox"
              />
              <span className="toggle-custom" />
              <span>Allow Contextual Speech Bubbles</span>
            </label>
            <p className="setting-subhint">
              (You can always poke Giggles for reactions even when commentary is silenced!)
            </p>
          </div>
        </section>

        {/* Chaos Mode */}
        <section className="setting-card">
          <div className="setting-card-header">
            <span className="card-icon">🤪</span>
            <div className="card-titles">
              <span className="card-title">Chaos Mode</span>
              <span className="card-desc">Playful retro window wiggles and extra glitter</span>
            </div>
          </div>
          <div className="setting-card-controls">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={chaosMode}
                onChange={(e) => {
                  setChaosMode(e.target.checked);
                  gigglesReact('chaos_toggled');
                }}
                className="toggle-checkbox"
              />
              <span className="toggle-custom" />
              <span>Activate Retro Chaos Mode</span>
            </label>
          </div>
        </section>

        {/* Counter Stats */}
        <section className="setting-card">
          <div className="setting-card-header">
            <span className="card-icon">📊</span>
            <div className="card-titles">
              <span className="card-title">Interaction Counter (Odometer)</span>
              <span className="card-desc">Current Sweet Meter count: <strong>{hitCount}</strong></span>
            </div>
          </div>
          <div className="setting-card-controls">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetCounter}
            >
              Reset Counter
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
