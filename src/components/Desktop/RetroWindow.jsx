import React, { useState, useRef, useEffect } from 'react';
import { useInteraction } from '../../services/interactionContext';
import './RetroWindow.css';

export function RetroWindow({
  id,
  title,
  icon = '🍬',
  isOpen,
  isMinimized,
  zIndex = 10,
  defaultWidth = 920,
  defaultHeight = 640,
  initialPosition = { x: 40, y: 30 },
  children,
}) {
  const { closeWindow, minimizeWindow, focusWindow } = useInteraction();
  const windowRef = useRef(null);

  const [position, setPosition] = useState(initialPosition);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, startX: 0, startY: 0 });

  // Handle titlebar dragging on desktop
  const handlePointerDown = (e) => {
    // Only drag on primary mouse click on titlebar (not on control buttons)
    if (e.target.closest('.window-control-btn') || e.button !== 0) return;
    if (window.innerWidth < 768) return; // Disable drag on mobile

    focusWindow(id);
    setIsDragging(true);

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y,
    };

    e.preventDefault();
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;

      const maxX = Math.max(0, window.innerWidth - 300);
      const maxY = Math.max(0, window.innerHeight - 150);

      setPosition({
        x: Math.max(0, Math.min(maxX, dragStartRef.current.startX + dx)),
        y: Math.max(0, Math.min(maxY, dragStartRef.current.startY + dy)),
      });
    };

    const handlePointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  if (!isOpen) return null;

  return (
    <div
      ref={windowRef}
      id={`retro-window-${id}`}
      className={`retro-window ${isMinimized ? 'minimized' : ''} ${
        isMaximized ? 'maximized' : ''
      } ${isDragging ? 'dragging' : ''}`}
      style={{
        zIndex,
        ...(isMaximized
          ? {}
          : {
              transform:
                window.innerWidth >= 768
                  ? `translate3d(${position.x}px, ${position.y}px, 0)`
                  : 'none',
              width: window.innerWidth >= 768 ? `${defaultWidth}px` : '100%',
              maxWidth: '96vw',
              maxHeight: window.innerWidth >= 768 ? `${defaultHeight}px` : 'calc(100svh - 60px)',
            }),
      }}
      onPointerDown={() => focusWindow(id)}
      role="dialog"
      aria-labelledby={`window-title-${id}`}
      tabIndex={-1}
    >
      {/* Retro Window Titlebar */}
      <div
        className="retro-window-titlebar"
        onPointerDown={handlePointerDown}
        onDoubleClick={() => setIsMaximized((prev) => !prev)}
      >
        <div className="titlebar-left">
          <span className="window-icon" aria-hidden="true">
            {icon}
          </span>
          <h2 id={`window-title-${id}`} className="window-title-text">
            {title}
          </h2>
        </div>

        <div className="titlebar-controls" role="group" aria-label="Window controls">
          {/* Minimize */}
          <button
            type="button"
            className="window-control-btn btn-min"
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(id);
            }}
            title="Minimize"
            aria-label="Minimize window"
          >
            —
          </button>

          {/* Maximize / Restore */}
          <button
            type="button"
            className="window-control-btn btn-max"
            onClick={(e) => {
              e.stopPropagation();
              setIsMaximized(!isMaximized);
            }}
            title={isMaximized ? 'Restore' : 'Maximize'}
            aria-label={isMaximized ? 'Restore window size' : 'Maximize window'}
          >
            {isMaximized ? '❐' : '□'}
          </button>

          {/* Close */}
          <button
            type="button"
            className="window-control-btn btn-close"
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(id);
            }}
            title="Close"
            aria-label="Close window"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Window Body (Children content) */}
      {!isMinimized && <div className="retro-window-body">{children}</div>}
    </div>
  );
}
