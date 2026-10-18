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
import { TextPanel } from './TextPanel';
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
  // Garden state with undo/redo history
  const [items, setItems] = useState(INITIAL_GARDEN_ITEMS);
  const [history, setHistory] = useState([INITIAL_GARDEN_ITEMS]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedItemId, setSelectedItemId] = useState(null);

  // Background scene theme & outline mode
  const [backgroundTheme, setBackgroundTheme] = useState('candy-kingdom'); // 'candy-kingdom' | 'cloud-nine' | 'starry-night'
  const [outlineMode, setOutlineMode] = useState(false);

  // Creator tools state
  const [activeItemToPlace, setActiveItemToPlace] = useState('lollipop');
  const [currentColor, setCurrentColor] = useState(COLOR_PALETTE[0].hex);
  const [activeTab, setActiveTab] = useState('candies'); // 'candies' | 'decorations' | 'text'

  // Giggles speech bubble reactions
  const [gigglesReaction, setGigglesReaction] = useState('Welcome to my Candyland Garden! 🍭');

  // Modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Selected item object reference
  const selectedItem = items.find((item) => item.uid === selectedItemId);
  const selectedItemDef = selectedItem
    ? selectedItem.typeId === 'text'
      ? { id: 'text', name: 'Magic Text', category: 'text' }
      : getItemById(selectedItem.typeId)
    : null;
  const activeItemDef = activeItemToPlace === 'text'
    ? { id: 'text', name: 'Magic Text' }
    : getItemById(activeItemToPlace);

  const triggerGigglesCheer = useCallback((customText) => {
    if (customText) {
      setGigglesReaction(customText);
    } else {
      const randomQuip = GIGGLES_QUIPS[Math.floor(Math.random() * GIGGLES_QUIPS.length)];
      setGigglesReaction(randomQuip);
    }
  }, []);

  // Helper to commit state changes to history
  const pushToHistory = useCallback((newItems) => {
    setHistory((prev) => {
      const updated = prev.slice(0, historyIndex + 1);
      updated.push(newItems);
      if (updated.length > 30) updated.shift();
      return updated;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 29));
    setItems(newItems);
  }, [historyIndex]);

  // Undo system
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setItems(history[prevIdx]);
      setSelectedItemId(null);
      triggerGigglesCheer('Undone! Rewinding sweet time! ⏳✨');
    }
  }, [history, historyIndex, triggerGigglesCheer]);

  // Redo system
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setItems(history[nextIdx]);
      setSelectedItemId(null);
      triggerGigglesCheer('Redone! Fast-forwarding sweet magic! ⏩🍭');
    }
  }, [history, historyIndex, triggerGigglesCheer]);

  // Remove the currently selected item
  const handleRemoveSelected = useCallback(() => {
    if (!selectedItemId) return;
    const el = document.getElementById(`garden-item-${selectedItemId}`);

    const finalizeRemoval = () => {
      const updated = items.filter((item) => item.uid !== selectedItemId);
      pushToHistory(updated);
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
  }, [selectedItemId, items, pushToHistory, triggerGigglesCheer]);

  // Keyboard accessibility: Undo (Ctrl+Z), Redo (Ctrl+Y / Ctrl+Shift+Z), Delete
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);

      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (isInput) return;
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
  }, [selectedItemId, handleRemoveSelected, handleUndo, handleRedo]);

  // Handle selecting an item from the trays
  const handleSelectToolItem = (typeId) => {
    setActiveItemToPlace(typeId);
    const def = getItemById(typeId);
    if (def) {
      triggerGigglesCheer(`Ooh! Let's plant a sweet ${def.name}!`);
    }
  };

  // Handle color change: updates current drawing color AND selected garden item
  const handleSelectColor = (colorHex) => {
    setCurrentColor(colorHex);

    if (selectedItemId) {
      const updated = items.map((item) =>
        item.uid === selectedItemId ? { ...item, color: colorHex, isOutline: false } : item
      );
      pushToHistory(updated);
      triggerGigglesCheer('Pretty frosting color! Giggles loves it! 🎨');
    }
  };

  // Handle scale change for selected item
  const handleUpdateItemScale = useCallback((uid, newScale) => {
    setItems((prev) =>
      prev.map((item) => (item.uid === uid ? { ...item, scale: newScale } : item))
    );
  }, []);

  // Update item position from dragging
  const handleUpdateItemPosition = (uid, x, y) => {
    setItems((prev) =>
      prev.map((item) => (item.uid === uid ? { ...item, x, y } : item))
    );
  };

  // Add an item at specific percentage coordinates in the garden
  const handleAddItemAtPosition = useCallback(
    (xPercent, yPercent, overrideTypeId, overrideColor) => {
      const typeId = overrideTypeId || activeItemToPlace;
      const color = overrideColor || (outlineMode ? '#FFFFFF' : currentColor);
      const isText = typeId === 'text';
      const def = isText ? null : getItemById(typeId);

      const newItem = {
        uid: `${isText ? 'text' : 'candy'}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        typeId,
        color,
        isOutline: outlineMode,
        text: isText ? 'Sweet Dreams 💖' : undefined,
        fontSize: isText ? 26 : undefined,
        font: isText ? 'Fredoka' : undefined,
        x: Math.round(xPercent * 10) / 10,
        y: Math.round(yPercent * 10) / 10,
        scale: def && def.category === 'decoration' ? 0.9 : 1.0,
      };

      const updated = [...items, newItem];
      pushToHistory(updated);
      setSelectedItemId(newItem.uid);

      setTimeout(() => {
        const el = document.getElementById(`garden-item-${newItem.uid}`);
        if (el) {
          const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (!prefersReducedMotion) {
            gsap.fromTo(
              el,
              { scale: 0, rotation: -25, opacity: 0 },
              { scale: newItem.scale || 1, rotation: 0, opacity: 1, duration: 0.45, ease: 'back.out(2.5)' }
            );
          }
        }
      }, 20);

      triggerGigglesCheer();
    },
    [activeItemToPlace, currentColor, items, outlineMode, pushToHistory, triggerGigglesCheer]
  );

  // Add text item to canvas
  const handleAddText = ({ text, fontSize, font, color }) => {
    const randomX = 25 + Math.random() * 50;
    const randomY = 40 + Math.random() * 30;

    const newItem = {
      uid: `text-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      typeId: 'text',
      text: text || 'Sweet Dreams 💖',
      fontSize: fontSize || 26,
      font: font || 'Fredoka',
      color: color || currentColor,
      x: Math.round(randomX * 10) / 10,
      y: Math.round(randomY * 10) / 10,
      scale: 1.0,
    };

    const updated = [...items, newItem];
    pushToHistory(updated);
    setSelectedItemId(newItem.uid);
    triggerGigglesCheer('Magic words planted! Giggles loves reading them! 📝✨');
  };

  // Update existing text item
  const handleUpdateText = (uid, updates) => {
    const updated = items.map((item) =>
      item.uid === uid ? { ...item, ...updates } : item
    );
    setItems(updated);
  };

  // Add button clicked: places in a sweet spot in the meadow
  const handleAddCurrentItem = () => {
    if (activeTab === 'text') {
      handleAddText({ text: 'Sweet Dreams 💖', fontSize: 26, font: 'Fredoka', color: currentColor });
      return;
    }
    const randomX = 20 + Math.random() * 60;
    const randomY = 48 + Math.random() * 38;
    handleAddItemAtPosition(randomX, randomY);
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
    pushToHistory(INITIAL_GARDEN_ITEMS);
    setSelectedItemId(null);
    triggerGigglesCheer('Fresh and sparkly! Ready to make more candy magic! 🌸');
  };

  // Toggle outline coloring book mode
  const handleToggleOutlineMode = () => {
    const nextMode = !outlineMode;
    setOutlineMode(nextMode);
    if (nextMode) {
      triggerGigglesCheer('Coloring Book Mode ON! Crisp black outlines ready for coloring! 🖍️✨');
    } else {
      triggerGigglesCheer('Full Frosting Mode! Pastel colors popping! 🎨');
    }
  };

  // Change Background Theme
  const handleChangeBackground = (theme) => {
    setBackgroundTheme(theme);
    if (theme === 'cloud-nine') {
      triggerGigglesCheer('Cloud Nine! Floating high above the rainbow! ☁️🌈');
    } else if (theme === 'starry-night') {
      triggerGigglesCheer('Starry Night! The moon is smiling at us! 🌙⭐');
    } else {
      triggerGigglesCheer('Candy Kingdom! Sunshine and sugar hills! 🍭🌸');
    }
  };

  // Real Export to PNG Wallpaper (composites chosen background, items, text, and Giggles)
  const handleExportImage = () => {
    const offscreen = document.createElement('canvas');
    offscreen.width = 1200;
    offscreen.height = 780;
    const ctx = offscreen.getContext('2d');

    // 1. Draw Selected Background Scene
    if (backgroundTheme === 'starry-night') {
      const nightGrad = ctx.createLinearGradient(0, 0, 0, 780);
      nightGrad.addColorStop(0, '#0E122C');
      nightGrad.addColorStop(0.5, '#1B1947');
      nightGrad.addColorStop(1, '#312258');
      ctx.fillStyle = nightGrad;
      ctx.fillRect(0, 0, 1200, 780);

      // Crescent Moon
      ctx.fillStyle = '#FFE88D';
      ctx.beginPath();
      ctx.arc(220, 140, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0E122C';
      ctx.beginPath();
      ctx.arc(245, 128, 52, 0, Math.PI * 2);
      ctx.fill();

      // Twinkling stars
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 40; i++) {
        const sx = (Math.sin(i * 342) * 0.5 + 0.5) * 1200;
        const sy = (Math.cos(i * 123) * 0.5 + 0.5) * 450;
        ctx.fillRect(sx, sy, i % 3 === 0 ? 3 : 2, i % 3 === 0 ? 3 : 2);
      }

      // Midnight Hill
      ctx.fillStyle = '#1C173E';
      ctx.beginPath();
      ctx.arc(600, 1200, 850, 0, Math.PI * 2);
      ctx.fill();
    } else if (backgroundTheme === 'cloud-nine') {
      const cloudGrad = ctx.createLinearGradient(0, 0, 0, 780);
      cloudGrad.addColorStop(0, '#DDF3FF');
      cloudGrad.addColorStop(0.5, '#E6E0FA');
      cloudGrad.addColorStop(1, '#FFF0F8');
      ctx.fillStyle = cloudGrad;
      ctx.fillRect(0, 0, 1200, 780);

      // Rainbow Arc
      ctx.lineWidth = 16;
      const rainbowColors = ['#FF9EC6', '#FFE28A', '#9BF2D8', '#99D5FF', '#CBB4FA'];
      rainbowColors.forEach((col, idx) => {
        ctx.strokeStyle = col;
        ctx.beginPath();
        ctx.arc(600, 680, 520 - idx * 16, Math.PI, 0, false);
        ctx.stroke();
      });

      // Giant Clouds
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(300, 700, 320, 0, Math.PI * 2);
      ctx.arc(650, 720, 360, 0, Math.PI * 2);
      ctx.arc(950, 700, 300, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Candy Kingdom (Default)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 780);
      skyGrad.addColorStop(0, '#FFF1F7');
      skyGrad.addColorStop(0.4, '#FDE4F2');
      skyGrad.addColorStop(0.75, '#E9DBFB');
      skyGrad.addColorStop(1, '#D5E8FD');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 1200, 780);

      ctx.fillStyle = '#FFCBE2';
      ctx.beginPath();
      ctx.arc(600, 1150, 800, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#C8F1E4';
      ctx.beginPath();
      ctx.arc(450, 1180, 750, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFE0B2';
      ctx.beginPath();
      ctx.moveTo(300, 480);
      ctx.quadraticCurveTo(550, 600, 620, 780);
      ctx.lineTo(480, 780);
      ctx.quadraticCurveTo(420, 600, 240, 520);
      ctx.closePath();
      ctx.fill();
    }

    // 2. Watermark & Title
    ctx.fillStyle = backgroundTheme === 'starry-night' ? '#FFE88D' : '#D81B60';
    ctx.font = 'bold 34px "Segoe UI", sans-serif';
    ctx.fillText("Giggles' Candyland Studio 🍭", 50, 65);
    ctx.fillStyle = backgroundTheme === 'starry-night' ? '#CBB4FA' : '#6A1B9A';
    ctx.font = '600 18px "Segoe UI", sans-serif';
    ctx.fillText(`haX.baby Wallpaper • ${backgroundTheme.replace('-', ' ').toUpperCase()}`, 50, 95);

    // 3. Draw placed items (candies & magic text)
    items.forEach((item) => {
      const x = (item.x / 100) * 1200;
      const y = (item.y / 100) * 780;
      const scale = item.scale || 1.0;

      ctx.save();
      ctx.translate(x, y - 28);
      ctx.scale(scale, scale);

      if (item.typeId === 'text') {
        ctx.font = `bold ${item.fontSize || 26}px "Fredoka", "Nunito", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = item.color || '#FF6EA7';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.strokeText(item.text || 'Sweet Dreams 💖', 0, 0);
        ctx.fillText(item.text || 'Sweet Dreams 💖', 0, 0);
      } else {
        const r = 26;
        ctx.fillStyle = item.isOutline || outlineMode ? '#FFFFFF' : item.color;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = item.isOutline || outlineMode ? '#302A43' : '#FFFFFF';
        ctx.lineWidth = item.isOutline || outlineMode ? 3.5 : 4;
        ctx.stroke();

        ctx.fillStyle = item.isOutline || outlineMode ? '#302A43' : '#FFFFFF';
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
      }

      ctx.restore();
    });

    // 4. Draw Giggles Character Stamp
    const gigglesImg = new Image();
    gigglesImg.src = '/images/giggles_main.png';
    gigglesImg.onload = () => {
      ctx.drawImage(gigglesImg, 910, 30, 250, 190);
      downloadCanvas();
    };
    gigglesImg.onerror = () => {
      downloadCanvas();
    };

    const downloadCanvas = () => {
      const dataUrl = offscreen.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `giggles_${backgroundTheme}_${Date.now()}.png`;
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
          gumdrops, magic words, and glowing garden charms.
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
            onUpdateItemScale={handleUpdateItemScale}
            onRemoveSelected={handleRemoveSelected}
            backgroundTheme={backgroundTheme}
            outlineMode={outlineMode}
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
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            backgroundTheme={backgroundTheme}
            onChangeBackground={handleChangeBackground}
            outlineMode={outlineMode}
            onToggleOutlineMode={handleToggleOutlineMode}
            hasSelection={Boolean(selectedItemId)}
            selectedItemName={selectedItemDef ? selectedItemDef.name : ''}
            activeItemName={activeItemDef ? activeItemDef.name : ''}
            itemsCount={items.length}
          />
        </section>

        {/* Selection & Customization Trays */}
        <section className="creator-controls-section" aria-label="Candy, Charm, Text & Color Trays">
          {/* Category Toggle Tabs */}
          <div className="tray-tabs-bar" role="tablist" aria-label="Item Categories">
            <button
              type="button"
              className={`tray-tab-btn ${activeTab === 'candies' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('candies');
                if (activeItemToPlace === 'text') setActiveItemToPlace('lollipop');
              }}
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
              onClick={() => {
                setActiveTab('decorations');
                if (activeItemToPlace === 'text') setActiveItemToPlace('star');
              }}
              role="tab"
              aria-selected={activeTab === 'decorations'}
            >
              <span className="tab-icon">⭐</span>
              <span className="tab-title">Garden Charms</span>
              <span className="tab-count">(6)</span>
            </button>
            <button
              type="button"
              className={`tray-tab-btn ${activeTab === 'text' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('text');
                setActiveItemToPlace('text');
              }}
              role="tab"
              aria-selected={activeTab === 'text'}
            >
              <span className="tab-icon">✏️</span>
              <span className="tab-title">Magic Text</span>
            </button>
          </div>

          {/* Active Item Panel Row */}
          <div className="panels-row">
            <div className="panel-primary-column">
              {activeTab === 'candies' && (
                <CandySelectionPanel
                  activeItemId={activeItemToPlace}
                  currentColor={currentColor}
                  onSelectItem={handleSelectToolItem}
                />
              )}
              {activeTab === 'decorations' && (
                <DecorationPanel
                  activeItemId={activeItemToPlace}
                  currentColor={currentColor}
                  onSelectItem={handleSelectToolItem}
                />
              )}
              {activeTab === 'text' && (
                <TextPanel
                  selectedTextItem={selectedItem && selectedItem.typeId === 'text' ? selectedItem : null}
                  onAddText={handleAddText}
                  onUpdateText={handleUpdateText}
                  currentColor={currentColor}
                  onSelectColor={handleSelectColor}
                />
              )}
            </div>

            {/* Frosting Color Palette & Scale Panel */}
            <div className="panel-color-column">
              <ColorPalettePanel
                currentColor={currentColor}
                onSelectColor={handleSelectColor}
                selectedItem={selectedItemDef}
                selectedItemScale={selectedItem ? selectedItem.scale || 1.0 : 1.0}
                onChangeScale={(newScale) => {
                  if (selectedItemId) handleUpdateItemScale(selectedItemId, newScale);
                }}
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
