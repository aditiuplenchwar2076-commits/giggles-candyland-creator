import React, { useRef } from 'react';
import { gsap } from 'gsap';

export function ControlBar({
  onAddCurrentItem,
  onRemoveSelected,
  onRandomSurprise,
  onOpenResetModal,
  onExportImage,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  backgroundTheme = 'candy-kingdom',
  onChangeBackground,
  outlineMode = false,
  onToggleOutlineMode,
  hasSelection,
  selectedItemName,
  activeItemName,
  itemsCount,
}) {
  const surpriseBtnRef = useRef(null);

  const handleSurpriseClick = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion && surpriseBtnRef.current) {
      gsap.fromTo(
        surpriseBtnRef.current,
        { scale: 0.9, rotate: -8 },
        { scale: 1, rotate: 0, duration: 0.35, ease: 'back.out(3)' }
      );
    }
    onRandomSurprise();
  };

  return (
    <div className="control-bar-wrapper">
      {/* Background & Outline Mode Bar */}
      <div className="control-secondary-bar">
        <div className="bg-switcher-group" role="radiogroup" aria-label="Select canvas background">
          <span className="bg-label">🌄 Scene:</span>
          <button
            type="button"
            className={`bg-pill-btn ${backgroundTheme === 'candy-kingdom' ? 'active' : ''}`}
            onClick={() => onChangeBackground('candy-kingdom')}
            role="radio"
            aria-checked={backgroundTheme === 'candy-kingdom'}
            title="Sunny Candy Meadow with Sugar Path"
          >
            🍭 Candy Kingdom
          </button>
          <button
            type="button"
            className={`bg-pill-btn ${backgroundTheme === 'cloud-nine' ? 'active' : ''}`}
            onClick={() => onChangeBackground('cloud-nine')}
            role="radio"
            aria-checked={backgroundTheme === 'cloud-nine'}
            title="Fluffy Cloud Paradise with Rainbow"
          >
            ☁️ Cloud Nine
          </button>
          <button
            type="button"
            className={`bg-pill-btn ${backgroundTheme === 'starry-night' ? 'active' : ''}`}
            onClick={() => onChangeBackground('starry-night')}
            role="radio"
            aria-checked={backgroundTheme === 'starry-night'}
            title="Dreamy Midnight Sky with Crescent Moon"
          >
            🌙 Starry Night
          </button>
        </div>

        {/* Coloring Book Outline Mode Toggle */}
        <button
          type="button"
          className={`btn-outline-mode ${outlineMode ? 'active' : ''}`}
          onClick={onToggleOutlineMode}
          title="Coloring book mode: white shapes with crisp black outlines"
          aria-label="Toggle coloring book outline mode"
        >
          <span aria-hidden="true">🖍️</span>
          <span>{outlineMode ? 'Outlines: ON (Coloring Mode)' : 'Outlines: OFF'}</span>
        </button>
      </div>

      {/* Main Action Bar */}
      <div className="control-bar" role="toolbar" aria-label="Garden Actions Toolbar">
        <div className="control-left-group">
          {/* Add to Garden Button */}
          <button
            type="button"
            className="btn btn-primary btn-add"
            onClick={onAddCurrentItem}
            aria-label={`Add ${activeItemName || 'selected item'} to the garden`}
          >
            <span className="btn-icon" aria-hidden="true">🌱</span>
            <span className="btn-text">Add to Garden</span>
          </button>

          {/* Undo Button */}
          <button
            type="button"
            className={`btn btn-secondary btn-history btn-undo ${!canUndo ? 'disabled' : ''}`}
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo last change (Ctrl+Z)"
            aria-label="Undo last change"
          >
            <span className="btn-icon" aria-hidden="true">↩️</span>
            <span className="btn-text">Undo</span>
          </button>

          {/* Redo Button */}
          <button
            type="button"
            className={`btn btn-secondary btn-history btn-redo ${!canRedo ? 'disabled' : ''}`}
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo change (Ctrl+Y)"
            aria-label="Redo change"
          >
            <span className="btn-icon" aria-hidden="true">↪️</span>
            <span className="btn-text">Redo</span>
          </button>

          {/* Remove Selected Button */}
          <button
            type="button"
            className={`btn btn-danger btn-remove ${!hasSelection ? 'disabled' : ''}`}
            onClick={onRemoveSelected}
            disabled={!hasSelection}
            aria-label={
              hasSelection
                ? `Remove selected ${selectedItemName} from garden`
                : 'Remove button (select an item first)'
            }
          >
            <span className="btn-icon" aria-hidden="true">🗑️</span>
            <span className="btn-text">
              {hasSelection ? `Remove (${selectedItemName})` : 'Remove'}
            </span>
          </button>

          {/* Download Wallpaper Button */}
          <button
            type="button"
            className="btn btn-export"
            onClick={onExportImage}
            title="Download your finished creation as an image!"
            aria-label="Download Candyland creation as wallpaper"
          >
            <span className="btn-icon" aria-hidden="true">🖼️</span>
            <span className="btn-text">Save Wallpaper</span>
          </button>
        </div>

        <div className="control-right-group">
          {/* Random Surprise Button */}
          <button
            ref={surpriseBtnRef}
            type="button"
            className="btn btn-surprise"
            onClick={handleSurpriseClick}
            aria-label="Add a random candy surprise to the garden"
          >
            <span className="btn-icon" aria-hidden="true">🎁</span>
            <span className="btn-text">Random Surprise</span>
          </button>

          {/* Reset Garden Button */}
          <button
            type="button"
            className="btn btn-secondary btn-reset"
            onClick={onOpenResetModal}
            aria-label="Reset the garden to starter scene"
          >
            <span className="btn-icon" aria-hidden="true">🔄</span>
            <span className="btn-text">Reset Garden</span>
          </button>

          {/* Garden Stats Badge */}
          <div className="garden-counter-badge" title="Total sweets in your garden">
            <span className="counter-icon" aria-hidden="true">🍬</span>
            <span className="counter-value">{itemsCount} in Garden</span>
          </div>
        </div>
      </div>
    </div>
  );
}
