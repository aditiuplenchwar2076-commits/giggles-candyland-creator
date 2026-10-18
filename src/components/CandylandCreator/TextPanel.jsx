import React from 'react';
import { COLOR_PALETTE } from './candyCatalog';

const FONT_OPTIONS = [
  { id: 'Fredoka', label: 'Bubble Rounded', family: "'Fredoka', system-ui, sans-serif" },
  { id: 'Comic Sans MS', label: 'Playful Hand', family: "'Comic Sans MS', 'Fredoka', cursive, sans-serif" },
  { id: 'Nunito', label: 'Soft Pastel', family: "'Nunito', system-ui, sans-serif" },
];

export function TextPanel({
  selectedTextItem,
  onAddText,
  onUpdateText,
  currentColor,
  onSelectColor,
}) {
  const [textInput, setTextInput] = React.useState('Sweet Candy Magic ✨');
  const [fontSize, setFontSize] = React.useState(26);
  const [fontFamily, setFontFamily] = React.useState('Fredoka');

  // When a text item is selected on canvas, load its properties into the editor
  React.useEffect(() => {
    if (selectedTextItem) {
      setTextInput(selectedTextItem.text || '');
      setFontSize(selectedTextItem.fontSize || 26);
      if (selectedTextItem.font) setFontFamily(selectedTextItem.font);
    }
  }, [selectedTextItem]);

  const handleApplyText = () => {
    if (selectedTextItem) {
      onUpdateText(selectedTextItem.uid, {
        text: textInput,
        fontSize,
        font: fontFamily,
        color: currentColor,
      });
    } else {
      onAddText({
        text: textInput,
        fontSize,
        font: fontFamily,
        color: currentColor,
      });
    }
  };

  return (
    <div className="creator-panel text-panel" role="region" aria-label="Text Customization Panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <span className="panel-emoji">✏️</span>
          <h3 className="panel-title">
            {selectedTextItem ? 'Edit Selected Text' : 'Magic Text Tool'}
          </h3>
        </div>
        <span className="panel-subtitle">
          {selectedTextItem ? 'Editing placed words' : 'Add custom words to your candy garden'}
        </span>
      </div>

      <div className="text-panel-body">
        {/* Text Input Field */}
        <div className="text-input-group">
          <label htmlFor="candy-text-input" className="text-input-label">
            Your Sweet Words:
          </label>
          <input
            id="candy-text-input"
            type="text"
            value={textInput}
            onChange={(e) => {
              setTextInput(e.target.value);
              if (selectedTextItem) {
                onUpdateText(selectedTextItem.uid, { text: e.target.value });
              }
            }}
            placeholder="Type a sweet message..."
            maxLength={40}
            className="candy-text-input-box"
          />
        </div>

        {/* Font Style Selection */}
        <div className="font-choice-group">
          <label className="text-input-label">Font Style:</label>
          <div className="font-options-row">
            {FONT_OPTIONS.map((font) => (
              <button
                key={font.id}
                type="button"
                className={`font-opt-btn ${fontFamily === font.id ? 'active' : ''}`}
                style={{ fontFamily: font.family }}
                onClick={() => {
                  setFontFamily(font.id);
                  if (selectedTextItem) {
                    onUpdateText(selectedTextItem.uid, { font: font.id });
                  }
                }}
              >
                {font.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size Slider */}
        <div className="font-size-group">
          <div className="size-label-row">
            <span className="text-input-label">Size:</span>
            <span className="size-val-badge">{fontSize}px</span>
          </div>
          <input
            type="range"
            min="16"
            max="52"
            step="2"
            value={fontSize}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setFontSize(val);
              if (selectedTextItem) {
                onUpdateText(selectedTextItem.uid, { fontSize: val });
              }
            }}
            className="size-slider-control"
            aria-label="Text font size"
          />
        </div>

        {/* Preview & Action Button */}
        <div className="text-action-row">
          <div
            className="text-preview-pill"
            style={{
              color: currentColor,
              fontFamily: FONT_OPTIONS.find((f) => f.id === fontFamily)?.family,
              fontSize: `${Math.min(fontSize, 28)}px`,
            }}
          >
            {textInput || '(Type something sweet!)'}
          </div>

          <button
            type="button"
            className="btn btn-primary btn-add-text"
            onClick={handleApplyText}
          >
            <span>{selectedTextItem ? '✓ Update Text' : '🌱 Plant Text in Garden'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
