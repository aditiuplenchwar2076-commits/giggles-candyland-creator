import React from 'react';
import { CANDIES } from './candyCatalog';
import { ItemRenderer } from './ItemRenderer';

export function CandySelectionPanel({ activeItemId, currentColor, onSelectItem }) {
  return (
    <div className="creator-panel candy-panel" role="region" aria-label="Candy Selection Tray">
      <div className="panel-header">
        <div className="panel-title-group">
          <span className="panel-emoji">🍭</span>
          <h3 className="panel-title">Candy Tray</h3>
        </div>
        <span className="panel-subtitle">Pick a sweet treat to plant</span>
      </div>

      <div className="items-grid" role="radiogroup" aria-label="Select a candy to add">
        {CANDIES.map((candy) => {
          const isSelected = activeItemId === candy.id;
          return (
            <button
              key={candy.id}
              type="button"
              className={`item-card ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectItem(candy.id)}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${candy.name} candy`}
            >
              <div className="item-preview">
                <ItemRenderer
                  typeId={candy.id}
                  color={isSelected ? currentColor : candy.defaultColor}
                  size={46}
                />
              </div>
              <span className="item-label">{candy.name}</span>
              {isSelected && <span className="active-dot" aria-hidden="true">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
