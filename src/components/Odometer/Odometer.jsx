import React from 'react';
import './Odometer.css';

export function Odometer({ count }) {
  // Pad with leading zeroes to 6 digits
  const formatted = String(count).padStart(6, '0');
  const digits = formatted.split('');

  return (
    <div
      className="retro-odometer"
      title="Sweet Interactions Counter: Tracks candies planted, lullabies enjoyed, piñata hits, and pokes!"
      aria-label={`Interactions odometer count: ${count}`}
    >
      <span className="odometer-label" aria-hidden="true">
        SWEET METER:
      </span>
      <div className="odometer-wheels">
        {digits.map((digit, idx) => (
          <div key={idx} className="odometer-wheel">
            <span className="odometer-digit">{digit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
