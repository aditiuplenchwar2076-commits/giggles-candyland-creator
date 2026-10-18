import React from 'react';
import { DECORATIONS } from './candyCatalog';
import { ItemRenderer } from './ItemRenderer';

export function DecorationPanel({ activeItemId, currentColor, onSelectItem }) {
  return (
    <div className="creator-panel decoration-panel" role="region" aria-label="Garden Decoration Panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <span className="panel-emoji">✨</span>
          <h3 className="panel-title">Garden Charms</h3>
        </div>
        <span className="panel-subtitle">Stars, hearts & magic clouds</span>
      </div>

      <div className="items-grid decorations-grid" role="radiogroup" aria-label="Select a garden decoration">
        {DECORATIONS.map((deco) => {
          const isSelected = activeItemId === deco.id;
          return (
            <button
              key={deco.id}
              type="button"
              className={`item-card ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectItem(deco.id)}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${deco.name} decoration`}
            >
              <div className="item-preview">
                <ItemRenderer
                  typeId={deco.id}
                  color={isSelected ? currentColor : deco.defaultColor}
                  size={42}
                />
              </div>
              <span className="item-label">{deco.name}</span>
              {isSelected && <span className="active-dot" aria-hidden="true">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
