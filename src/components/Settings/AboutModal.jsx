import React from 'react';
import './Settings.css';

export function AboutModal() {
  return (
    <div className="about-window-root" role="region" aria-label="About Giggles">
      <div className="about-hero">
        <img
          src="/images/giggles_main.png"
          alt="Original Baby Giggles holding lollipop"
          className="about-character-img"
        />
        <div className="about-meta">
          <span className="about-badge">⭐ haX.baby Hackathon 2026</span>
          <h3 className="about-title">Giggles: The Baby Who Makes The Internet Smile</h3>
          <p className="about-role">Original Character & Digital Companion</p>
        </div>
      </div>

      <div className="about-story-card">
        <h4>Meet Giggles 👶🏻🍬</h4>
        <p>
          Giggles is an adorable, mischievous digital companion born from sweet dreams and fluffy cotton candy clouds. 
          With signature <strong>rosy cheeks</strong>, an iconic <strong>golden curl</strong>, a cozy <strong>pink outfit</strong>, 
          and an oversized <strong>red-and-white swirl peppermint lollipop</strong>, Giggles lives in your browser to bring smiles, 
          sweet lullabies, and harmless chaos to the web.
        </p>

        <h4>Project Features</h4>
        <ul className="about-features-list">
          <li>🍬 <strong>Candyland Creator:</strong> Interactive candy garden studio with SVG exports.</li>
          <li>🎶 <strong>Dream Library:</strong> Procedural Web Audio lullabies with sleep timer.</li>
          <li>🦄 <strong>Rainbow Launch:</strong> Real physics projectile game targeting the unicorn piñata.</li>
          <li>⭐ <strong>Secret Star Sky:</strong> Private, 100% local baby mirror photo transformation.</li>
          <li>👶🏻 <strong>Persistent Companion:</strong> Giggles accompanies you across every window!</li>
        </ul>
      </div>
    </div>
  );
}
