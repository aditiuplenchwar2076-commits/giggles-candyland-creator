import React, { useState, useRef, useEffect, useCallback } from 'react';
import { soundService } from '../../services/soundService';
import { useInteraction } from '../../services/interactionContext';
import './EasterEggModal.css';

export function EasterEggModal({ isOpen, onClose }) {
  const { gigglesReact, incrementHitCount } = useInteraction();

  const [step, setStep] = useState('star_sky'); // 'star_sky' | 'camera_consent' | 'camera_active' | 'photo_result'
  const [starClicked, setStarClicked] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Play mystical secret chime when opened
  useEffect(() => {
    if (isOpen) {
      soundService.playSecret();
    } else {
      stopCamera();
    }
  }, [isOpen, stopCamera]);

  // Clean up camera stream on unmount
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

  const handleProceedToConsent = () => {
    setStep('camera_consent');
  };

  const handleStartCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      streamRef.current = stream;
      setStep('camera_active');
      gigglesReact('camera_permission_granted');

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Camera access was not granted or is unavailable on this device. You can try our offline photo transformation mode below!');
      setStep('camera_consent');
    }
  };

  const handleCapturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    // Draw live video frame (mirrored)
    ctx.translate(640, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, 640, 480);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Apply Giggles Cute Transformation Overlays:
    // 1. Rosy Cheeks
    ctx.fillStyle = 'rgba(255, 110, 167, 0.45)';
    ctx.beginPath();
    ctx.arc(240, 260, 36, 0, Math.PI * 2);
    ctx.arc(400, 260, 36, 0, Math.PI * 2);
    ctx.fill();

    // 2. Golden Hair Curl
    ctx.strokeStyle = '#F9C74F';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(320, 110, 24, 0.4 * Math.PI, 1.8 * Math.PI);
    ctx.stroke();

    // 3. Giant Lollipop Sticker in Corner
    const lolliImg = new Image();
    lolliImg.src = '/images/giggles_main.png';
    lolliImg.onload = () => {
      ctx.drawImage(lolliImg, 420, 260, 200, 200);
      const finalData = canvas.toDataURL('image/png');
      setPhotoDataUrl(finalData);
      setStep('photo_result');
      stopCamera();
      gigglesReact('photo_ready');
      incrementHitCount(5);
    };

    // Fallback if image load delays
    setTimeout(() => {
      if (!photoDataUrl) {
        const finalData = canvas.toDataURL('image/png');
        setPhotoDataUrl(finalData);
        setStep('photo_result');
        stopCamera();
      }
    }, 250);
  };

  const handleFallbackAvatar = () => {
    // Generate adorable local avatar without camera
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');

    // Pastel gradient background
    const grad = ctx.createLinearGradient(0, 0, 500, 500);
    grad.addColorStop(0, '#FFE0EC');
    grad.addColorStop(1, '#E2D3FC');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 500, 500);

    // Baby cloud
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(250, 380, 160, 0, Math.PI * 2);
    ctx.fill();

    // Main sprite
    const img = new Image();
    img.src = '/images/giggles_main.png';
    img.onload = () => {
      ctx.drawImage(img, 60, 90, 380, 320);
      ctx.fillStyle = '#D81B60';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("CERTIFIED GIGGLES TWIN 🍭", 250, 440);
      setPhotoDataUrl(canvas.toDataURL('image/png'));
      setStep('photo_result');
      gigglesReact('photo_ready');
    };
  };

  const handleDownload = () => {
    if (!photoDataUrl) return;
    const a = document.createElement('a');
    a.href = photoDataUrl;
    a.download = `giggles_twin_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    soundService.playChime();
  };

  if (!isOpen) return null;

  return (
    <div className="easter-egg-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="easter-egg-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Step 1: Starry Night Discovery */}
        {step === 'star_sky' && (
          <div className="starry-sky-scene">
            <div className="starry-sky-header">
              <span className="sky-tag">✨ Secret Midnight Discovery</span>
              <button type="button" className="close-sky-btn" onClick={onClose}>✕</button>
            </div>

            <p className="sky-hint-text">
              You noticed the secret glowing star! Tap the shimmering golden star in the center to reveal its mystery.
            </p>

            <div className="sky-canvas-arena">
              {/* Twinkling ambient stars */}
              <div className="ambient-star s1">✦</div>
              <div className="ambient-star s2">★</div>
              <div className="ambient-star s3">✦</div>
              <div className="ambient-star s4">★</div>
              <div className="ambient-star s5">✦</div>

              {/* The Discovery Star */}
              <button
                type="button"
                className={`secret-golden-star ${starClicked ? 'opened' : ''}`}
                onClick={handleStarClick}
                aria-label="Click the secret glowing star"
              >
                ⭐
              </button>
            </div>

            {/* Revealed Message */}
            {starClicked && (
              <div className="star-secret-card">
                <span className="secret-dialog-quote">
                  "Psst... want to see what your version of Giggles looks like?"
                </span>
                <p className="secret-dialog-sub">
                  Become Giggles' twin! We can add rosy cheeks, golden curls, and a swirl lollipop to your photo!
                </p>
                <div className="secret-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleProceedToConsent}
                  >
                    Yes! Show Me! 📸✨
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Maybe Later ☁️
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Camera Privacy & Consent */}
        {step === 'camera_consent' && (
          <div className="consent-scene">
            <div className="consent-icon">📸🔒</div>
            <h3 className="consent-title">Privacy First, Pure Fun!</h3>
            <div className="consent-box">
              <p>
                <strong>How it works:</strong> Your browser will turn on your webcam locally for a quick snapshot.
              </p>
              <ul>
                <li>✓ <strong>100% Local:</strong> Your photo is never sent to any server or AI company.</li>
                <li>✓ <strong>Zero Storage:</strong> The image stays in your device memory only.</li>
                <li>✓ <strong>Instant Release:</strong> The camera turns completely off immediately after capture.</li>
              </ul>
            </div>

            {cameraError && <div className="camera-err-msg">{cameraError}</div>}

            <div className="consent-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStartCamera}
              >
                Allow Camera & Take Photo 📸
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleFallbackAvatar}
              >
                Generate Twin Avatar (No Camera) 🎨
              </button>
              <button type="button" className="btn btn-link" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Camera Live View */}
        {step === 'camera_active' && (
          <div className="camera-live-scene">
            <h3 className="live-title">Smile for Giggles! 👶🏻✨</h3>
            <div className="video-viewport">
              <video ref={videoRef} autoPlay playsInline muted className="live-video" />
              {/* Overlay preview guides */}
              <div className="cheek-guide left" />
              <div className="cheek-guide right" />
              <div className="curl-guide">🌀</div>
            </div>
            <div className="live-actions">
              <button
                type="button"
                className="btn btn-primary btn-snap"
                onClick={handleCapturePhoto}
              >
                📸 Snap Photo!
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Photo Result & Download */}
        {step === 'photo_result' && (
          <div className="photo-result-scene">
            <span className="result-badge">🎉 CERTIFIED GIGGLES TWIN! 🎉</span>
            <div className="result-img-frame">
              <img src={photoDataUrl} alt="Transformed Giggles Twin" className="result-img" />
            </div>
            <p className="result-text">
              Look at you with Giggles' rosy cheeks, golden curl, and swirl lollipop! Certified cutie! 💖
            </p>
            <div className="result-actions">
              <button type="button" className="btn btn-primary" onClick={handleDownload}>
                📥 Download Twin Photo
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setStep('camera_consent')}>
                Take Another 🔄
              </button>
              <button type="button" className="btn btn-link" onClick={onClose}>
                Done ✨
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
