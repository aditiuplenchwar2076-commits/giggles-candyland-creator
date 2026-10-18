import React, { useState } from 'react';
import { useInteraction } from '../../services/interactionContext';
import { RetroWindow } from './RetroWindow';
import { DesktopShortcut } from './DesktopShortcut';
import { StartMenu } from './StartMenu';
import { Taskbar } from './Taskbar';
import { GigglesCompanion } from '../Companion/GigglesCompanion';
import { SparkleTrail } from '../SparkleTrail/SparkleTrail';
import { CandylandCreator } from '../CandylandCreator/CandylandCreator';
import { DreamLibrary } from '../DreamLibrary/DreamLibrary';
import { RainbowLaunch } from '../RainbowLaunch/RainbowLaunch';
import { Guestbook } from '../Guestbook/Guestbook';
import { SettingsModal } from '../Settings/SettingsModal';
import { AboutModal } from '../Settings/AboutModal';
import { EasterEggModal } from '../EasterEgg/EasterEggModal';
import './RetroDesktop.css';

export function RetroDesktop() {
  const { windows, openWindow, closeWindow, chaosMode, gigglesReact } = useInteraction();
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  const handleSecretStarClick = () => {
    openWindow('easter_egg');
    gigglesReact('easter_egg_found');
  };

  return (
    <div className={`retro-desktop-arena ${chaosMode ? 'chaos-mode-active' : ''}`}>
      {/* Sparkle cursor trail */}
      <SparkleTrail />

      {/* Desktop Wallpaper Art & Sky */}
      <div className="desktop-wallpaper" aria-hidden="true">
        {/* Sky gradient background */}
        <div className="wallpaper-sky-mesh" />

        {/* Ambient floating candy clouds */}
        <div className="wallpaper-cloud wc1" />
        <div className="wallpaper-cloud wc2" />
        <div className="wallpaper-cloud wc3" />

        {/* Center Giggles watermark illustration */}
        <div className="wallpaper-centerpiece">
          <img
            src="/images/giggles_main.png"
            alt=""
            className="wallpaper-giggles-img"
          />
          <span className="wallpaper-title">Giggles OS 2026</span>
          <span className="wallpaper-subtitle">The Baby Who Makes The Internet Smile 👶🏻🍬</span>
        </div>

        {/* Subtle, discoverable Easter Egg Star in the sky */}
        <button
          type="button"
          className="desktop-secret-star"
          onClick={handleSecretStarClick}
          title="✦ A mysterious glowing star..."
          aria-label="Secret twinkling star"
        >
          ✦
        </button>
      </div>

      {/* Desktop Shortcuts Column */}
      <div className="desktop-shortcuts-grid" role="group" aria-label="Desktop applications">
        <DesktopShortcut
          id="candyland"
          label="Candyland Creator"
          icon="🍬"
          badge="Project 1"
          onOpen={openWindow}
        />
        <DesktopShortcut
          id="dream_library"
          label="Dream Library"
          icon="🎶"
          badge="Project 2"
          onOpen={openWindow}
        />
        <DesktopShortcut
          id="rainbow_launch"
          label="Rainbow Launch"
          icon="🦄"
          badge="Project 3"
          onOpen={openWindow}
        />
        <DesktopShortcut
          id="guestbook"
          label="Baby Guestbook"
          icon="📝"
          onOpen={openWindow}
        />
        <DesktopShortcut
          id="settings"
          label="Settings"
          icon="⚙️"
          onOpen={openWindow}
        />
        <DesktopShortcut
          id="about"
          label="About Giggles"
          icon="🍼"
          onOpen={openWindow}
        />
      </div>

      {/* Retro Draggable / Responsive Windows */}

      {/* 1. Candyland Creator Window */}
      <RetroWindow
        id="candyland"
        title="Candyland Creator — Studio"
        icon="🍬"
        isOpen={windows.candyland.isOpen}
        isMinimized={windows.candyland.isMinimized}
        zIndex={windows.candyland.zIndex}
        defaultWidth={960}
        defaultHeight={670}
        initialPosition={{ x: 30, y: 20 }}
      >
        <CandylandCreator />
      </RetroWindow>

      {/* 2. Dream Library Window */}
      <RetroWindow
        id="dream_library"
        title="Giggles' Dream Library — Lullabies & Bedtime"
        icon="🎶"
        isOpen={windows.dream_library.isOpen}
        isMinimized={windows.dream_library.isMinimized}
        zIndex={windows.dream_library.zIndex}
        defaultWidth={840}
        defaultHeight={630}
        initialPosition={{ x: 90, y: 40 }}
      >
        <DreamLibrary />
      </RetroWindow>

      {/* 3. Rainbow Launch Window */}
      <RetroWindow
        id="rainbow_launch"
        title="Rainbow Launch — Unicorn Piñata Physics Game"
        icon="🦄"
        isOpen={windows.rainbow_launch.isOpen}
        isMinimized={windows.rainbow_launch.isMinimized}
        zIndex={windows.rainbow_launch.zIndex}
        defaultWidth={860}
        defaultHeight={640}
        initialPosition={{ x: 60, y: 35 }}
      >
        <RainbowLaunch />
      </RetroWindow>

      {/* 4. Guestbook Window */}
      <RetroWindow
        id="guestbook"
        title="Baby Giggles' Scrapbook & Guestbook"
        icon="📝"
        isOpen={windows.guestbook.isOpen}
        isMinimized={windows.guestbook.isMinimized}
        zIndex={windows.guestbook.zIndex}
        defaultWidth={740}
        defaultHeight={580}
        initialPosition={{ x: 120, y: 50 }}
      >
        <Guestbook />
      </RetroWindow>

      {/* 5. Settings Window */}
      <RetroWindow
        id="settings"
        title="System Settings & Audio Preferences"
        icon="⚙️"
        isOpen={windows.settings.isOpen}
        isMinimized={windows.settings.isMinimized}
        zIndex={windows.settings.zIndex}
        defaultWidth={640}
        defaultHeight={540}
        initialPosition={{ x: 150, y: 60 }}
      >
        <SettingsModal />
      </RetroWindow>

      {/* 6. About Window */}
      <RetroWindow
        id="about"
        title="About Giggles — Origin Story"
        icon="🍼"
        isOpen={windows.about.isOpen}
        isMinimized={windows.about.isMinimized}
        zIndex={windows.about.zIndex}
        defaultWidth={660}
        defaultHeight={540}
        initialPosition={{ x: 140, y: 70 }}
      >
        <AboutModal />
      </RetroWindow>

      {/* 7. Secret Starry Sky Easter Egg Modal */}
      <EasterEggModal
        isOpen={windows.easter_egg.isOpen}
        onClose={() => closeWindow('easter_egg')}
      />

      {/* Global Persistent Giggles Companion */}
      <GigglesCompanion />

      {/* Retro 90s Start Menu */}
      <StartMenu
        isOpen={isStartMenuOpen}
        onClose={() => setIsStartMenuOpen(false)}
      />

      {/* Bottom Taskbar */}
      <Taskbar
        onToggleStartMenu={() => setIsStartMenuOpen((prev) => !prev)}
        isStartMenuOpen={isStartMenuOpen}
      />
    </div>
  );
}
