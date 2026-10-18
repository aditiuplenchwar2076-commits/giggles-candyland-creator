import React from 'react';
import { useInteraction } from '../../services/interactionContext';
import './DesktopShortcut.css';

export function DesktopShortcut({ id, label, icon, badge, onOpen }) {
  const { gigglesReact } = useInteraction();

  const handleClick = () => {
    onOpen(id);
    gigglesReact('project_open', { projectId: id });
  };

  const handleMouseEnter = () => {
    gigglesReact('project_hover', { projectId: id });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      className="desktop-shortcut"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onKeyDown={handleKeyDown}
      aria-label={`Open ${label}`}
    >
      <div className="shortcut-icon-card">
        <span className="shortcut-icon" aria-hidden="true">
          {icon}
        </span>
        {badge && <span className="shortcut-badge">{badge}</span>}
      </div>
      <span className="shortcut-label">{label}</span>
    </button>
  );
}
