import React, { useEffect, useRef } from 'react';
import { useInteraction } from '../../services/interactionContext';
import './StartMenu.css';

export function StartMenu({ isOpen, onClose }) {
  const { openWindow, gigglesReact } = useInteraction();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !e.target.closest('.start-button')) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('pointerdown', handleClickOutside);
    }
    return () => window.removeEventListener('pointerdown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLaunch = (windowId) => {
    openWindow(windowId);
    gigglesReact('project_open', { projectId: windowId });
    onClose();
  };

  const handleShutdown = () => {
    alert("💤 NAP TIME INITIATED! 🍼\n\nGiggles says: 'Good job today, human! Drink some warm milk and don't forget to dream of cotton candy!'");
    gigglesReact('sleep_timer_ended');
    onClose();
  };

  return (
    <div ref={menuRef} className="retro-start-menu" role="menu" aria-label="Giggles Start Menu">
      {/* Left side brand stripe */}
      <div className="start-menu-sidebar">
        <span className="sidebar-brand-text">Giggles 98</span>
      </div>

      {/* Main menu content */}
      <div className="start-menu-body">
        {/* User banner */}
        <div className="start-user-card">
          <img
            src="/images/giggles_avatar.png"
            alt="Giggles profile"
            className="start-user-avatar"
          />
          <div className="start-user-meta">
            <span className="start-user-name">Giggles</span>
            <span className="start-user-role">Chief Baby Officer</span>
          </div>
        </div>

        <div className="start-menu-divider" />

        {/* Menu Items */}
        <div className="start-menu-items">
          <button
            type="button"
            className="start-item-btn"
            onClick={() => handleLaunch('candyland')}
            role="menuitem"
          >
            <span className="start-item-icon">🍬</span>
            <div className="start-item-text">
              <span className="start-item-title">Candyland Creator</span>
              <span className="start-item-desc">Plant candy, make sweet wallpapers</span>
            </div>
          </button>

          <button
            type="button"
            className="start-item-btn"
            onClick={() => handleLaunch('dream_library')}
            role="menuitem"
          >
            <span className="start-item-icon">🎶</span>
            <div className="start-item-text">
              <span className="start-item-title">Dream Library</span>
              <span className="start-item-desc">Sleepy lullabies & sleep timer</span>
            </div>
          </button>

          <button
            type="button"
            className="start-item-btn"
            onClick={() => handleLaunch('rainbow_launch')}
            role="menuitem"
          >
            <span className="start-item-icon">🦄</span>
            <div className="start-item-text">
              <span className="start-item-title">Rainbow Launch</span>
              <span className="start-item-desc">Slingshot candy at the unicorn piñata</span>
            </div>
          </button>

          <button
            type="button"
            className="start-item-btn"
            onClick={() => handleLaunch('guestbook')}
            role="menuitem"
          >
            <span className="start-item-icon">📝</span>
            <div className="start-item-text">
              <span className="start-item-title">Baby Guestbook</span>
              <span className="start-item-desc">Leave a sweet note for Giggles</span>
            </div>
          </button>

          <div className="start-menu-divider" />

          <button
            type="button"
            className="start-item-btn"
            onClick={() => handleLaunch('settings')}
            role="menuitem"
          >
            <span className="start-item-icon">⚙️</span>
            <div className="start-item-text">
              <span className="start-item-title">System Settings</span>
              <span className="start-item-desc">Sound, theme & chaos mode</span>
            </div>
          </button>

          <button
            type="button"
            className="start-item-btn"
            onClick={() => handleLaunch('about')}
            role="menuitem"
          >
            <span className="start-item-icon">🍼</span>
            <div className="start-item-text">
              <span className="start-item-title">About Giggles</span>
              <span className="start-item-desc">Meet the baby with big vibes</span>
            </div>
          </button>

          <button
            type="button"
            className="start-item-btn"
            onClick={() => handleLaunch('easter_egg')}
            role="menuitem"
          >
            <span className="start-item-icon">⭐</span>
            <div className="start-item-text">
              <span className="start-item-title">Secret Starry Sky</span>
              <span className="start-item-desc">Hidden photo transformer</span>
            </div>
          </button>

          <div className="start-menu-divider" />

          <button
            type="button"
            className="start-item-btn shutdown-btn"
            onClick={handleShutdown}
            role="menuitem"
          >
            <span className="start-item-icon">💤</span>
            <div className="start-item-text">
              <span className="start-item-title">Take a Nap (Shutdown)</span>
              <span className="start-item-desc">Wrap up and rest your eyes</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
