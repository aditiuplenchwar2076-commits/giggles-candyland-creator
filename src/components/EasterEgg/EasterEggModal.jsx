import React, { useState, useRef, useEffect, useCallback } from 'react';
import { soundService } from '../../services/soundService';
import { useInteraction } from '../../services/interactionContext';
import { transformToBabyPortrait } from '../../services/babyTransformEngine';
import { createSamplePortrait } from '../../services/samplePortraits';
import './EasterEggModal.css';

export function EasterEggModal({ isOpen, onClose }) {
  const { gigglesReact, incrementHitCount } = useInteraction();

  // Steps: 'photo_setup' | 'star_sky' | 'camera_active' | 'processing' | 'photo_result'
  const [step, setStep] = useState('photo_setup');
  const [starClicked, setStarClicked] = useState(false);

  // Photos
  const [originalPhoto, setOriginalPhoto] = useState(null);
  const [babyResultPhoto, setBabyResultPhoto] = useState(null);
  const [viewMode, setViewMode] = useState('baby'); // 'baby' | 'original' | 'split'

  // Engine & Status
  const [engineMode, setEngineMode] = useState('local'); // 'local' | 'cloud'
  const [processingStatus, setProcessingStatus] = useState('Preparing magical baby-fication...');
  const [cameraError, setCameraError] = useState(null);
  const [resultMeta, setResultMeta] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      soundService.playSecret();
    } else {
      stopCamera();
    }
  }, [isOpen, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleStarClick = () => {
    setStarClicked(true);
    soundService.playChime();
    gigglesReact('easter_egg_found');
    incrementHitCount(3);
  };

  const handleProceedToMagic = () => {
    setStep('photo_setup');
  };

  // 1. File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      setOriginalPhoto(evt.target.result);
      soundService.playPop();
    };
    reader.readAsDataURL(file);
  };

  // 2. Camera Start
  const handleStartCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' },
      });
      streamRef.current = stream;
      setStep('camera_active');
      gigglesReact('camera_permission_granted');

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
      }, 100);
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Camera access unavailable on this device. You can choose a photo from your files or try a sample portrait!');
    }
  };

  // 3. Snap Camera Photo
  const handleCaptureCamera = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');

    // Draw mirrored
    ctx.translate(640, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, 640, 640);

    const dataUrl = canvas.toDataURL('image/png');
    stopCamera();
    setOriginalPhoto(dataUrl);
    setStep('photo_setup');
    soundService.playPop();
  };

  // 4. Sample Photos
  const handleUseSample = (type = 'friend') => {
    const sampleUrl = createSamplePortrait(type);
    setOriginalPhoto(sampleUrl);
    soundService.playPop();
  };

  // 5. Run Genuine Baby Transformation
  const handleTransform = async () => {
    if (!originalPhoto) return;

    setStep('processing');
    soundService.playPop();
    gigglesReact('photo_ready');

    try {
      const res = await transformToBabyPortrait(originalPhoto, {
        mode: engineMode,
        onProgress: (p) => setProcessingStatus(p.text),
      });

      if (res && res.dataUrl) {
        setBabyResultPhoto(res.dataUrl);
        setResultMeta(res);
        setStep('photo_result');
        setViewMode('baby');
        soundService.playChime();
        incrementHitCount(5);
      } else {
        throw new Error('Transformation returned empty result.');
      }
    } catch (err) {
      console.error('Baby transformation error:', err);
      alert('Could not complete transformation: ' + err.message);
      setStep('photo_setup');
    }
  };

  // 6. Download Output
  const handleDownload = (format = 'png') => {
    const src = viewMode === 'original' ? originalPhoto : babyResultPhoto;
    if (!src) return;

    const a = document.createElement('a');
    a.href = src;
    a.download = `baby_giggles_twin_${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    soundService.playChime();
  };

  const handleReset = () => {
    setOriginalPhoto(null);
    setBabyResultPhoto(null);
    setStep('photo_setup');
  };

  if (!isOpen) return null;

  return (
    <div className="easter-egg-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Baby-Me Magic Modal">
      <div className="easter-egg-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* TOP BAR */}
        <div className="modal-top-bar">
          <div className="modal-title-group">
            <span className="modal-icon" aria-hidden="true">✨</span>
            <span className="modal-header-text">
              {step === 'star_sky' ? 'Secret Midnight Discovery' : 'Baby-Me Magic Studio 📸'}
            </span>
          </div>
          <button
            type="button"
            className="modal-close-icon-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* SCENE 1: STARRY NIGHT SKY DISCOVERY */}
        {step === 'star_sky' && (
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
                  Turn your photo into an adorable chubby-cheeked baby with rosy cheeks, big sparkling eyes, and a sweet pastel smile!
                </p>
                <div className="secret-actions">
                  <button
                    type="button"
                    className="btn btn-primary magic-glow-btn"
                    onClick={handleProceedToMagic}
                  >
                    Baby-Me Magic ✨ Turn Me Into Baby Giggles!
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Maybe Later ☁️
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SCENE 2: PHOTO SETUP & PREVIEW */}
        {step === 'photo_setup' && (
          <div className="photo-setup-scene">
            <div className="setup-hero">
              <h3 className="setup-title">Baby-Me Magic 👶🏻✨</h3>
              <p className="setup-subtitle">
                Provide your portrait photograph! Our transformation engine preserves your facial resemblance, smile, and identity while morphing you into an adorable pastel baby.
              </p>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />

            {!originalPhoto ? (
              /* Selection Triggers */
              <div className="photo-picker-grid">
                <button
                  type="button"
                  className="picker-card-btn"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <span className="picker-icon">📁</span>
                  <span className="picker-title">Upload Photo</span>
                  <span className="picker-sub">Choose from your phone or PC</span>
                </button>

                <button
                  type="button"
                  className="picker-card-btn"
                  onClick={handleStartCamera}
                >
                  <span className="picker-icon">📸</span>
                  <span className="picker-title">Take Selfie</span>
                  <span className="picker-sub">Use device webcam or camera</span>
                </button>

                <div className="sample-strip">
                  <span className="sample-label">Or test with a sample:</span>
                  <div className="sample-btns-row">
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

                {cameraError && <div className="camera-err-msg">{cameraError}</div>}
              </div>
            ) : (
              /* Photo Selected & Ready */
              <div className="photo-preview-box">
                <div className="preview-frame">
                  <img src={originalPhoto} alt="Your portrait preview" className="preview-thumb" />
                  <div className="preview-overlay-badge">Ready to Baby-fy! ✨</div>
                </div>

                <div className="preview-actions-row">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  >
                    Replace Photo 🔄
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleReset}
                  >
                    Remove ✕
                  </button>
                </div>

                {/* Transformation Engine Selector */}
                <div className="engine-selector-card">
                  <div className="engine-options-row">
                    <label className={`engine-option ${engineMode === 'local' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="engine"
                        checked={engineMode === 'local'}
                        onChange={() => setEngineMode('local')}
                      />
                      <div>
                        <strong>⚡ High-Fidelity Local Morph</strong>
                        <span>Instant, private & 100% in-browser</span>
                      </div>
                    </label>

                    <label className={`engine-option ${engineMode === 'cloud' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="engine"
                        checked={engineMode === 'cloud'}
                        onChange={() => setEngineMode('cloud')}
                      />
                      <div>
                        <strong>☁️ Cloud AI Studio</strong>
                        <span>Serverless generative API</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Big Action Button */}
                <button
                  type="button"
                  className="btn btn-primary transform-launch-btn"
                  onClick={handleTransform}
                >
                  Make My Baby Portrait ✨
                </button>
              </div>
            )}

            <div className="privacy-guarantee-note">
              🔒 <strong>100% Safe & Private:</strong> Your photos are processed safely in your browser session and never sold, trained on, or stored permanently.
            </div>
          </div>
        )}

        {/* SCENE 3: LIVE CAMERA VIEW */}
        {step === 'camera_active' && (
          <div className="camera-live-scene">
            <h3 className="live-title">Smile for Baby Giggles! 👶🏻✨</h3>
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
                  setStep('photo_setup');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* SCENE 4: ANIMATED PROCESSING STATE */}
        {step === 'processing' && (
          <div className="processing-scene">
            <div className="processing-baby-badge">
              <span className="baby-spinner-icon">🍭</span>
            </div>
            <h3 className="processing-title">Transforming Into Baby Giggles...</h3>
            <p className="processing-status-text">{processingStatus}</p>

            <div className="processing-bar-track">
              <div className="processing-bar-fill" />
            </div>
            <span className="processing-hint">Mixing sprinkles, big eyes, and pastel stardust ✨</span>
          </div>
        )}

        {/* SCENE 5: BEFORE & AFTER RESULT */}
        {step === 'photo_result' && (
          <div className="photo-result-scene">
            <div className="result-header-row">
              <span className="result-badge">🎉 CERTIFIED BABY GIGGLES! 🎉</span>
              <div className="view-mode-toggle" role="tablist" aria-label="Preview mode">
                <button
                  type="button"
                  className={`view-mode-btn ${viewMode === 'baby' ? 'active' : ''}`}
                  onClick={() => setViewMode('baby')}
                >
                  👶 Baby Version
                </button>
                <button
                  type="button"
                  className={`view-mode-btn ${viewMode === 'original' ? 'active' : ''}`}
                  onClick={() => setViewMode('original')}
                >
                  Original
                </button>
              </div>
            </div>

            <div className="result-img-frame">
              <img
                src={viewMode === 'baby' ? babyResultPhoto : originalPhoto}
                alt={viewMode === 'baby' ? 'Baby Giggles Transformed Portrait' : 'Original Portrait'}
                className="result-img"
              />
              <div className="result-img-tag">
                {viewMode === 'baby' ? '✨ Baby-fied by Giggles Studio' : 'Original Photo'}
              </div>
            </div>

            <p className="result-text">
              Look at those chubby cheeks and sparkling baby eyes! 💖 Your facial resemblance is certified adorable!
            </p>

            <div className="result-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleDownload('png')}
              >
                Download PNG 💾
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleDownload('jpg')}
              >
                Download JPEG 📸
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
              >
                Try Another Photo 🔄
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
