import React from 'react';
import { COLOR_PALETTE } from './candyCatalog';

export function ColorPalettePanel({
  currentColor,
  onSelectColor,
  selectedItem,
  selectedItemScale = 1,
  onChangeScale,
}) {
  return (
    <div className="creator-panel color-panel" role="region" aria-label="Color Palette Selector">
      <div className="panel-header">
        <div className="panel-title-group">
          <span className="panel-emoji">🎨</span>
          <h3 className="panel-title">Sugar Frosting Colors</h3>
        </div>
        <span className="panel-subtitle">
          {selectedItem
            ? `Tinting selected ${selectedItem.name}`
            : 'Color for next candy, charm or text'}
        </span>
      </div>

      <div className="palette-grid" role="radiogroup" aria-label="Choose a candy frosting color">
        {COLOR_PALETTE.map((color) => {
          const isSelected = currentColor.toLowerCase() === color.hex.toLowerCase();
          return (
            <button
              key={color.id}
              type="button"
              className={`color-swatch-btn ${isSelected ? 'active' : ''}`}
              style={{ backgroundColor: color.hex }}
              onClick={() => onSelectColor(color.hex)}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${color.name} frosting`}
              title={color.name}
            >
              {isSelected && (
                <span className="swatch-check" aria-hidden="true">
                  ★
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Scale Resizing Slider for Selected Item */}
      {selectedItem && onChangeScale && (
        <div className="item-scale-panel-group">
          <div className="scale-header-row">
            <span className="scale-label">📐 Selected Size:</span>
            <span className="scale-value-badge">{Math.round(selectedItemScale * 100)}%</span>
          </div>
          <div className="scale-slider-row">
            <button
              type="button"
              className="scale-step-btn"
              onClick={() => onChangeScale(Math.max(0.4, Number((selectedItemScale - 0.15).toFixed(2))))}
              title="Shrink item"
              aria-label="Shrink item"
            >
              ➖
            </button>
            <input
              type="range"
              min="0.4"
              max="2.5"
              step="0.05"
              value={selectedItemScale}
              onChange={(e) => onChangeScale(parseFloat(e.target.value))}
              className="scale-slider-input"
              aria-label="Adjust item scale"
            />
            <button
              type="button"
              className="scale-step-btn"
              onClick={() => onChangeScale(Math.min(2.5, Number((selectedItemScale + 0.15).toFixed(2))))}
              title="Enlarge item"
              aria-label="Enlarge item"
            >
              ➕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
