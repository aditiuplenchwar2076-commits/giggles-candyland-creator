import React, { useRef } from 'react';
import { gsap } from 'gsap';

export function ControlBar({
  onAddCurrentItem,
  onRemoveSelected,
  onRandomSurprise,
  onOpenResetModal,
  onExportImage,
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
  );
}
