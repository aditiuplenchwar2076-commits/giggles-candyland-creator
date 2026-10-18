import React, { useState, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import {
  ALL_ITEMS,
  COLOR_PALETTE,
  INITIAL_GARDEN_ITEMS,
  getItemById,
} from './candyCatalog';
import { GardenCanvas } from './GardenCanvas';
import { CandySelectionPanel } from './CandySelectionPanel';
import { DecorationPanel } from './DecorationPanel';
import { ColorPalettePanel } from './ColorPalettePanel';
import { ControlBar } from './ControlBar';
import { ResetModal } from './ResetModal';
import './CandylandCreator.css';

const GIGGLES_QUIPS = [
  'Yay! That looks delicious!',
  'More sprinkles, more smiles! ✨',
  'Giggles loves this sweet candy! 💖',
  'Ooh, look how bright it is!',
  'Pop! A magical sweet treat! 🍬',
  'Mmm! Can I have a lick of that? 🍭',
  'Our dreamy garden is growing!',
];

export function CandylandCreator() {
  // Garden state
  const [items, setItems] = useState(INITIAL_GARDEN_ITEMS);
  const [selectedItemId, setSelectedItemId] = useState(null);

  // Creator tools state
  const [activeItemToPlace, setActiveItemToPlace] = useState('lollipop');
  const [currentColor, setCurrentColor] = useState(COLOR_PALETTE[0].hex);
  const [activeTab, setActiveTab] = useState('candies'); // 'candies' | 'decorations'

  // Giggles speech bubble reactions
  const [gigglesReaction, setGigglesReaction] = useState('Welcome to my Candyland Garden! 🍭');

  // Modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Selected item object reference
  const selectedItem = items.find((item) => item.uid === selectedItemId);
  const selectedItemDef = selectedItem ? getItemById(selectedItem.typeId) : null;
  const activeItemDef = getItemById(activeItemToPlace);

  const triggerGigglesCheer = useCallback((customText) => {
    if (customText) {
      setGigglesReaction(customText);
    } else {
      const randomQuip = GIGGLES_QUIPS[Math.floor(Math.random() * GIGGLES_QUIPS.length)];
      setGigglesReaction(randomQuip);
    }
  }, []);

  // Remove the currently selected item
  const handleRemoveSelected = useCallback(() => {
    if (!selectedItemId) return;
    const el = document.getElementById(`garden-item-${selectedItemId}`);

    const finalizeRemoval = () => {
      setItems((prev) => prev.filter((item) => item.uid !== selectedItemId));
      setSelectedItemId(null);
      triggerGigglesCheer('Nom nom nom! Giggles ate that sweet! 😋');
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion && el) {
      gsap.to(el, {
        scale: 0,
        opacity: 0,
        rotation: 40,
        duration: 0.28,
        ease: 'power2.in',
        onComplete: finalizeRemoval,
      });
    } else {
      finalizeRemoval();
    }
  }, [selectedItemId, triggerGigglesCheer]);

  // Keyboard accessibility: Delete key removes selected item, Escape deselects
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Prevent if user is typing inside an input/textarea
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
        if (selectedItemId) {
          e.preventDefault();
          handleRemoveSelected();
        }
      } else if (e.key === 'Escape') {
        setSelectedItemId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemId, handleRemoveSelected]);

  // Handle selecting an item from the trays
  const handleSelectToolItem = (typeId) => {
    setActiveItemToPlace(typeId);
    const def = getItemById(typeId);
    // If no custom color was actively changed or when switching, give it a cheerful matching tint
    if (def) {
      triggerGigglesCheer(`Ooh! Let's plant a sweet ${def.name}!`);
    }
  };

  // Handle color change: updates current drawing color AND selected garden item
  const handleSelectColor = (colorHex) => {
    setCurrentColor(colorHex);

    if (selectedItemId) {
      setItems((prev) =>
        prev.map((item) => (item.uid === selectedItemId ? { ...item, color: colorHex } : item))
      );
      triggerGigglesCheer('Pretty frosting color! Giggles loves it! 🎨');
    }
  };

  // Add an item at specific percentage coordinates in the garden
  const handleAddItemAtPosition = useCallback(
    (xPercent, yPercent, overrideTypeId, overrideColor) => {
      const typeId = overrideTypeId || activeItemToPlace;
      const color = overrideColor || currentColor;
      const def = getItemById(typeId);

      const newItem = {
        uid: `candy-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        typeId,
        color,
        x: Math.round(xPercent * 10) / 10,
        y: Math.round(yPercent * 10) / 10,
        scale: def.category === 'decoration' ? 0.9 : 1.0,
      };

      setItems((prev) => [...prev, newItem]);
      setSelectedItemId(newItem.uid);

      // Trigger GSAP pop-in animation on next tick after render
      setTimeout(() => {
        const el = document.getElementById(`garden-item-${newItem.uid}`);
        if (el) {
          const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (!prefersReducedMotion) {
            gsap.fromTo(
              el,
              { scale: 0, rotation: -25, opacity: 0 },
              { scale: newItem.scale || 1, rotation: 0, opacity: 1, duration: 0.5, ease: 'back.out(2.5)' }
            );
          }
        }
      }, 20);

      triggerGigglesCheer();
    },
    [activeItemToPlace, currentColor, triggerGigglesCheer]
  );

  // Add button clicked: places in a sweet spot in the meadow
  const handleAddCurrentItem = () => {
    // Generate organic placement in center-lower meadow
    const randomX = 20 + Math.random() * 60;
    const randomY = 48 + Math.random() * 38;
    handleAddItemAtPosition(randomX, randomY);
  };

  // Update item position from dragging
  const handleUpdateItemPosition = (uid, x, y) => {
    setItems((prev) =>
      prev.map((item) => (item.uid === uid ? { ...item, x, y } : item))
    );
  };

  // Random Surprise feature
  const handleRandomSurprise = () => {
    const randomItem = ALL_ITEMS[Math.floor(Math.random() * ALL_ITEMS.length)];
    const randomColor = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)].hex;
    const randomX = 15 + Math.random() * 70;
    const randomY = 30 + Math.random() * 55;

    handleAddItemAtPosition(randomX, randomY, randomItem.id, randomColor);
    triggerGigglesCheer(`Surprise! A magical ${randomItem.name} appeared! 🎁✨`);
  };

  // Reset Garden to fresh starter scene
  const handleConfirmReset = () => {
    setItems(INITIAL_GARDEN_ITEMS);
    setSelectedItemId(null);
    triggerGigglesCheer('Fresh and sparkly! Ready to make more candy magic! 🌸');
  };

  // Real Export to PNG Wallpaper
  const handleExportImage = () => {
    const offscreen = document.createElement('canvas');
    offscreen.width = 1200;
    offscreen.height = 780;
    const ctx = offscreen.getContext('2d');

    // 1. Draw dreamy pastel sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 780);
    skyGrad.addColorStop(0, '#FFF1F7');
    skyGrad.addColorStop(0.4, '#FDE4F2');
    skyGrad.addColorStop(0.75, '#E9DBFB');
    skyGrad.addColorStop(1, '#D5E8FD');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1200, 780);

    // 2. Draw hills
    ctx.fillStyle = '#FFCBE2';
    ctx.beginPath();
    ctx.arc(600, 1150, 800, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#C8F1E4';
    ctx.beginPath();
    ctx.arc(450, 1180, 750, 0, Math.PI * 2);
    ctx.fill();

    // 3. Draw sugar path
    ctx.fillStyle = '#FFE0B2';
    ctx.beginPath();
    ctx.moveTo(300, 480);
    ctx.quadraticCurveTo(550, 600, 620, 780);
    ctx.lineTo(480, 780);
    ctx.quadraticCurveTo(420, 600, 240, 520);
    ctx.closePath();
    ctx.fill();

    // 4. Header title watermark
    ctx.fillStyle = '#D81B60';
    ctx.font = 'bold 36px "Segoe UI", sans-serif';
    ctx.fillText("Giggles' Candyland Studio 🍭", 50, 70);
    ctx.fillStyle = '#6A1B9A';
    ctx.font = '600 20px "Segoe UI", sans-serif';
    ctx.fillText("haX.baby Hackathon Wallpaper", 50, 105);

    // 5. Draw placed candies onto canvas
    items.forEach((item) => {
      const x = (item.x / 100) * 1200;
      const y = (item.y / 100) * 780;
      const r = 26 * (item.scale || 1);

      ctx.save();
      ctx.translate(x, y - 28);
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Candy icon symbol
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const emojis = {
        lollipop: '🍭',
        gumdrop: '🍬',
        'candy-tree': '🌳',
        cupcake: '🧁',
        'candy-flower': '🌸',
        mushroom: '🍄',
        'candy-house': '🏡',
        'heart-candy': '💖',
        star: '⭐',
        heart: '❤️',
        rainbow: '🌈',
        sparkles: '✨',
        'cloud-puff': '☁️',
        sprinkles: '🎊',
      };
      ctx.fillText(emojis[item.typeId] || '🍬', 0, 0);
      ctx.restore();
    });

    // 6. Draw Giggles character
    const gigglesImg = new Image();
    gigglesImg.src = '/images/giggles_main.png';
    gigglesImg.onload = () => {
      ctx.drawImage(gigglesImg, 900, 30, 260, 200);
      downloadCanvas();
    };
    gigglesImg.onerror = () => {
      downloadCanvas();
    };

    const downloadCanvas = () => {
      const dataUrl = offscreen.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `giggles_candyland_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      triggerGigglesCheer('DOWNLOADED! Frame it! Put it in the Louvre immediately! 🖼️✨');
    };
  };

  return (
    <div className="candyland-creator-root">
      {/* Header Banner */}
      <header className="creator-header">
        <div className="header-badge">
          <span className="badge-sparkle">✨</span>
          <span>haX.baby Hackathon Project 1</span>
        </div>
        <h1 className="creator-title">
          <span className="title-highlight">Candyland</span> Creator
        </h1>
        <p className="creator-tagline">
          Join <strong>Giggles</strong> in her dreamy pastel candy studio! Plant sweet lollipops,
          gumdrops, and glowing garden charms.
        </p>
      </header>

      {/* Main Content Layout */}
      <main className="creator-main-stage">
        {/* Interactive Garden Canvas Area */}
        <section className="canvas-section" aria-label="Interactive Candyland Canvas">
          <GardenCanvas
            items={items}
            selectedItemId={selectedItemId}
            onSelectItem={setSelectedItemId}
            onAddItemAtPosition={handleAddItemAtPosition}
            onUpdateItemPosition={handleUpdateItemPosition}
            gigglesReaction={gigglesReaction}
            activeItemToPlace={activeItemToPlace}
          />

          {/* Action Toolbar */}
          <ControlBar
            onAddCurrentItem={handleAddCurrentItem}
            onRemoveSelected={handleRemoveSelected}
            onRandomSurprise={handleRandomSurprise}
            onOpenResetModal={() => setIsResetModalOpen(true)}
            onExportImage={handleExportImage}
            hasSelection={Boolean(selectedItemId)}
            selectedItemName={selectedItemDef ? selectedItemDef.name : ''}
            activeItemName={activeItemDef ? activeItemDef.name : ''}
            itemsCount={items.length}
          />
        </section>

        {/* Selection & Customization Trays */}
        <section className="creator-controls-section" aria-label="Candy & Decoration Trays">
          {/* Category Toggle Tabs */}
          <div className="tray-tabs-bar" role="tablist" aria-label="Item Categories">
            <button
              type="button"
              className={`tray-tab-btn ${activeTab === 'candies' ? 'active' : ''}`}
              onClick={() => setActiveTab('candies')}
              role="tab"
              aria-selected={activeTab === 'candies'}
            >
              <span className="tab-icon">🍬</span>
              <span className="tab-title">Sweet Candies</span>
              <span className="tab-count">(8)</span>
            </button>
            <button
              type="button"
              className={`tray-tab-btn ${activeTab === 'decorations' ? 'active' : ''}`}
              onClick={() => setActiveTab('decorations')}
              role="tab"
              aria-selected={activeTab === 'decorations'}
            >
              <span className="tab-icon">⭐</span>
              <span className="tab-title">Garden Charms</span>
              <span className="tab-count">(6)</span>
            </button>
          </div>

          {/* Active Item Panel */}
          <div className="panels-row">
            <div className="panel-primary-column">
              {activeTab === 'candies' ? (
                <CandySelectionPanel
                  activeItemId={activeItemToPlace}
                  currentColor={currentColor}
                  onSelectItem={handleSelectToolItem}
                />
              ) : (
                <DecorationPanel
                  activeItemId={activeItemToPlace}
                  currentColor={currentColor}
                  onSelectItem={handleSelectToolItem}
                />
              )}
            </div>

            {/* Frosting Color Palette Panel */}
            <div className="panel-color-column">
              <ColorPalettePanel
                currentColor={currentColor}
                onSelectColor={handleSelectColor}
                selectedItem={selectedItemDef}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Reset Confirmation Modal */}
      <ResetModal
        isOpen={isResetModalOpen}
        onConfirmReset={handleConfirmReset}
        onClose={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}
