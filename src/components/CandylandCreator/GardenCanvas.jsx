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
  onUpdateItemScale,
  onRemoveSelected,
  backgroundTheme = 'candy-kingdom',
  outlineMode = false,
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

  // Corner resize drag state
  const [resizingUid, setResizingUid] = useState(null);
  const [initialResizeState, setInitialResizeState] = useState(null);

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
    // If clicking on an existing item or controls or Giggles, ignore
    if (
      e.target.closest('.garden-placed-item') ||
      e.target.closest('.giggles-character-anchor') ||
      e.target.closest('.selection-floating-controls')
    ) {
      return;
    }

    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickXPercent = Math.max(8, Math.min(92, ((e.clientX - rect.left) / rect.width) * 100));
    const clickYPercent = Math.max(15, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100));

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

  // Item dragging (mouse & touch)
  const handlePointerDown = (e, item) => {
    if (e.target.closest('.selection-floating-controls') || e.target.closest('.resize-handle')) {
      return;
    }
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

  // Corner resize handle pointer down
  const handleResizePointerDown = (e, item) => {
    e.stopPropagation();
    setResizingUid(item.uid);
    setInitialResizeState({
      startX: e.clientX,
      startY: e.clientY,
      startScale: item.scale || 1.0,
    });
  };

  const handlePointerMove = (e) => {
    if (resizingUid && initialResizeState && onUpdateItemScale) {
      const deltaX = e.clientX - initialResizeState.startX;
      const deltaY = e.clientY - initialResizeState.startY;
      const avgDelta = (deltaX + deltaY) / 100;
      const newScale = Math.max(0.4, Math.min(2.5, Number((initialResizeState.startScale + avgDelta).toFixed(2))));
      onUpdateItemScale(resizingUid, newScale);
      return;
    }

    if (!draggingUid || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();

    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;

    const xPercent = Math.max(5, Math.min(95, (newX / rect.width) * 100));
    const yPercent = Math.max(10, Math.min(92, (newY / rect.height) * 100));

    onUpdateItemPosition(draggingUid, xPercent, yPercent);
  };

  const handlePointerUp = () => {
    if (draggingUid) setDraggingUid(null);
    if (resizingUid) {
      setResizingUid(null);
      setInitialResizeState(null);
    }
  };

  return (
    <div
      ref={canvasRef}
      className={`garden-canvas bg-theme-${backgroundTheme}`}
      onClick={handleCanvasClick}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      role="region"
      aria-label="Interactive Candyland Garden Area. Click anywhere to plant candy or drag items to place them."
      tabIndex={0}
    >
      {/* Visual scenic landscape background SVG */}
      <svg className="garden-scenic-bg" viewBox="0 0 1000 650" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          {/* Candy Kingdom Gradients */}
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

          {/* Cloud Nine Gradients */}
          <linearGradient id="cloud-nine-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DDF3FF" />
            <stop offset="45%" stopColor="#E6E0FA" />
            <stop offset="100%" stopColor="#FFF0F8" />
          </linearGradient>

          {/* Starry Night Gradients */}
          <linearGradient id="starry-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0E122C" />
            <stop offset="50%" stopColor="#1B1947" />
            <stop offset="100%" stopColor="#312258" />
          </linearGradient>
          <linearGradient id="moon-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF9D2" />
            <stop offset="80%" stopColor="#FFE082" />
            <stop offset="100%" stopColor="#FFCA28" />
          </linearGradient>
        </defs>

        {/* 1. SCENE: CANDY KINGDOM */}
        {backgroundTheme === 'candy-kingdom' && (
          <g className="scene-candy-kingdom">
            {/* Sky */}
            <rect x="0" y="0" width="1000" height="650" fill="url(#candy-sky)" />

            {/* Rainbow Arch */}
            <path d="M 120 400 A 380 340 0 0 1 880 400" fill="none" stroke="#FF80AB" strokeWidth="14" strokeOpacity="0.45" strokeLinecap="round" />
            <path d="M 135 400 A 365 325 0 0 1 865 400" fill="none" stroke="#FFE082" strokeWidth="14" strokeOpacity="0.45" strokeLinecap="round" />
            <path d="M 150 400 A 350 310 0 0 1 850 400" fill="none" stroke="#80E8D0" strokeWidth="14" strokeOpacity="0.45" strokeLinecap="round" />
            <path d="M 165 400 A 335 295 0 0 1 835 400" fill="none" stroke="#B388FF" strokeWidth="14" strokeOpacity="0.45" strokeLinecap="round" />

            {/* Clouds */}
            <path d="M 0 260 Q 90 210, 200 240 Q 320 200, 460 250 Q 560 190, 720 240 Q 860 190, 1000 230 L 1000 650 L 0 650 Z" fill="#FFF9FC" opacity="0.6" />

            {/* Back Strawberry Hill */}
            <path d="M 0 350 Q 240 240, 520 310 Q 780 250, 1000 330 L 1000 650 L 0 650 Z" fill="url(#hill-back)" opacity="0.85" />
            <path d="M 0 350 Q 40 365, 80 350 Q 120 365, 160 345 Q 200 360, 240 330 Q 300 345, 360 320 Q 420 340, 480 315 Q 540 330, 600 300 Q 660 320, 720 280 Q 780 305, 840 295 Q 900 320, 960 315 Q 980 330, 1000 330" fill="none" stroke="#FFF" strokeWidth="5" strokeLinecap="round" opacity="0.8" />

            {/* Mid Mint Hill */}
            <path d="M -50 420 Q 280 340, 580 400 Q 820 350, 1050 440 L 1050 650 L -50 650 Z" fill="url(#hill-mid)" />
            <path d="M 0 420 Q 60 440, 120 415 Q 180 445, 240 400 Q 320 435, 400 380 Q 480 415, 560 390 Q 640 425, 720 385 Q 800 420, 880 380 Q 940 410, 1000 435" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity="0.9" />

            {/* Sugar Path */}
            <path d="M 280 410 Q 380 480, 460 530 Q 540 580, 520 650 L 420 650 Q 420 590, 360 540 Q 280 480, 220 430 Z" fill="url(#sugar-path)" stroke="#FFE082" strokeWidth="2" />
            <circle cx="280" cy="450" r="4" fill="#FFB74D" opacity="0.6" />
            <circle cx="340" cy="490" r="5" fill="#FF80AB" opacity="0.6" />
            <circle cx="410" cy="530" r="6" fill="#80DEEA" opacity="0.6" />
            <circle cx="470" cy="570" r="5" fill="#BA68C8" opacity="0.6" />

            {/* Foreground Meadow */}
            <path d="M 0 510 Q 220 450, 450 510 Q 720 460, 1000 520 L 1000 650 L 0 650 Z" fill="url(#hill-fore)" opacity="0.4" />
          </g>
        )}

        {/* 2. SCENE: CLOUD NINE */}
        {backgroundTheme === 'cloud-nine' && (
          <g className="scene-cloud-nine">
            <rect x="0" y="0" width="1000" height="650" fill="url(#cloud-nine-sky)" />

            {/* Giant Glowing Pastel Rainbow */}
            <path d="M 50 520 A 460 400 0 0 1 950 520" fill="none" stroke="#FF9EC6" strokeWidth="20" strokeOpacity="0.6" />
            <path d="M 70 520 A 440 380 0 0 1 930 520" fill="none" stroke="#FFE28A" strokeWidth="20" strokeOpacity="0.6" />
            <path d="M 90 520 A 420 360 0 0 1 910 520" fill="none" stroke="#9BF2D8" strokeWidth="20" strokeOpacity="0.6" />
            <path d="M 110 520 A 400 340 0 0 1 890 520" fill="none" stroke="#99D5FF" strokeWidth="20" strokeOpacity="0.6" />
            <path d="M 130 520 A 380 320 0 0 1 870 520" fill="none" stroke="#CBB4FA" strokeWidth="20" strokeOpacity="0.6" />

            {/* Tiered Fluffy White Cloud Beds */}
            <path d="M -50 360 Q 60 280, 200 320 Q 340 250, 500 310 Q 660 260, 800 320 Q 940 270, 1050 350 L 1050 650 L -50 650 Z" fill="#F4E8FC" opacity="0.7" />
            <path d="M -50 440 Q 120 370, 300 420 Q 480 360, 680 410 Q 860 370, 1050 430 L 1050 650 L -50 650 Z" fill="#E8F4FD" opacity="0.85" />
            <path d="M -50 510 Q 150 440, 380 490 Q 600 430, 820 480 Q 950 450, 1050 510 L 1050 650 L -50 650 Z" fill="#FFFDFE" />

            {/* Shimmering Golden Stars */}
            {[
              [140, 90, 14], [280, 60, 18], [420, 110, 12], [620, 75, 16], [780, 120, 14], [880, 80, 20]
            ].map(([cx, cy, r], idx) => (
              <polygon
                key={idx}
                points={`${cx},${cy - r} ${cx + r * 0.3},${cy - r * 0.3} ${cx + r},${cy} ${cx + r * 0.3},${cy + r * 0.3} ${cx},${cy + r} ${cx - r * 0.3},${cy + r * 0.3} ${cx - r},${cy} ${cx - r * 0.3},${cy - r * 0.3}`}
                fill="#FFE88D"
                opacity="0.95"
              />
            ))}
          </g>
        )}

        {/* 3. SCENE: STARRY NIGHT LULLABY */}
        {backgroundTheme === 'starry-night' && (
          <g className="scene-starry-night">
            <rect x="0" y="0" width="1000" height="650" fill="url(#starry-sky)" />

            {/* Glowing Crescent Moon with Happy Sleepy Face */}
            <g transform="translate(160, 120)">
              <circle cx="0" cy="0" r="55" fill="#FFE88D" filter="drop-shadow(0 0 25px rgba(255, 232, 141, 0.6))" />
              <circle cx="22" cy="-12" r="48" fill="#0E122C" />
              {/* Cute sleeping eye & rosy blush on moon */}
              <path d="M -18 4 Q -12 12, -6 4" fill="none" stroke="#9E7800" strokeWidth="2.5" strokeLinecap="round" />
              <ellipse cx="-12" cy="14" rx="5" ry="3" fill="#FF8EA8" opacity="0.75" />
            </g>

            {/* Twinkling Constellations */}
            {[
              [340, 90], [420, 60], [520, 110], [680, 70], [740, 120], [860, 90], [920, 140],
              [240, 200], [580, 180], [810, 210], [390, 230], [670, 260]
            ].map(([x, y], idx) => (
              <g key={idx} transform={`translate(${x}, ${y})`}>
                <circle cx="0" cy="0" r={idx % 2 === 0 ? 3.5 : 2.5} fill="#FFF" opacity="0.9" />
                <path d="M 0 -8 L 0 8 M -8 0 L 8 0" stroke="#FFE88D" strokeWidth="1.2" opacity="0.8" />
              </g>
            ))}

            {/* Midnight Dream Cloud Beds */}
            <path d="M -50 400 Q 150 340, 360 380 Q 580 320, 800 370 Q 950 330, 1050 390 L 1050 650 L -50 650 Z" fill="#241E4A" opacity="0.7" />
            <path d="M -50 470 Q 180 410, 420 460 Q 640 400, 850 450 Q 980 420, 1050 470 L 1050 650 L -50 650 Z" fill="#1C173E" opacity="0.9" />
            <path d="M -50 530 Q 120 480, 320 520 Q 560 470, 760 520 Q 920 480, 1050 530 L 1050 650 L -50 650 Z" fill="#140F2E" />
          </g>
        )}
      </svg>

      {/* Baby Giggles Character Anchor */}
      <div
        ref={gigglesRef}
        className="giggles-character-anchor"
        style={{ left: '78%', top: '8%' }}
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
        <div className="giggles-cloud-cushion" aria-hidden="true" />
        <img
          src="/images/giggles_main.png"
          alt="Original Baby Giggles in pink onesie holding giant lollipop"
          className="giggles-character-img"
        />
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
          const scale = item.scale || 1.0;

          return (
            <div
              key={item.uid}
              id={`garden-item-${item.uid}`}
              className={`garden-placed-item ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} type-${item.typeId}`}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: `translate(-50%, -100%) scale(${scale})`,
                zIndex: isSelected ? 150 : Math.round(item.y * 10),
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectItem(item.uid);
              }}
              onPointerDown={(e) => handlePointerDown(e, item)}
              onKeyDown={(e) => handleItemKeyDown(e, item.uid)}
              tabIndex={0}
              role="button"
              aria-label={`${item.typeId === 'text' ? `Text: "${item.text}"` : getItemById(item.typeId)?.name || 'Candy item'}. ${
                isSelected ? 'Selected. Resize or drag.' : 'Click to select.'
              }`}
            >
              {/* Selection Bounding Box & Floating Handles */}
              {isSelected && (
                <div className="selection-bounding-box" aria-hidden="true">
                  <div className="selection-border" />

                  {/* Corner Resize Handle */}
                  <div
                    className="resize-handle corner-br"
                    title="Drag to resize"
                    onPointerDown={(e) => handleResizePointerDown(e, item)}
                  />

                  {/* Quick Scale Control Bubble */}
                  <div className="selection-floating-controls" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="ctrl-btn-mini"
                      onClick={() => onUpdateItemScale && onUpdateItemScale(item.uid, Math.max(0.4, Number((scale - 0.15).toFixed(2))))}
                      title="Shrink item"
                      aria-label="Shrink item"
                    >
                      ➖
                    </button>
                    <span className="ctrl-scale-val">{Math.round(scale * 100)}%</span>
                    <button
                      type="button"
                      className="ctrl-btn-mini"
                      onClick={() => onUpdateItemScale && onUpdateItemScale(item.uid, Math.min(2.5, Number((scale + 0.15).toFixed(2))))}
                      title="Enlarge item"
                      aria-label="Enlarge item"
                    >
                      ➕
                    </button>
                    <button
                      type="button"
                      className="ctrl-btn-mini btn-del"
                      onClick={() => onRemoveSelected && onRemoveSelected()}
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}

              {/* Render item vector or text */}
              <div className="item-svg-wrapper">
                <ItemRenderer
                  typeId={item.typeId}
                  color={item.color}
                  text={item.text}
                  fontSize={item.fontSize}
                  font={item.font}
                  size={64}
                  outlineMode={outlineMode || item.isOutline}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Canvas Guide */}
      <div className="canvas-instruction-pill">
        <span className="guide-icon">✨</span>
        <span>
          {selectedItemId
            ? 'Item selected! Use the handles or panel to resize, color, or move.'
            : activeItemToPlace === 'text'
            ? 'Magic Text ready! Click anywhere on canvas or type below.'
            : activeItemToPlace
            ? `Ready to plant: ${getItemById(activeItemToPlace)?.name}. Click anywhere in the garden!`
            : 'Click on the garden to plant candy, or choose below!'}
        </span>
      </div>
    </div>
  );
}
