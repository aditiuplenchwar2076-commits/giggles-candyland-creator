import React from 'react';
import { COLOR_PALETTE } from './candyCatalog';

export function ColorPalettePanel({ currentColor, onSelectColor, selectedItem }) {
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
            : 'Color for next candy or charm'}
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
    </div>
  );
}
