import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function ResetModal({ isOpen, onConfirmReset, onClose }) {
  const modalBoxRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalBoxRef.current) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        gsap.fromTo(
          modalBoxRef.current,
          { scale: 0.8, opacity: 0, y: 20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(2)' }
        );
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
    >
      <div
        ref={modalBoxRef}
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-emoji" aria-hidden="true">🍬✨</span>
          <h3 id="reset-modal-title" className="modal-title">Reset Candyland?</h3>
        </div>

        <p className="modal-description">
          Are you sure you want to tidy up? This will clear your custom sweet additions
          and return the garden to its fresh, dreamy starter layout.
        </p>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary modal-btn-cancel"
            onClick={onClose}
            autoFocus
          >
            Keep My Garden
          </button>
          <button
            type="button"
            className="btn btn-danger modal-btn-confirm"
            onClick={() => {
              onConfirmReset();
              onClose();
            }}
          >
            Yes, Reset Garden
          </button>
        </div>
      </div>
    </div>
  );
}
