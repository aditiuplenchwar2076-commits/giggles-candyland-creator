import React, { useState, useRef, useEffect, useCallback } from 'react';
import { soundService } from '../../services/soundService';
import { useInteraction } from '../../services/interactionContext';
import {
  transformToBabyPortrait,
  getStoredGeminiKey,
  storeGeminiKey,
} from '../../services/babyTransformEngine';
import { createSamplePortrait } from '../../services/samplePortraits';
import './EasterEggModal.css';

const LOADING_TIPS = [
  'Giggles is making your cheeks extra squishy... 👶🏻✨',
  'Removing all stubble and facial hair completely...',
  'Enlarging sparkling baby eyes with rosy cheek blush...',
  'Sculpting tiny cute baby lips and round forehead...',
  'Tucking you into the sweet pastel Candyland clouds...',
];

export function EasterEggModal({ isOpen, onClose }) {
  const { gigglesReact, incrementHitCount } = useInteraction();

  // Mode: 'magic_studio' | 'star_sky' | 'camera_active'
  const [activeView, setActiveView] = useState('magic_studio');
  const [starClicked, setStarClicked] = useState(false);

  // Gemini API Key State
  const [geminiApiKey, setGeminiApiKey] = useState(() => getStoredGeminiKey());
  const [apiKeyInput, setApiKeyInput] = useState(() => getStoredGeminiKey());
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keySavedToast, setKeySavedToast] = useState(false);

  // Photos
  const [originalPhoto, setOriginalPhoto] = useState(null);
  const [babyResultPhoto, setBabyResultPhoto] = useState(null);
  const [photoMeta, setPhotoMeta] = useState(null);

  // Status & Error
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingTipIndex, setLoadingTipIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [resultProvider, setResultProvider] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const tipTimerRef = useRef(null);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      if (tipTimerRef.current) clearInterval(tipTimerRef.current);
    } else {
      soundService.playSecret();
    }
  }, [isOpen, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (tipTimerRef.current) clearInterval(tipTimerRef.current);
    };
  }, [stopCamera]);

  // Rotate loading tips during generation
  useEffect(() => {
    if (isGenerating) {
      setLoadingTipIndex(0);
      tipTimerRef.current = setInterval(() => {
        setLoadingTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
      }, 2200);
    } else {
      if (tipTimerRef.current) clearInterval(tipTimerRef.current);
    }
    return () => {
      if (tipTimerRef.current) clearInterval(tipTimerRef.current);
    };
  }, [isGenerating]);

  // 1. File Upload & Validation
  const handleFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Reset errors and result
    setErrorMessage(null);
    setErrorCode(null);
    setBabyResultPhoto(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase()) && !file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, or WEBP).');
      return;
    }

    // Validate size (max 6MB)
    const maxBytes = 6 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMessage(`Selected image is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a photo under 6MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target.result;
      setOriginalPhoto(dataUrl);
      setPhotoMeta({
        name: file.name,
        sizeKb: Math.round(file.size / 1024),
        type: file.type,
      });
      soundService.playPop();
      gigglesReact('photo_ready');
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the selected image file. Please try another photo.');
    };
    reader.readAsDataURL(file);
  };

  // 2. Camera Controls
  const handleStartCamera = async () => {
    try {
      setCameraError(null);
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' },
      });
      streamRef.current = stream;
      setActiveView('camera_active');
      gigglesReact('camera_permission_granted');

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
      }, 100);
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access unavailable on this device. Please use the file upload or choose a sample portrait!');
    }
  };

  const handleCaptureCamera = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');

    // Draw mirrored selfie
    ctx.translate(640, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, 640, 640);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    stopCamera();
    setOriginalPhoto(dataUrl);
    setPhotoMeta({ name: 'webcam_selfie.jpg', sizeKb: 120, type: 'image/jpeg' });
    setBabyResultPhoto(null);
    setErrorMessage(null);
    setActiveView('magic_studio');
    soundService.playPop();
  };

  // 3. Built-In Sample Test Portraits
  const handleUseSample = (type = 'friend') => {
    setErrorMessage(null);
    setErrorCode(null);
    setBabyResultPhoto(null);
    const sampleUrl = createSamplePortrait(type);
    setOriginalPhoto(sampleUrl);
    setPhotoMeta({
      name: type === 'friend' ? 'sample_portrait_1.png' : 'sample_portrait_2.png',
      sizeKb: 85,
      type: 'image/png',
    });
    soundService.playPop();
  };

  // 4. Gemini API Key Handler
  const handleSaveApiKey = (e) => {
    e?.preventDefault();
    storeGeminiKey(apiKeyInput);
    setGeminiApiKey(apiKeyInput.trim());
    setKeySavedToast(true);
    setTimeout(() => setKeySavedToast(false), 2500);
    if (errorMessage && errorCode === 'MISSING_API_KEY') {
      setErrorMessage(null);
      setErrorCode(null);
    }
  };

  // 5. Trigger Real AI Transformation
  const handleMakeMeABaby = async () => {
    if (!originalPhoto || isGenerating) return;

    setIsGenerating(true);
    setErrorMessage(null);
    setErrorCode(null);
    soundService.playPop();
    gigglesReact('photo_ready');

    try {
      const result = await transformToBabyPortrait(originalPhoto, {
        apiKey: geminiApiKey,
      });

      if (result && result.dataUrl) {
        setBabyResultPhoto(result.dataUrl);
        setResultProvider(result.provider);
        soundService.playChime();
        incrementHitCount(5);
        gigglesReact('target_hit');
      } else {
        throw new Error('AI studio responded with an empty image payload.');
      }
    } catch (err) {
      console.error('Baby transformation failed:', err);
      setErrorMessage(err.message || 'Transformation failed. Please try again.');
      setErrorCode(err.code || 'UNKNOWN_ERROR');
      if (err.code === 'MISSING_API_KEY') {
        setShowKeyInput(true);
      }
      soundService.playStretch(0.3);
    } finally {
      setIsGenerating(false);
    }
  };

  // 5. Download Output
  const handleDownload = (format = 'png') => {
    if (!babyResultPhoto) return;

    const a = document.createElement('a');
    a.href = babyResultPhoto;
    a.download = `baby_giggles_ai_${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    soundService.playChime();
  };

  // 6. Reset to upload another photo
  const handleReset = () => {
    setOriginalPhoto(null);
    setBabyResultPhoto(null);
    setPhotoMeta(null);
    setErrorMessage(null);
    setErrorCode(null);
    setIsGenerating(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 7. Secret Star Click
  const handleStarClick = () => {
    setStarClicked(true);
    soundService.playChime();
    gigglesReact('easter_egg_found');
    incrementHitCount(3);
  };

  if (!isOpen) return null;

  return (
    <div
      className="easter-egg-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="magic-modal-title"
    >
      <div className="easter-egg-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* TOP BAR */}
        <div className="modal-top-bar">
          <div className="modal-title-group">
            <span className="modal-icon" aria-hidden="true">🪄</span>
            <span className="modal-header-text">
              {activeView === 'star_sky'
                ? 'Secret Midnight Discovery 🌟'
                : 'Turn Yourself Into a Tiny Baby! 👶🏻✨'}
            </span>
          </div>

          <div className="modal-top-actions">
            {activeView === 'magic_studio' ? (
              <button
                type="button"
                className="btn-link-star"
                onClick={() => setActiveView('star_sky')}
                title="Visit Secret Star Sky"
              >
                ⭐ Secret Star Sky
              </button>
            ) : (
              <button
                type="button"
                className="btn-link-star"
                onClick={() => setActiveView('magic_studio')}
              >
                📸 Back to Photo Studio
              </button>
            )}
            <button
              type="button"
              className="modal-close-icon-btn"
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* HIDDEN FILE INPUT */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        {/* SCENE A: MAIN TRANSFORMATION STUDIO */}
        {activeView === 'magic_studio' && (
          <div className="magic-studio-body">
            {/* Header description */}
            <div className="studio-header">
              <h2 id="magic-modal-title" className="studio-title">
                Turn Yourself Into a Tiny Baby! 👶🏻✨
              </h2>
              <p className="studio-subtitle">
                Upload your photograph to create an adorable, chubby-cheeked baby version of you in
                Giggles' Candyland! Huge sparkling eyes, round rosy cheeks, and baby proportions.
              </p>
            </div>

            {/* Google Gemini API Key Bar */}
            <div className="gemini-key-toolbar">
              <div className="gemini-key-status">
                <span className="gemini-badge">✨ Google Gemini AI</span>
                {geminiApiKey ? (
                  <span className="key-active-label">
                    <span className="key-active-dot" /> Connected (••••{geminiApiKey.slice(-4)})
                  </span>
                ) : (
                  <span className="key-hint-label">Free API Key Supported</span>
                )}
              </div>
              <button
                type="button"
                className="btn-toggle-key-input"
                onClick={() => setShowKeyInput((prev) => !prev)}
              >
                {showKeyInput ? 'Hide Key Settings ▲' : geminiApiKey ? 'Change Key ⚙️' : '🔑 Enter Free API Key ▼'}
              </button>
            </div>

            {/* Expandable Key Configuration Card */}
            {showKeyInput && (
              <div className="gemini-key-card">
                <div className="key-card-header">
                  <span className="key-card-title">🔑 Google Gemini API Configuration</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="key-get-link"
                  >
                    Get Free Key at Google AI Studio ↗
                  </a>
                </div>
                <div className="key-input-row">
                  <input
                    type="password"
                    className="gemini-key-input"
                    placeholder="Paste your Gemini API key (AIzaSy...)"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                  />
                  <button type="button" className="btn-save-key" onClick={handleSaveApiKey}>
                    {keySavedToast ? '✅ Saved!' : 'Save Key'}
                  </button>
                </div>
                <p className="key-card-note">
                  Your key is stored securely in your browser's local storage and used directly for baby transformations.
                  You can also set <code>GEMINI_API_KEY</code> in <code>.env.local</code>.
                </p>
              </div>
            )}

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="studio-error-banner" role="alert">
                <span className="err-icon">⚠️</span>
                <div className="err-content">
                  <strong>
                    {errorCode === 'MISSING_API_KEY'
                      ? 'Google Gemini API Key Required'
                      : 'Transformation Notice'}
                  </strong>
                  <p>{errorMessage}</p>
                  {errorCode === 'MISSING_API_KEY' && (
                    <div className="err-env-hint">
                      💡 <em>Quick setup:</em> Get a free key at{' '}
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#ec4899', fontWeight: 'bold' }}
                      >
                        Google AI Studio
                      </a>{' '}
                      and paste it into the box above, or add <code>GEMINI_API_KEY</code> to{' '}
                      <code>.env.local</code>.
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="err-dismiss-btn"
                  onClick={() => setErrorMessage(null)}
                >
                  ✕
                </button>
              </div>
            )}

            {/* MAIN TWO-PANEL WORKSPACE (Side-by-side desktop, stacked mobile) */}
            <div className="studio-workspace-grid">
              {/* PANEL 1: ORIGINAL PHOTO PANEL */}
              <div className="panel-card original-panel">
                <div className="panel-header">
                  <span className="panel-badge">📸 1. Original Photo</span>
                  {originalPhoto && (
                    <button
                      type="button"
                      className="panel-header-action"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      disabled={isGenerating}
                    >
                      🔄 Replace
                    </button>
                  )}
                </div>

                {!originalPhoto ? (
                  /* Empty state: Upload Trigger / Dropzone */
                  <div className="upload-dropzone-box">
                    <button
                      type="button"
                      className="upload-dropzone-card"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      aria-label="Upload photo from device"
                    >
                      <div className="upload-icon-circle">
                        <span className="upload-icon">📁</span>
                      </div>
                      <span className="upload-primary-text">Upload Your Photo</span>
                      <span className="upload-secondary-text">
                        JPEG, PNG, or WEBP (Max 6MB)
                      </span>
                    </button>

                    <div className="alternative-input-row">
                      <button
                        type="button"
                        className="alt-input-btn"
                        onClick={handleStartCamera}
                      >
                        📸 Take Selfie
                      </button>
                    </div>

                    {cameraError && (
                      <div className="camera-err-msg">{cameraError}</div>
                    )}

                    {/* Sample Portrait Chips */}
                    <div className="sample-portrait-section">
                      <span className="sample-section-label">Or test with a sample:</span>
                      <div className="sample-chip-row">
                        <button
                          type="button"
                          className="sample-chip"
                          onClick={() => handleUseSample('friend')}
                        >
                          👤 Sample Portrait 1
                        </button>
                        <button
                          type="button"
                          className="sample-chip"
                          onClick={() => handleUseSample('stargazer')}
                        >
                          🌟 Sample Portrait 2
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Photo Loaded: Preview Display */
                  <div className="photo-loaded-content">
                    <div className="loaded-photo-frame">
                      <img
                        src={originalPhoto}
                        alt="Your uploaded portrait"
                        className="loaded-photo-img"
                      />
                      <div className="loaded-badge-tag">Original Portrait</div>
                    </div>

                    <div className="photo-info-bar">
                      <span className="photo-name-tag">
                        {photoMeta ? photoMeta.name : 'portrait.jpg'}
                      </span>
                      <button
                        type="button"
                        className="btn-remove-photo"
                        onClick={handleReset}
                        disabled={isGenerating}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* PANEL 2: BABY RESULT PANEL */}
              <div className="panel-card baby-result-panel">
                <div className="panel-header">
                  <span className="panel-badge baby-badge">
                    👶 2. Baby Transformation
                  </span>
                  {babyResultPhoto && (
                    <span className="certified-badge">✨ Certified Adorable</span>
                  )}
                </div>

                <div className="result-workspace-content">
                  {/* State 1: Generating / Loading */}
                  {isGenerating ? (
                    <div className="generation-loading-state" role="status" aria-live="polite">
                      <div className="pulsing-baby-circle">
                        <span className="loading-emoji">🍭</span>
                      </div>
                      <h4 className="loading-heading">
                        {LOADING_TIPS[loadingTipIndex]}
                      </h4>
                      <div className="loading-track">
                        <div className="loading-fill-bar" />
                      </div>
                      <p className="loading-subtext">
                        Calling AI model with identity preservation & squishy cheek enhancement...
                      </p>
                    </div>
                  ) : babyResultPhoto ? (
                    /* State 2: Generation Completed */
                    <div className="generation-success-state">
                      <div className="baby-result-frame">
                        <img
                          src={babyResultPhoto}
                          alt="AI-generated adorable baby version"
                          className="baby-result-img"
                        />
                        <div className="baby-frame-badge">✨ Baby-fied by Giggles</div>
                      </div>

                      <p className="baby-success-text">
                        Look at those enormous sparkling eyes and chubby rosy cheeks! 💕
                      </p>

                      <div className="download-actions-grid">
                        <button
                          type="button"
                          className="btn btn-primary btn-download"
                          onClick={() => handleDownload('png')}
                        >
                          💾 Download PNG
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-download"
                          onClick={() => handleDownload('jpg')}
                        >
                          📸 Download JPEG
                        </button>
                      </div>

                      <button
                        type="button"
                        className="btn-transform-another"
                        onClick={handleReset}
                      >
                        🪄 Transform Another Photo
                      </button>
                    </div>
                  ) : (
                    /* State 3: Waiting / Ready to Generate */
                    <div className="generation-ready-placeholder">
                      <div className="placeholder-art">
                        <span className="placeholder-baby-icon">👶🏻✨</span>
                      </div>
                      <h4 className="placeholder-title">
                        {originalPhoto
                          ? 'Ready for Baby Magic!'
                          : 'Your Baby Version Awaits!'}
                      </h4>
                      <p className="placeholder-desc">
                        {originalPhoto
                          ? 'Click the wand below to turn your photo into an irresistibly cute, chubby baby!'
                          : 'Select a photo on the left to begin your magical Candyland transformation.'}
                      </p>

                      <button
                        type="button"
                        className="btn btn-primary make-baby-btn"
                        disabled={!originalPhoto || isGenerating}
                        onClick={handleMakeMeABaby}
                      >
                        🪄 Make Me a Baby!
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Footer Note */}
            <div className="studio-privacy-footer">
              🔒 <strong>100% Safe &amp; Private:</strong> Your photographs are processed
              securely for transformation and are never sold, permanently stored, or used for
              training.
            </div>
          </div>
        )}

        {/* SCENE B: LIVE CAMERA VIEW */}
        {activeView === 'camera_active' && (
          <div className="camera-live-scene">
            <h3 className="live-title">Smile for Baby Giggles! 👶🏻✨</h3>
            <p className="live-subtitle">Position your face in the oval and tap Snap Photo!</p>

            <div className="video-viewport">
              <video ref={videoRef} autoPlay playsInline muted className="live-video" />
              <div className="face-oval-guide" />
              <div className="curl-guide">🌀</div>
            </div>

            <div className="live-actions">
              <button
                type="button"
                className="btn btn-primary btn-snap"
                onClick={handleCaptureCamera}
              >
                📸 Snap Photo!
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  stopCamera();
                  setActiveView('magic_studio');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* SCENE C: SECRET STARRY SKY DISCOVERY */}
        {activeView === 'star_sky' && (
          <div className="starry-sky-scene">
            <p className="sky-hint-text">
              You noticed the secret glowing star! Tap the shimmering star to unlock its mystery.
            </p>

            <div className="sky-canvas-arena">
              <div className="ambient-star s1">✦</div>
              <div className="ambient-star s2">★</div>
              <div className="ambient-star s3">✦</div>
              <div className="ambient-star s4">★</div>
              <div className="ambient-star s5">✦</div>

              <button
                type="button"
                className={`secret-golden-star ${starClicked ? 'opened' : ''}`}
                onClick={handleStarClick}
                aria-label="Click secret glowing star"
              >
                ⭐
              </button>
            </div>

            {starClicked && (
              <div className="star-secret-card">
                <span className="secret-dialog-quote">
                  "Psst... Want to see what your adorable baby self looks like?!"
                </span>
                <p className="secret-dialog-sub">
                  Turn your photo into an adorable chubby-cheeked baby with rosy cheeks, big sparkling
                  eyes, and a sweet pastel smile!
                </p>
                <div className="secret-actions">
                  <button
                    type="button"
                    className="btn btn-primary magic-glow-btn"
                    onClick={() => setActiveView('magic_studio')}
                  >
                    🪄 Turn Me Into Baby Giggles!
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setActiveView('magic_studio')}
                  >
                    Close Sky ☁️
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
