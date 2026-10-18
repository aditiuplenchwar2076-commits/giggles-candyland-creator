import React, { useEffect, useState, useRef } from 'react';
import './SparkleTrail.css';

export function SparkleTrail() {
  const [particles, setParticles] = useState([]);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Only on fine mouse devices
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const sparkles = ['✨', '✦', '⭐', '🌸', '🍭'];
    const colors = ['#FF6EA7', '#FFE88D', '#B388FF', '#52D1B2', '#64B5F6'];

    const handlePointerMove = (e) => {
      const now = Date.now();
      if (now - lastTimeRef.current < 65) return; // throttle
      lastTimeRef.current = now;

      const newParticle = {
        id: `sp-${now}-${Math.random()}`,
        x: e.clientX,
        y: e.clientY,
        char: sparkles[Math.floor(Math.random() * sparkles.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 10 + Math.random() * 8,
      };

      setParticles((prev) => [...prev.slice(-12), newParticle]);

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 700);
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="sparkle-trail-container" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="trail-sparkle"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            color: p.color,
            fontSize: `${p.size}px`,
          }}
        >
          {p.char}
        </span>
      ))}
    </div>
  );
}
