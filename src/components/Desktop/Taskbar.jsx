import React, { useState, useEffect } from 'react';
import { useInteraction } from '../../services/interactionContext';
import { Odometer } from '../Odometer/Odometer';
import './Taskbar.css';

export function Taskbar({ onToggleStartMenu, isStartMenuOpen }) {
  const {
    windows,
    minimizeWindow,
    focusWindow,
    globalMute,
    setGlobalMute,
    chaosMode,
    setChaosMode,
    hitCount,
    gigglesReact,
  } = useInteraction();

  const [timeStr, setTimeStr] = useState('');

  // Clock updates every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const WINDOW_TITLES = {
    candyland: { title: 'Candyland Creator', icon: '🍬' },
    dream_library: { title: 'Dream Library', icon: '🎶' },
    rainbow_launch: { title: 'Rainbow Launch', icon: '🦄' },
    guestbook: { title: 'Baby Guestbook', icon: '📝' },
    settings: { title: 'Settings', icon: '⚙️' },
    about: { title: 'About Giggles', icon: '🍼' },
    easter_egg: { title: 'Secret Sky', icon: '⭐' },
  };

  const handleTaskbarItemClick = (winId) => {
    const win = windows[winId];
    if (win.isMinimized) {
      minimizeWindow(winId);
      focusWindow(winId);
    } else {
      minimizeWindow(winId);
    }
  };

  const toggleChaos = () => {
    setChaosMode((prev) => {
      const next = !prev;
      gigglesReact('chaos_toggled');
      return next;
    });
  };

  return (
    <footer className="retro-taskbar" role="navigation" aria-label="Desktop Taskbar">
      {/* Start Button */}
      <button
        type="button"
        className={`start-button ${isStartMenuOpen ? 'active' : ''}`}
        onClick={onToggleStartMenu}
        aria-expanded={isStartMenuOpen}
        aria-label="Start menu"
      >
        <span className="start-icon" aria-hidden="true">🍬</span>
        <span className="start-text">Start</span>
      </button>

      {/* Running Window Tabs */}
      <div className="taskbar-windows-list">
        {Object.entries(windows).map(([winId, win]) => {
          if (!win.isOpen) return null;
          const info = WINDOW_TITLES[winId] || { title: winId, icon: '🪟' };
          const isActive = !win.isMinimized;

          return (
            <button
              key={winId}
              type="button"
              className={`taskbar-window-pill ${isActive ? 'active' : 'minimized'}`}
              onClick={() => handleTaskbarItemClick(winId)}
              aria-label={`${info.title} window (${isActive ? 'active' : 'minimized'})`}
            >
              <span className="pill-icon" aria-hidden="true">{info.icon}</span>
              <span className="pill-title">{info.title}</span>
            </button>
          );
        })}
      </div>

      {/* System Tray (Clock, Sound, Chaos, Odometer) */}
      <div className="taskbar-tray">
        {/* Odometer counter */}
        <Odometer count={hitCount} />

        {/* Chaos Mode Toggle */}
        <button
          type="button"
          className={`tray-action-btn chaos-btn ${chaosMode ? 'active' : ''}`}
          onClick={toggleChaos}
          title={chaosMode ? 'Chaos Mode ON! (Click to turn off)' : 'Turn on Chaos Mode!'}
          aria-label={chaosMode ? 'Disable Chaos Mode' : 'Enable Chaos Mode'}
        >
          {chaosMode ? '🤪 Chaos: ON' : '✨ Chaos'}
        </button>

        {/* Mute Toggle */}
        <button
          type="button"
          className={`tray-action-btn mute-btn ${globalMute ? 'muted' : ''}`}
          onClick={() => setGlobalMute(!globalMute)}
          title={globalMute ? 'Unmute Audio' : 'Mute Audio'}
          aria-label={globalMute ? 'Unmute all sounds' : 'Mute all sounds'}
        >
          {globalMute ? '🔇 Muted' : '🔊 Sound'}
        </button>

        {/* Digital Clock */}
        <div className="tray-clock" title="System Time" aria-label={`Current time: ${timeStr}`}>
          <span className="clock-text">{timeStr}</span>
        </div>
      </div>
    </footer>
  );
}
