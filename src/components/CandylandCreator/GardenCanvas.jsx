import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ItemRenderer } from './ItemRenderer';
import { getItemById } from './candyCatalog';

export function GardenCanvas({
  items,
  selectedItemId,
  onSelectItem,
  onAddItemAtPosition,
  onUpdateItemPosition,
  gigglesReaction,
  activeItemToPlace,
}) {
  const canvasRef = useRef(null);
  const gigglesRef = useRef(null);
  const bubbleRef = useRef(null);
  const itemsContainerRef = useRef(null);

  // Dragging state
  const [draggingUid, setDraggingUid] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Floating animation for Giggles character using GSAP
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    if (gigglesRef.current) {
      const tween = gsap.to(gigglesRef.current, {
        y: -12,
        rotation: 1.5,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      return () => tween.kill();
    }
  }, []);

  // Reaction pop animation when Giggles reacts
  useEffect(() => {
    if (bubbleRef.current) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      gsap.fromTo(
        bubbleRef.current,
        { scale: 0.8, opacity: 0, y: 8 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }
      );
    }
  }, [gigglesReaction]);

  // Click on canvas background to plant or deselect
  const handleCanvasClick = (e) => {
    // If clicking on an existing item or during drag, ignore
    if (e.target.closest('.garden-placed-item') || e.target.closest('.giggles-character-anchor')) {
      return;
    }

    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickXPercent = Math.max(8, Math.min(92, ((e.clientX - rect.left) / rect.width) * 100));
    const clickYPercent = Math.max(15, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100));

    // If an item was selected, deselect it first, or if active tool is ready, place it!
    if (selectedItemId) {
      onSelectItem(null);
    } else {
      onAddItemAtPosition(clickXPercent, clickYPercent);
    }
  };

  // Keyboard accessibility on items
  const handleItemKeyDown = (e, uid) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectItem(uid);
    }
  };

  // Dragging support (mouse & touch)
  const handlePointerDown = (e, item) => {
    e.stopPropagation();
    onSelectItem(item.uid);
    setDraggingUid(item.uid);

    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = (item.x / 100) * rect.width;
    const currentY = (item.y / 100) * rect.height;

    setDragOffset({
      x: e.clientX - (rect.left + currentX),
      y: e.clientY - (rect.top + currentY),
    });
  };

  const handlePointerMove = (e) => {
    if (!draggingUid || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();

    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;

    const xPercent = Math.max(5, Math.min(95, (newX / rect.width) * 100));
    const yPercent = Math.max(10, Math.min(92, (newY / rect.height) * 100));

    onUpdateItemPosition(draggingUid, xPercent, yPercent);
  };

  const handlePointerUp = () => {
    if (draggingUid) {
      setDraggingUid(null);
    }
  };

  return (
    <div
      ref={canvasRef}
      className="garden-canvas"
      onClick={handleCanvasClick}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      role="region"
      aria-label="Interactive Candyland Garden Area. Click anywhere to plant the selected candy."
      tabIndex={0}
    >
      {/* Visual scenic landscape background SVG */}
      <svg className="garden-scenic-bg" viewBox="0 0 1000 650" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="candy-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF1F7" />
            <stop offset="35%" stopColor="#FDE4F2" />
            <stop offset="70%" stopColor="#E9DBFB" />
            <stop offset="100%" stopColor="#D5E8FD" />
          </linearGradient>

          <linearGradient id="hill-back" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFCBE2" />
            <stop offset="100%" stopColor="#F9A4CA" />
          </linearGradient>

          <linearGradient id="hill-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C8F1E4" />
            <stop offset="100%" stopColor="#8BE3C9" />
          </linearGradient>

          <linearGradient id="hill-fore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFE0B2" />
            <stop offset="60%" stopColor="#FFCC80" />
            <stop offset="100%" stopColor="#FFA726" />
          </linearGradient>

          <linearGradient id="sugar-path" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFBF2" />
            <stop offset="50%" stopColor="#FFE6C7" />
            <stop offset="100%" stopColor="#FFF3E0" />
          </linearGradient>

          <linearGradient id="sprinkle-river" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#80D6FF" />
            <stop offset="50%" stopColor="#B388FF" />
            <stop offset="100%" stopColor="#FF80AB" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect x="0" y="0" width="1000" height="650" fill="url(#candy-sky)" />

        {/* Distant Rainbow Arch */}
        <path
          d="M 120 400 A 380 340 0 0 1 880 400"
          fill="none"
          stroke="#FF80AB"
          strokeWidth="14"
          strokeOpacity="0.45"
          strokeLinecap="round"
        />
        <path
          d="M 135 400 A 365 325 0 0 1 865 400"
          fill="none"
          stroke="#FFE082"
          strokeWidth="14"
          strokeOpacity="0.45"
          strokeLinecap="round"
        />
        <path
          d="M 150 400 A 350 310 0 0 1 850 400"
          fill="none"
          stroke="#80E8D0"
          strokeWidth="14"
          strokeOpacity="0.45"
          strokeLinecap="round"
        />
        <path
          d="M 165 400 A 335 295 0 0 1 835 400"
          fill="none"
          stroke="#B388FF"
          strokeWidth="14"
          strokeOpacity="0.45"
          strokeLinecap="round"
        />

        {/* Whimsical Cloud Banks */}
        <path
          d="M 0 260 Q 90 210, 200 240 Q 320 200, 460 250 Q 560 190, 720 240 Q 860 190, 1000 230 L 1000 650 L 0 650 Z"
          fill="#FFF9FC"
          opacity="0.6"
        />

        {/* Back Strawberry Marshmallow Hill */}
        <path
          d="M 0 350 Q 240 240, 520 310 Q 780 250, 1000 330 L 1000 650 L 0 650 Z"
          fill="url(#hill-back)"
          opacity="0.85"
        />
        {/* Frosting Scallops on Back Hill */}
        <path
          d="M 0 350 Q 40 365, 80 350 Q 120 365, 160 345 Q 200 360, 240 330 Q 300 345, 360 320 Q 420 340, 480 315 Q 540 330, 600 300 Q 660 320, 720 280 Q 780 305, 840 295 Q 900 320, 960 315 Q 980 330, 1000 330"
          fill="none"
          stroke="#FFF"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Mid Mint Candy Hill */}
        <path
          d="M -50 420 Q 280 340, 580 400 Q 820 350, 1050 440 L 1050 650 L -50 650 Z"
          fill="url(#hill-mid)"
        />
        {/* Frosting drips on Mint Hill */}
        <path
          d="M 0 420 Q 60 440, 120 415 Q 180 445, 240 400 Q 320 435, 400 380 Q 480 415, 560 390 Q 640 425, 720 385 Q 800 420, 880 380 Q 940 410, 1000 435"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Sweet Sugar-Wafer Path winding from back to front */}
        <path
          d="M 280 410 Q 380 480, 460 530 Q 540 580, 520 650 L 420 650 Q 420 590, 360 540 Q 280 480, 220 430 Z"
          fill="url(#sugar-path)"
          stroke="#FFE082"
          strokeWidth="2"
        />
        {/* Sugar cobblestone wafer dots on path */}
        <circle cx="280" cy="450" r="4" fill="#FFB74D" opacity="0.6" />
        <circle cx="340" cy="490" r="5" fill="#FF80AB" opacity="0.6" />
        <circle cx="410" cy="530" r="6" fill="#80DEEA" opacity="0.6" />
        <circle cx="470" cy="570" r="5" fill="#BA68C8" opacity="0.6" />
        <circle cx="460" cy="620" r="6" fill="#FFD54F" opacity="0.6" />

        {/* Foreground Butterscotch Meadow */}
        <path
          d="M 0 510 Q 220 450, 450 510 Q 720 460, 1000 520 L 1000 650 L 0 650 Z"
          fill="url(#hill-fore)"
          opacity="0.4"
        />

        {/* Gentle Sparkle Dots in the Sky */}
        <circle cx="160" cy="110" r="2.5" fill="#FFF" opacity="0.8" />
        <circle cx="280" cy="80" r="3" fill="#FFF" opacity="0.9" />
        <circle cx="420" cy="130" r="2" fill="#FFE082" opacity="0.9" />
        <circle cx="700" cy="100" r="2.5" fill="#FFF" opacity="0.85" />
        <circle cx="820" cy="60" r="3" fill="#FFF" opacity="0.9" />
        <circle cx="620" cy="160" r="2" fill="#FF80AB" opacity="0.75" />
      </svg>

      {/* Baby Giggles Character Anchor (Preserving original appearance: rosy cheeks, golden curl, pink outfit, swirl lollipop) */}
      <div
        ref={gigglesRef}
        className="giggles-character-anchor"
        style={{ left: '76%', top: '8%' }}
        title="Baby Giggles! Tap her to see her smile and giggle!"
        onClick={(e) => {
          e.stopPropagation();
          const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (!prefersReducedMotion && gigglesRef.current) {
            gsap.fromTo(
              gigglesRef.current,
              { scale: 1 },
              { scale: 1.15, rotation: -6, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out' }
            );
          }
        }}
      >
        {/* Soft cotton candy cloud base for Giggles */}
        <div className="giggles-cloud-cushion" aria-hidden="true" />

        {/* Original Giggles Character Illustration */}
        <img
          src="/images/giggles_main.png"
          alt="Original Baby Giggles in pink onesie with golden curl, rosy cheeks, holding a giant red-and-white swirl lollipop"
          className="giggles-character-img"
        />

        {/* Dynamic Speech Bubble */}
        <div ref={bubbleRef} className="giggles-speech-bubble" role="status" aria-live="polite">
          <span className="bubble-text">{gigglesReaction || 'Welcome to my Candyland Garden! 🍭'}</span>
          <div className="bubble-tail" />
        </div>
      </div>

      {/* Placed Garden Items Layer */}
      <div ref={itemsContainerRef} className="garden-items-layer">
        {items.map((item) => {
          const isSelected = item.uid === selectedItemId;
          const isDragging = item.uid === draggingUid;

          return (
            <div
              key={item.uid}
              id={`garden-item-${item.uid}`}
              className={`garden-placed-item ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: `translate(-50%, -100%) scale(${item.scale || 1})`,
                zIndex: Math.round(item.y * 10),
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectItem(item.uid);
              }}
              onPointerDown={(e) => handlePointerDown(e, item)}
              onKeyDown={(e) => handleItemKeyDown(e, item.uid)}
              tabIndex={0}
              role="button"
              aria-label={`${getItemById(item.typeId)?.name || 'Candy item'}. ${
                isSelected ? 'Selected. Press Delete to remove.' : 'Click to select or drag to move.'
              }`}
            >
              {/* Selection Halo Glow */}
              {isSelected && (
                <div className="selection-glow" aria-hidden="true">
                  <div className="selection-ring" />
                  <span className="selection-badge">Selected</span>
                </div>
              )}

              {/* Vector SVG Render */}
              <div className="item-svg-wrapper">
                <ItemRenderer typeId={item.typeId} color={item.color} size={64} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Canvas Guide / Status pill */}
      <div className="canvas-instruction-pill">
        <span className="guide-icon">✨</span>
        <span>
          {selectedItemId
            ? 'Item selected! Use the color palette to tint it, drag to move, or click "Remove".'
            : activeItemToPlace
            ? `Ready to plant: ${getItemById(activeItemToPlace)?.name}. Click anywhere in the garden!`
            : 'Click on the garden to plant candy, or choose below!'}
        </span>
      </div>
    </div>
  );
}
