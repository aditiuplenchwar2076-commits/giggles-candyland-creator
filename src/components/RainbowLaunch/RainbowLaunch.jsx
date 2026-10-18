import React, { useRef, useEffect, useState, useCallback } from 'react';
import { soundService } from '../../services/soundService';
import { useInteraction } from '../../services/interactionContext';
import './RainbowLaunch.css';

const LEVELS = [
  {
    level: 1,
    title: 'Level 1: Meadow Target Practice',
    description: 'Straight shot! Pull back the candy slingshot and hit the unicorn piñata.',
    pinataPos: { x: 620, y: 260 },
    obstacles: [],
    movingPinata: false,
  },
  {
    level: 2,
    title: 'Level 2: Cotton Candy Clouds',
    description: 'A fluffy cloud obstacle is floating in the way! Arc your candy high or bounce it!',
    pinataPos: { x: 680, y: 280 },
    obstacles: [{ x: 380, y: 220, w: 90, h: 50, type: 'cloud' }],
    movingPinata: false,
  },
  {
    level: 3,
    title: 'Level 3: The Flying Piñata Party',
    description: 'The unicorn is floating and dodging! Use the jelly bounce pad on the ground!',
    pinataPos: { x: 650, y: 200 },
    obstacles: [
      { x: 360, y: 160, w: 70, h: 40, type: 'cloud' },
      { x: 480, y: 390, w: 90, h: 25, type: 'trampoline' },
    ],
    movingPinata: true,
  },
];

export function RainbowLaunch() {
  const { gigglesReact, incrementHitCount } = useInteraction();
  const canvasRef = useRef(null);

  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [shotsLeft, setShotsLeft] = useState(5);
  const [gameState, setGameState] = useState('aiming'); // 'aiming' | 'flying' | 'level_won' | 'level_lost'
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('giggles_slingshot_hi') || '0', 10);
  });

  const levelConfig = LEVELS[currentLevelIndex];

  // Slingshot anchor in canvas coordinates (viewBox 800 x 480)
  const anchor = { x: 140, y: 320 };
  const maxPull = 80;

  // Game physics state refs to avoid state lag during 60fps render
  const physicsRef = useRef({
    isPulling: false,
    dragPos: { x: 140, y: 320 },
    ballPos: { x: 140, y: 320 },
    ballVel: { x: 0, y: 0 },
    isBallActive: false,
    pinataOffset: 0,
    particles: [],
    levelWon: false,
  });

  // Start Level
  const initLevel = useCallback((lvlIndex) => {
    setCurrentLevelIndex(lvlIndex);
    setShotsLeft(5);
    setGameState('aiming');
    physicsRef.current = {
      isPulling: false,
      dragPos: { x: anchor.x, y: anchor.y },
      ballPos: { x: anchor.x, y: anchor.y },
      ballVel: { x: 0, y: 0 },
      isBallActive: false,
      pinataOffset: 0,
      particles: [],
      levelWon: false,
    };
    gigglesReact('game_started');
  }, [anchor.x, anchor.y, gigglesReact]);

  // Main Canvas Render & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const render = () => {
      const state = physicsRef.current;
      ctx.clearRect(0, 0, 800, 480);

      // --- Background & Scenery ---
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 480);
      skyGrad.addColorStop(0, '#E8F5FE');
      skyGrad.addColorStop(0.5, '#FCE8F3');
      skyGrad.addColorStop(1, '#FFE8D6');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 800, 480);

      // Hills
      ctx.fillStyle = '#C8F1E4';
      ctx.beginPath();
      ctx.arc(400, 680, 440, 0, Math.PI * 2);
      ctx.fill();

      // Slingshot Post (Left Fork & Right Fork)
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#D4A373';
      ctx.lineCap = 'round';
      // Main wood base
      ctx.beginPath();
      ctx.moveTo(anchor.x, anchor.y + 70);
      ctx.lineTo(anchor.x, anchor.y + 15);
      ctx.stroke();
      // Left fork
      ctx.beginPath();
      ctx.moveTo(anchor.x, anchor.y + 15);
      ctx.lineTo(anchor.x - 18, anchor.y - 20);
      ctx.stroke();
      // Right fork
      ctx.beginPath();
      ctx.moveTo(anchor.x, anchor.y + 15);
      ctx.lineTo(anchor.x + 18, anchor.y - 20);
      ctx.stroke();

      // Slingshot Elastic Bands
      const ballDrawPos = state.isBallActive ? state.ballPos : state.dragPos;

      ctx.lineWidth = 4;
      ctx.strokeStyle = '#FF6EA7';
      ctx.beginPath();
      ctx.moveTo(anchor.x - 18, anchor.y - 20);
      ctx.lineTo(ballDrawPos.x, ballDrawPos.y);
      ctx.stroke();

      // Trajectory Prediction Line (when pulling)
      if (state.isPulling) {
        ctx.strokeStyle = 'rgba(216, 27, 96, 0.45)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        let simX = anchor.x;
        let simY = anchor.y;
        let simVx = (anchor.x - state.dragPos.x) * 0.22;
        let simVy = (anchor.y - state.dragPos.y) * 0.22;

        for (let i = 0; i < 18; i++) {
          simX += simVx;
          simY += simVy;
          simVy += 0.45; // gravity
          if (i === 0) ctx.moveTo(simX, simY);
          else ctx.lineTo(simX, simY);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // --- Obstacles ---
      levelConfig.obstacles.forEach((obs) => {
        if (obs.type === 'cloud') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.beginPath();
          ctx.roundRect(obs.x, obs.y, obs.w, obs.h, 20);
          ctx.fill();
          ctx.strokeStyle = '#DCCBFA';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Cute cloud eyes
          ctx.fillStyle = '#6A1B9A';
          ctx.beginPath();
          ctx.arc(obs.x + 28, obs.y + 22, 2.5, 0, Math.PI * 2);
          ctx.arc(obs.x + 48, obs.y + 22, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (obs.type === 'trampoline') {
          ctx.fillStyle = '#FF9EAA';
          ctx.beginPath();
          ctx.roundRect(obs.x, obs.y, obs.w, obs.h, 8);
          ctx.fill();
          ctx.strokeStyle = '#D81B60';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#FFF';
          ctx.font = '10px sans-serif';
          ctx.fillText('BOUNCE!', obs.x + 18, obs.y + 16);
        }
      });

      // --- Unicorn Piñata Target ---
      if (levelConfig.movingPinata) {
        state.pinataOffset = Math.sin(Date.now() * 0.003) * 45;
      } else {
        state.pinataOffset = 0;
      }

      const pX = levelConfig.pinataPos.x;
      const pY = levelConfig.pinataPos.y + state.pinataOffset;

      // Hanging string
      ctx.strokeStyle = '#B388FF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pX, 0);
      ctx.lineTo(pX, pY - 30);
      ctx.stroke();

      // Piñata Body (Cute Unicorn Vector)
      ctx.save();
      ctx.translate(pX, pY);

      // Body (Striped pastel rectangle)
      ctx.fillStyle = '#FFC1D9';
      ctx.beginPath();
      ctx.roundRect(-28, -20, 56, 40, 14);
      ctx.fill();
      ctx.strokeStyle = '#D81B60';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Colorful stripes
      ctx.fillStyle = '#FFE88D';
      ctx.fillRect(-20, -18, 12, 36);
      ctx.fillStyle = '#A9D8F5';
      ctx.fillRect(8, -18, 12, 36);

      // Head
      ctx.fillStyle = '#FFF9FF';
      ctx.beginPath();
      ctx.arc(-22, -26, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#D81B60';
      ctx.stroke();

      // Eye & Rosy Blush
      ctx.fillStyle = '#302A43';
      ctx.beginPath();
      ctx.arc(-26, -28, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FF4081';
      ctx.beginPath();
      ctx.arc(-22, -22, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Golden Unicorn Horn
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.moveTo(-24, -42);
      ctx.lineTo(-30, -36);
      ctx.lineTo(-18, -36);
      ctx.closePath();
      ctx.fill();

      // Cute yarn tail
      ctx.strokeStyle = '#FF80AB';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(28, -2);
      ctx.lineTo(38, 12);
      ctx.stroke();

      ctx.restore();

      // Second Elastic Band on top
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#FF4081';
      ctx.beginPath();
      ctx.moveTo(anchor.x + 18, anchor.y - 20);
      ctx.lineTo(ballDrawPos.x, ballDrawPos.y);
      ctx.stroke();

      // --- Candy Projectile ---
      ctx.save();
      ctx.translate(ballDrawPos.x, ballDrawPos.y);
      // Gumball body
      ctx.fillStyle = '#FF3366';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Peppermint swirl highlight
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 1.2);
      ctx.stroke();
      ctx.restore();

      // --- Confetti & Sprinkle Particles ---
      state.particles = state.particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rot += 0.1;
        p.life -= 0.02;

        if (p.life > 0) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          if (p.shape === 'star') {
            ctx.fillRect(-4, -4, 8, 8);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
          return true;
        }
        return false;
      });

      // --- Ball Physics Simulation ---
      if (state.isBallActive) {
        state.ballPos.x += state.ballVel.x;
        state.ballPos.y += state.ballVel.y;
        state.ballVel.y += 0.45; // Gravity
        state.ballVel.x *= 0.995; // Air drag

        // Collision Check: Unicorn Piñata
        const distToPinata = Math.hypot(
          state.ballPos.x - pX,
          state.ballPos.y - pY
        );

        if (distToPinata < 38) {
          // HIT!
          soundService.playHit();
          soundService.playFanfare();
          incrementHitCount(5);

          // Spawn celebration confetti particles
          const colors = ['#FF6EA7', '#FFE88D', '#52D1B2', '#B388FF', '#FF9EAA', '#FFF'];
          for (let i = 0; i < 45; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 8;
            state.particles.push({
              x: pX,
              y: pY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 3,
              color: colors[Math.floor(Math.random() * colors.length)],
              shape: Math.random() > 0.5 ? 'star' : 'circle',
              rot: Math.random() * 6,
              life: 1.0,
            });
          }

          state.isBallActive = false;
          state.ballPos = { x: anchor.x, y: anchor.y };
          state.dragPos = { x: anchor.x, y: anchor.y };

          const points = 250 + (shotsLeft - 1) * 50;
          setScore((s) => {
            const nextScore = s + points;
            if (nextScore > highScore) {
              setHighScore(nextScore);
              localStorage.setItem('giggles_slingshot_hi', nextScore.toString());
            }
            return nextScore;
          });

          setGameState('level_won');
          gigglesReact('target_hit');
        }

        // Collision Check: Obstacles
        levelConfig.obstacles.forEach((obs) => {
          if (
            state.ballPos.x > obs.x &&
            state.ballPos.x < obs.x + obs.w &&
            state.ballPos.y > obs.y &&
            state.ballPos.y < obs.y + obs.h
          ) {
            if (obs.type === 'trampoline') {
              soundService.playStretch(0.8);
              state.ballVel.y = -Math.abs(state.ballVel.y) * 1.25; // Trampoline super bounce
            } else {
              soundService.playPop();
              state.ballVel.x *= -0.7; // Cloud bounce
              state.ballVel.y *= -0.7;
            }
          }
        });

        // Ground / Off-screen check
        if (state.ballPos.y > 440 || state.ballPos.x > 820 || state.ballPos.x < -20) {
          state.isBallActive = false;
          state.ballPos = { x: anchor.x, y: anchor.y };
          state.dragPos = { x: anchor.x, y: anchor.y };

          if (shotsLeft - 1 <= 0 && gameState !== 'level_won') {
            setGameState('level_lost');
            gigglesReact('target_missed');
          } else {
            setGameState('aiming');
            gigglesReact('target_missed');
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [levelConfig, anchor.x, anchor.y, shotsLeft, gameState, highScore, gigglesReact, incrementHitCount]);

  // Pointer Drag Handlers for Slingshot Aiming
  const handlePointerDown = (e) => {
    if (gameState !== 'aiming' || shotsLeft <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 480 / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Must click reasonably near anchor
    if (Math.hypot(mouseX - anchor.x, mouseY - anchor.y) < 70) {
      physicsRef.current.isPulling = true;
      soundService.playStretch(0.3);
      gigglesReact('slingshot_stretch');
    }
  };

  const handlePointerMove = (e) => {
    if (!physicsRef.current.isPulling) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 480 / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const dx = mouseX - anchor.x;
    const dy = mouseY - anchor.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= maxPull) {
      physicsRef.current.dragPos = { x: mouseX, y: mouseY };
    } else {
      const angle = Math.atan2(dy, dx);
      physicsRef.current.dragPos = {
        x: anchor.x + Math.cos(angle) * maxPull,
        y: anchor.y + Math.sin(angle) * maxPull,
      };
    }
  };

  const handlePointerUp = () => {
    const state = physicsRef.current;
    if (!state.isPulling) return;
    state.isPulling = false;

    const pullDist = Math.hypot(state.dragPos.x - anchor.x, state.dragPos.y - anchor.y);
    if (pullDist > 15) {
      // Launch ball!
      soundService.playLaunch();
      setShotsLeft((s) => s - 1);
      setGameState('flying');
      gigglesReact('projectile_launched');

      state.isBallActive = true;
      state.ballPos = { ...state.dragPos };
      // Velocity vector points in opposite direction of pull
      state.ballVel = {
        x: (anchor.x - state.dragPos.x) * 0.22,
        y: (anchor.y - state.dragPos.y) * 0.22,
      };
    } else {
      state.dragPos = { x: anchor.x, y: anchor.y };
    }
  };

  // Keyboard Aiming and Firing Controls
  useEffect(() => {
    let tension = 50;
    let angleRad = Math.PI * 0.82;

    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (gameState !== 'aiming' || shotsLeft <= 0) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        tension = Math.min(maxPull, tension + 6);
        physicsRef.current.isPulling = true;
        physicsRef.current.dragPos = {
          x: anchor.x - Math.cos(angleRad) * tension,
          y: anchor.y + Math.sin(angleRad) * tension,
        };
        soundService.playStretch(0.2);
        gigglesReact('slingshot_stretch');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        tension = Math.max(15, tension - 6);
        physicsRef.current.isPulling = true;
        physicsRef.current.dragPos = {
          x: anchor.x - Math.cos(angleRad) * tension,
          y: anchor.y + Math.sin(angleRad) * tension,
        };
        soundService.playStretch(0.2);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        angleRad = Math.min(Math.PI * 0.96, angleRad + 0.07);
        physicsRef.current.isPulling = true;
        physicsRef.current.dragPos = {
          x: anchor.x - Math.cos(angleRad) * tension,
          y: anchor.y + Math.sin(angleRad) * tension,
        };
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        angleRad = Math.max(Math.PI * 0.55, angleRad - 0.07);
        physicsRef.current.isPulling = true;
        physicsRef.current.dragPos = {
          x: anchor.x - Math.cos(angleRad) * tension,
          y: anchor.y + Math.sin(angleRad) * tension,
        };
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (physicsRef.current.isPulling) {
          handlePointerUp();
        } else {
          physicsRef.current.isPulling = true;
          physicsRef.current.dragPos = {
            x: anchor.x - Math.cos(angleRad) * tension,
            y: anchor.y + Math.sin(angleRad) * tension,
          };
          setTimeout(() => {
            handlePointerUp();
          }, 60);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [anchor.x, anchor.y, gameState, gigglesReact, maxPull, shotsLeft]);

  const handleNextLevel = () => {
    if (currentLevelIndex + 1 < LEVELS.length) {
      initLevel(currentLevelIndex + 1);
      gigglesReact('level_completed');
    } else {
      alert('🏆 CANDYLAND CHAMPION! You completed all Rainbow Launch levels!');
      initLevel(0);
    }
  };

  return (
    <div className="rainbow-launch-root" role="region" aria-label="Rainbow Launch Mini Game">
      {/* Game Header Bar */}
      <div className="game-top-bar">
        <div className="game-meta-group">
          <span className="game-level-tag">Level {levelConfig.level} / 3</span>
          <h3 className="game-level-title">{levelConfig.title}</h3>
        </div>

        <div className="game-stats-group">
          <div className="game-stat-badge">
            <span className="stat-label">SCORE:</span>
            <span className="stat-val">{score}</span>
          </div>
          <div className="game-stat-badge">
            <span className="stat-label">HIGH:</span>
            <span className="stat-val">{highScore}</span>
          </div>
          <div className="game-stat-badge shots-badge">
            <span className="stat-label">CANDY:</span>
            <span className="stat-val">{'🍬'.repeat(shotsLeft)}</span>
          </div>
        </div>
      </div>

      {/* Accessible Keyboard & Touch Controls Banner */}
      <div className="game-keyboard-guide-banner" role="note" aria-label="Game controls guide">
        <div className="guide-chip">
          <span className="chip-key">←</span> <span className="chip-key">→</span>
          <span className="chip-desc">Pull Tension</span>
        </div>
        <div className="guide-chip">
          <span className="chip-key">↑</span> <span className="chip-key">↓</span>
          <span className="chip-desc">Elevation Angle</span>
        </div>
        <div className="guide-chip">
          <span className="chip-key">Space</span> / <span className="chip-key">Enter</span>
          <span className="chip-desc">Launch Candy!</span>
        </div>
        <div className="guide-chip touch-chip">
          <span className="chip-icon" aria-hidden="true">📱</span>
          <span className="chip-desc">Or Touch/Drag Pouch</span>
        </div>
      </div>

      {/* Physics Canvas Area */}
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={800}
          height={480}
          tabIndex={0}
          className="physics-canvas"
          role="application"
          aria-label="Slingshot canvas. Use arrow keys to adjust tension and angle, Spacebar to launch, or drag with mouse or touch."
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />

        {/* Level Won Overlay */}
        {gameState === 'level_won' && (
          <div className="game-modal-overlay">
            <div className="game-modal-card win">
              <span className="modal-emoji">🦄✨🎉</span>
              <h3>BULLSEYE! YOU HIT THE PIÑATA!</h3>
              <p>Sprinkles and candy everywhere! Giggles is doing a happy dance!</p>
              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNextLevel}
                >
                  {currentLevelIndex + 1 < LEVELS.length ? 'Next Level ➔' : 'Play Again! 🏆'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Level Lost Overlay */}
        {gameState === 'level_lost' && (
          <div className="game-modal-overlay">
            <div className="game-modal-card lose">
              <span className="modal-emoji">🍭💨</span>
              <h3>Out of Candies!</h3>
              <p>The unicorn piñata survived this round! Try aiming with a higher arc!</p>
              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => initLevel(currentLevelIndex)}
                >
                  Try Again 🔄
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls & Tip Bar */}
      <div className="game-bottom-bar">
        <span className="game-tip">
          🎯 <strong>Tip:</strong> Pull back firmly to give your gumball speed, and watch the dotted trajectory guide!
        </span>
        <button
          type="button"
          className="btn btn-secondary restart-btn"
          onClick={() => initLevel(currentLevelIndex)}
        >
          Restart Level
        </button>
      </div>
    </div>
  );
}
