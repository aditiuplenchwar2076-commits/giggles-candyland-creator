import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { useInteraction } from '../../services/interactionContext';
import './GigglesCompanion.css';

export function GigglesCompanion() {
  const {
    gigglesComment,
    gigglesMood,
    isBubbleVisible,
    setIsBubbleVisible,
    commentaryMuted,
    setCommentaryMuted,
    gigglesReact,
    incrementHitCount,
  } = useInteraction();

  const companionRef = useRef(null);
  const bubbleRef = useRef(null);
  const characterImgRef = useRef(null);

  const [isMinimized, setIsMinimized] = useState(false);
  const [corner, setCorner] = useState('bottom-right'); // 'bottom-right' | 'bottom-left'
  const [pokeCount, setPokeCount] = useState(0);

  // GSAP idle and mood animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !characterImgRef.current) return;

    let tween;
    if (gigglesMood === 'dance') {
      tween = gsap.to(characterImgRef.current, {
        y: -16,
        rotation: 8,
        duration: 0.28,
        repeat: 5,
        yoyo: true,
        ease: 'power1.inOut',
        onComplete: () => {
          gsap.to(characterImgRef.current, { y: 0, rotation: 0, duration: 0.3 });
        },
      });
    } else if (gigglesMood === 'sleepy') {
      tween = gsap.to(characterImgRef.current, {
        y: -6,
        rotation: -2,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    } else if (gigglesMood === 'excited') {
      tween = gsap.to(characterImgRef.current, {
        y: -12,
        scale: 1.08,
        duration: 0.3,
        repeat: 3,
        yoyo: true,
        ease: 'back.out(2)',
        onComplete: () => {
          gsap.to(characterImgRef.current, { y: 0, scale: 1, duration: 0.3 });
        },
      });
    } else {
      // Default happy gentle float
      tween = gsap.to(characterImgRef.current, {
        y: -8,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }

    return () => {
      if (tween) tween.kill();
    };
  }, [gigglesMood]);

  // Speech bubble pop-in animation on new comment
  useEffect(() => {
    if (bubbleRef.current && isBubbleVisible) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        gsap.fromTo(
          bubbleRef.current,
          { scale: 0.8, opacity: 0, y: 10 },
          { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(2.2)' }
        );
      }
    }
  }, [gigglesComment, isBubbleVisible]);

  // Handle poking Giggles
  const handlePoke = () => {
    setPokeCount((c) => c + 1);
    incrementHitCount();
    gigglesReact('poke_giggles');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion && characterImgRef.current) {
      gsap.fromTo(
        characterImgRef.current,
        { scale: 0.92, rotation: -6 },
        { scale: 1.15, rotation: 6, duration: 0.22, yoyo: true, repeat: 1, ease: 'back.out(3)' }
      );
    }
  };

  const toggleCorner = (e) => {
    e.stopPropagation();
    setCorner((prev) => (prev === 'bottom-right' ? 'bottom-left' : 'bottom-right'));
  };

  return (
    <aside
      ref={companionRef}
      className={`giggles-global-companion ${corner} ${isMinimized ? 'minimized' : ''}`}
      aria-label="Giggles Digital Companion"
    >
      {/* Speech Bubble (when not minimized and visible) */}
      {!isMinimized && isBubbleVisible && !commentaryMuted && (
        <div ref={bubbleRef} className="companion-bubble" role="status" aria-live="polite">
          <div className="bubble-header-bar">
            <span className="bubble-character-name">👶🏻 Giggles</span>
            <div className="bubble-actions">
              {/* Shhh button */}
              <button
                type="button"
                className="bubble-action-btn"
                title="Silence automatic commentary"
                aria-label="Silence Giggles automatic comments"
                onClick={() => setCommentaryMuted(true)}
              >
                🤫
              </button>
              {/* Close bubble button */}
              <button
                type="button"
                className="bubble-action-btn"
                title="Dismiss message"
                aria-label="Dismiss message"
                onClick={() => setIsBubbleVisible(false)}
              >
                ✕
              </button>
            </div>
          </div>

          <p className="bubble-content-text">{gigglesComment}</p>
          <div className="bubble-pointer" aria-hidden="true" />
        </div>
      )}

      {/* Main Companion Character Body */}
      <div className="companion-avatar-wrap">
        {/* Floating companion controls pill */}
        <div className="companion-mini-toolbar" aria-label="Companion controls">
          <button
            type="button"
            className="mini-tool-btn"
            onClick={toggleCorner}
            title={corner === 'bottom-right' ? 'Move to left corner' : 'Move to right corner'}
            aria-label="Toggle companion screen corner"
          >
            ⇄
          </button>
          <button
            type="button"
            className="mini-tool-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Expand Giggles' : 'Minimize Giggles'}
            aria-label={isMinimized ? 'Expand Giggles' : 'Minimize Giggles'}
          >
            {isMinimized ? '👶🏻' : '—'}
          </button>
          {commentaryMuted && (
            <button
              type="button"
              className="mini-tool-btn un-mute"
              onClick={() => {
                setCommentaryMuted(false);
                setIsBubbleVisible(true);
              }}
              title="Unmute Giggles commentary"
              aria-label="Unmute Giggles commentary"
            >
              💬
            </button>
          )}
        </div>

        {/* Character Sprite Button */}
        <button
          type="button"
          className="companion-poke-trigger"
          onClick={handlePoke}
          title="Click to poke Giggles! (Hehehe!)"
          aria-label={`Poke Giggles! Current pokes: ${pokeCount}`}
        >
          {/* Cloud Base Cushion */}
          <div className="companion-cloud-glow" aria-hidden="true" />

          {/* Giggles Artwork */}
          <img
            ref={characterImgRef}
            src="/images/giggles_main.png"
            alt="Baby Giggles with rosy cheeks, golden curl, pink onesie, and giant swirl lollipop"
            className="companion-sprite-img"
          />

          {/* Sparkle badge */}
          <span className="companion-sparkle-badge" aria-hidden="true">
            ✨
          </span>
        </button>
      </div>
    </aside>
  );
}
