import React from 'react';

/**
 * High-quality vector SVG artwork for Candyland items.
 * Each item accepts a dynamic primary `color` and renders shadows, highlights, and details.
 */
export function ItemRenderer({ typeId, color = '#FF6EA7', size = 64 }) {
  const shadowColor = 'rgba(0, 0, 0, 0.12)';

  switch (typeId) {
    case 'lollipop':
      return (
        <svg viewBox="0 0 64 96" width={size * 0.7} height={size * 1.05} aria-hidden="true">
          <defs>
            <linearGradient id={`stick-${typeId}-${color}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFFBF5" />
              <stop offset="50%" stopColor="#EAE5D9" />
              <stop offset="100%" stopColor="#FFFBF5" />
            </linearGradient>
            <radialGradient id={`glow-${typeId}-${color}`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFF" stopOpacity="0.8" />
              <stop offset="40%" stopColor={color} />
              <stop offset="100%" stopColor={color} stopOpacity="0.85" />
            </radialGradient>
          </defs>
          {/* Stick */}
          <rect x="29" y="44" width="6" height="48" rx="3" fill={`url(#stick-${typeId}-${color})`} />
          <path d="M29 55 L35 59 M29 67 L35 71 M29 79 L35 83" stroke="#FF8DA1" strokeWidth="1.5" strokeLinecap="round" />
          
          {/* Lollipop Candy Swirl Circle */}
          <circle cx="32" cy="28" r="24" fill={`url(#glow-${typeId}-${color})`} filter="drop-shadow(0 4px 6px rgba(0,0,0,0.12))" />
          
          {/* Classic Swirl Waves */}
          <path
            d="M32 10 A 18 18 0 0 1 50 28 A 14 14 0 0 1 36 42 A 10 10 0 0 1 26 32 A 6 6 0 0 1 32 26"
            fill="none"
            stroke="#FFFBF7"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.95"
          />
          <path
            d="M20 20 A 15 15 0 0 1 44 22"
            fill="none"
            stroke="#FFFBF7"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.7"
          />
          {/* Ribbon Bow */}
          <path d="M26 48 C 20 44, 20 52, 28 50 C 32 50, 36 50, 40 48 C 48 52, 48 44, 42 48" fill="#FFF" />
          <circle cx="34" cy="49" r="2.5" fill="#FFC837" />
          {/* Highlight shimmer */}
          <ellipse cx="22" cy="18" rx="4" ry="2" transform="rotate(-30 22 18)" fill="#FFF" opacity="0.75" />
        </svg>
      );

    case 'gumdrop':
      return (
        <svg viewBox="0 0 60 60" width={size * 0.9} height={size * 0.9} aria-hidden="true">
          <defs>
            <radialGradient id={`gumdrop-grad-${color}`} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFF" stopOpacity="0.7" />
              <stop offset="35%" stopColor={color} />
              <stop offset="100%" stopColor={color} stopOpacity="0.8" />
            </radialGradient>
          </defs>
          {/* Drop shadow */}
          <ellipse cx="30" cy="54" rx="22" ry="5" fill={shadowColor} />
          {/* Body */}
          <path
            d="M14 50 C12 36, 18 14, 30 14 C42 14, 48 36, 46 50 C46 53, 14 53, 14 50 Z"
            fill={`url(#gumdrop-grad-${color})`}
            filter="drop-shadow(0 3px 5px rgba(0,0,0,0.1))"
          />
          {/* Sugar sparkles */}
          <circle cx="24" cy="26" r="1.5" fill="#FFF" opacity="0.9" />
          <circle cx="36" cy="24" r="1.2" fill="#FFF" opacity="0.9" />
          <circle cx="28" cy="36" r="1.5" fill="#FFF" opacity="0.8" />
          <circle cx="38" cy="42" r="1.3" fill="#FFF" opacity="0.8" />
          <circle cx="20" cy="44" r="1.2" fill="#FFF" opacity="0.8" />
          <circle cx="32" cy="46" r="1.4" fill="#FFF" opacity="0.9" />
          {/* Gloss highlight */}
          <path d="M22 20 C25 17, 32 17, 35 19" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" fill="none" />
        </svg>
      );

    case 'candy-tree':
      return (
        <svg viewBox="0 0 80 120" width={size * 0.75} height={size * 1.15} aria-hidden="true">
          <defs>
            <linearGradient id={`trunk-${color}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFF5E4" />
              <stop offset="50%" stopColor="#EED9B7" />
              <stop offset="100%" stopColor="#FFF5E4" />
            </linearGradient>
            <radialGradient id={`tree-foliage-${color}`} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFF" stopOpacity="0.6" />
              <stop offset="40%" stopColor={color} />
              <stop offset="100%" stopColor={color} />
            </radialGradient>
          </defs>
          {/* Trunk */}
          <rect x="36" y="55" width="8" height="60" rx="4" fill={`url(#trunk-${color})`} />
          <path d="M36 68 L44 73 M36 84 L44 89 M36 100 L44 105" stroke="#FF6EA7" strokeWidth="2" strokeLinecap="round" />
          {/* Base grass patch */}
          <ellipse cx="40" cy="115" rx="18" ry="4" fill="#C9E4CA" opacity="0.8" />
          {/* Fluffy cotton candy tree canopy */}
          <g filter="drop-shadow(0 5px 8px rgba(0,0,0,0.12))">
            <circle cx="28" cy="42" r="20" fill={`url(#tree-foliage-${color})`} />
            <circle cx="52" cy="42" r="20" fill={`url(#tree-foliage-${color})`} />
            <circle cx="40" cy="28" r="22" fill={`url(#tree-foliage-${color})`} />
          </g>
          {/* Tree ornaments / sweet candies */}
          <circle cx="34" cy="26" r="3" fill="#FFF275" />
          <circle cx="48" cy="32" r="3" fill="#FF88B4" />
          <circle cx="28" cy="45" r="3" fill="#FFF" />
          <circle cx="44" cy="48" r="3.5" fill="#64B5F6" />
          <circle cx="54" cy="42" r="2.5" fill="#FFD166" />
          {/* Highlights */}
          <path d="M32 16 C37 13, 44 13, 48 16" stroke="#FFF" strokeWidth="3" strokeLinecap="round" opacity="0.65" fill="none" />
        </svg>
      );

    case 'cupcake':
      return (
        <svg viewBox="0 0 72 84" width={size * 0.9} height={size * 1.05} aria-hidden="true">
          <defs>
            <linearGradient id={`wrapper-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF" />
              <stop offset="100%" stopColor="#F5D0C5" />
            </linearGradient>
            <radialGradient id={`frosting-${color}`} cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFF" stopOpacity="0.8" />
              <stop offset="50%" stopColor={color} />
              <stop offset="100%" stopColor={color} />
            </radialGradient>
          </defs>
          {/* Shadow */}
          <ellipse cx="36" cy="80" rx="26" ry="4" fill={shadowColor} />
          {/* Wrapper */}
          <polygon points="18,48 54,48 48,78 24,78" fill={`url(#wrapper-${color})`} stroke="#E8B4A2" strokeWidth="1.5" />
          {/* Wrapper pleats */}
          <line x1="25" y1="48" x2="28" y2="78" stroke="#E8B4A2" strokeWidth="1.2" opacity="0.7" />
          <line x1="32" y1="48" x2="33" y2="78" stroke="#E8B4A2" strokeWidth="1.2" opacity="0.7" />
          <line x1="40" y1="48" x2="39" y2="78" stroke="#E8B4A2" strokeWidth="1.2" opacity="0.7" />
          <line x1="47" y1="48" x2="44" y2="78" stroke="#E8B4A2" strokeWidth="1.2" opacity="0.7" />
          
          {/* Swirl Frosting */}
          <g filter="drop-shadow(0 3px 6px rgba(0,0,0,0.1))">
            {/* Base swirl layer */}
            <path
              d="M12 48 C12 38, 24 38, 36 38 C48 38, 60 38, 60 48 C60 52, 12 52, 12 48 Z"
              fill={`url(#frosting-${color})`}
            />
            {/* Mid swirl */}
            <path
              d="M16 42 C16 30, 26 28, 36 28 C46 28, 56 30, 56 42 Z"
              fill={`url(#frosting-${color})`}
            />
            {/* Top dollop */}
            <path
              d="M24 32 C24 20, 36 14, 36 14 C36 14, 48 20, 48 32 Z"
              fill={`url(#frosting-${color})`}
            />
          </g>
          {/* Sprinkles on icing */}
          <rect x="22" y="34" width="4" height="2" rx="1" fill="#FFD166" transform="rotate(25 22 34)" />
          <rect x="42" y="32" width="4" height="2" rx="1" fill="#06D6A0" transform="rotate(-30 42 32)" />
          <rect x="32" y="24" width="4" height="2" rx="1" fill="#118AB2" transform="rotate(15 32 24)" />
          <rect x="46" y="42" width="4" height="2" rx="1" fill="#EF476F" transform="rotate(45 46 42)" />
          <rect x="25" y="44" width="4" height="2" rx="1" fill="#FFF" transform="rotate(-15 25 44)" />
          {/* Glazed Cherry on top */}
          <circle cx="36" cy="14" r="6" fill="#E63946" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))" />
          <ellipse cx="34" cy="12" rx="1.8" ry="1" fill="#FFF" opacity="0.8" />
          <path d="M36 10 C38 4, 44 6, 46 8" stroke="#603813" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'candy-flower':
      return (
        <svg viewBox="0 0 64 88" width={size * 0.8} height={size * 1.1} aria-hidden="true">
          <defs>
            <radialGradient id={`petal-${color}`} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFF" stopOpacity="0.7" />
              <stop offset="60%" stopColor={color} />
              <stop offset="100%" stopColor={color} />
            </radialGradient>
          </defs>
          {/* Stem */}
          <path d="M32 46 Q 34 65, 32 84" stroke="#48CAE4" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* Mint candy leaf */}
          <path d="M32 66 Q 44 62, 46 54 Q 38 56, 32 66 Z" fill="#90E0EF" stroke="#48CAE4" strokeWidth="1" />
          {/* Petals */}
          <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.12))">
            <circle cx="32" cy="18" r="11" fill={`url(#petal-${color})`} />
            <circle cx="44" cy="27" r="11" fill={`url(#petal-${color})`} />
            <circle cx="40" cy="40" r="11" fill={`url(#petal-${color})`} />
            <circle cx="24" cy="40" r="11" fill={`url(#petal-${color})`} />
            <circle cx="20" cy="27" r="11" fill={`url(#petal-${color})`} />
          </g>
          {/* Center candy button */}
          <circle cx="32" cy="30" r="10" fill="#FFD166" stroke="#FFF" strokeWidth="2" />
          <circle cx="32" cy="30" r="7" fill="#F4A261" />
          <ellipse cx="30" cy="28" rx="2.5" ry="1.2" fill="#FFF" opacity="0.9" />
        </svg>
      );

    case 'mushroom':
      return (
        <svg viewBox="0 0 64 72" width={size * 0.9} height={size * 1.0} aria-hidden="true">
          <defs>
            <radialGradient id={`mush-cap-${color}`} cx="35%" cy="25%" r="75%">
              <stop offset="0%" stopColor="#FFF" stopOpacity="0.7" />
              <stop offset="45%" stopColor={color} />
              <stop offset="100%" stopColor={color} />
            </radialGradient>
          </defs>
          {/* Stem */}
          <path
            d="M24 38 C22 52, 20 62, 20 66 C20 68, 44 68, 44 66 C44 62, 42 52, 40 38 Z"
            fill="#FFF6EB"
            stroke="#ECD8C2"
            strokeWidth="1.5"
            filter="drop-shadow(0 3px 5px rgba(0,0,0,0.1))"
          />
          {/* Cute face on stem */}
          <circle cx="28" cy="52" r="1.5" fill="#4A3728" />
          <circle cx="36" cy="52" r="1.5" fill="#4A3728" />
          <path d="M30 56 Q 32 58, 34 56" stroke="#4A3728" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <circle cx="25" cy="54" r="2" fill="#FFB4C8" opacity="0.6" />
          <circle cx="39" cy="54" r="2" fill="#FFB4C8" opacity="0.6" />

          {/* Mushroom Cap */}
          <path
            d="M10 40 C10 18, 54 18, 54 40 C54 43, 10 43, 10 40 Z"
            fill={`url(#mush-cap-${color})`}
            filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"
          />
          {/* Sugar spots */}
          <circle cx="20" cy="28" r="3.5" fill="#FFF" opacity="0.9" />
          <circle cx="32" cy="22" r="4" fill="#FFF" opacity="0.9" />
          <circle cx="44" cy="29" r="3.5" fill="#FFF" opacity="0.9" />
          <circle cx="32" cy="35" r="2.5" fill="#FFF" opacity="0.85" />
          {/* Cap shine */}
          <path d="M18 24 Q 28 16, 38 18" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" fill="none" />
        </svg>
      );

    case 'candy-house':
      return (
        <svg viewBox="0 0 104 104" width={size * 1.3} height={size * 1.3} aria-hidden="true">
          <defs>
            <linearGradient id={`wall-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDE2D6" />
              <stop offset="100%" stopColor="#EABCA7" />
            </linearGradient>
            <linearGradient id={`roof-${color}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor="#FF88B4" />
            </linearGradient>
          </defs>
          {/* Shadow */}
          <ellipse cx="52" cy="98" rx="42" ry="5" fill={shadowColor} />
          {/* Chimney */}
          <rect x="68" y="22" width="12" height="24" rx="2" fill="#E76F51" />
          <ellipse cx="74" cy="22" rx="7" ry="3" fill="#FFF" />
          <circle cx="76" cy="14" r="3" fill="#FFF" opacity="0.7" />
          <circle cx="79" cy="8" r="4" fill="#FFF" opacity="0.5" />
          
          {/* House body */}
          <rect x="22" y="46" width="60" height="48" rx="6" fill={`url(#wall-${color})`} stroke="#D4A373" strokeWidth="2" />
          
          {/* Candy cane door */}
          <path d="M44 94 L44 68 C44 62, 60 62, 60 68 L60 94 Z" fill="#9D0208" stroke="#FFF" strokeWidth="2" />
          <path d="M46 72 L58 76 M46 80 L58 84 M46 88 L58 92" stroke="#FFF" strokeWidth="1.5" />
          <circle cx="56" cy="80" r="2" fill="#FFD166" />
          
          {/* Round sugar windows */}
          <circle cx="33" cy="62" r="7" fill="#E0FBFC" stroke="#FFF" strokeWidth="2" />
          <line x1="26" y1="62" x2="40" y2="62" stroke="#FFF" strokeWidth="1.5" />
          <line x1="33" y1="55" x2="33" y2="69" stroke="#FFF" strokeWidth="1.5" />

          <circle cx="71" cy="62" r="7" fill="#E0FBFC" stroke="#FFF" strokeWidth="2" />
          <line x1="64" y1="62" x2="78" y2="62" stroke="#FFF" strokeWidth="1.5" />
          <line x1="71" y1="55" x2="71" y2="69" stroke="#FFF" strokeWidth="1.5" />

          {/* Roof */}
          <path
            d="M12 48 L52 14 L92 48 Z"
            fill={`url(#roof-${color})`}
            stroke="#FFF"
            strokeWidth="3"
            filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"
          />
          {/* Icing drips on eaves */}
          <path
            d="M12 48 Q 20 54, 28 48 Q 36 56, 44 48 Q 52 55, 60 48 Q 68 56, 76 48 Q 84 54, 92 48"
            fill="none"
            stroke="#FFF"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Roof heart candy */}
          <path
            d="M52 28 C50 24, 46 24, 46 28 C46 33, 52 38, 52 38 C52 38, 58 33, 58 28 C58 24, 54 24, 52 28 Z"
            fill="#FFF"
          />
        </svg>
      );

    case 'heart-candy':
      return (
        <svg viewBox="0 0 64 64" width={size * 0.9} height={size * 0.9} aria-hidden="true">
          <defs>
            <radialGradient id={`heart-${color}`} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFF" stopOpacity="0.7" />
              <stop offset="45%" stopColor={color} />
              <stop offset="100%" stopColor={color} />
            </radialGradient>
          </defs>
          <ellipse cx="32" cy="58" rx="20" ry="4" fill={shadowColor} />
          <path
            d="M32 54 C12 40, 6 26, 12 16 C18 6, 28 10, 32 18 C36 10, 46 6, 52 16 C58 26, 52 40, 32 54 Z"
            fill={`url(#heart-${color})`}
            stroke="#FFF"
            strokeWidth="2.5"
            filter="drop-shadow(0 4px 8px rgba(0,0,0,0.12))"
          />
          <text
            x="32"
            y="32"
            textAnchor="middle"
            fill="#FFF"
            fontFamily="sans-serif"
            fontSize="9"
            fontWeight="bold"
            letterSpacing="0.5"
            opacity="0.95"
          >
            SWEET
          </text>
          <ellipse cx="22" cy="16" rx="4" ry="2" transform="rotate(-30 22 16)" fill="#FFF" opacity="0.7" />
        </svg>
      );

    // ==================== DECORATIONS ====================

    case 'star':
      return (
        <svg viewBox="0 0 44 44" width={size * 0.75} height={size * 0.75} aria-hidden="true">
          <defs>
            <radialGradient id={`star-${color}`} cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFF" />
              <stop offset="50%" stopColor={color} />
              <stop offset="100%" stopColor={color} />
            </radialGradient>
          </defs>
          <polygon
            points="22,2 27,15 41,16 30,25 34,39 22,31 10,39 14,25 3,16 17,15"
            fill={`url(#star-${color})`}
            stroke="#FFF"
            strokeWidth="1.5"
            filter="drop-shadow(0 2px 6px rgba(249, 199, 79, 0.4))"
          />
          <circle cx="22" cy="22" r="3" fill="#FFF" opacity="0.9" />
          <circle cx="20" cy="18" r="1.5" fill="#FFF" />
        </svg>
      );

    case 'heart':
      return (
        <svg viewBox="0 0 44 44" width={size * 0.75} height={size * 0.75} aria-hidden="true">
          <path
            d="M22 38 C8 28, 4 18, 8 11 C12 4, 19 7, 22 12 C25 7, 32 4, 36 11 C40 18, 36 28, 22 38 Z"
            fill={color}
            stroke="#FFF"
            strokeWidth="2"
            filter="drop-shadow(0 3px 6px rgba(255, 110, 167, 0.35))"
          />
          <ellipse cx="14" cy="12" rx="3" ry="1.5" transform="rotate(-30 14 12)" fill="#FFF" opacity="0.75" />
        </svg>
      );

    case 'rainbow':
      return (
        <svg viewBox="0 0 72 48" width={size * 1.1} height={size * 0.75} aria-hidden="true">
          <defs>
            <filter id="rainbow-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#FFB8D2" floodOpacity="0.4" />
            </filter>
          </defs>
          <g filter="url(#rainbow-glow)">
            {/* Outer red/pink */}
            <path d="M12 40 A 24 24 0 0 1 60 40" fill="none" stroke="#FF6EA7" strokeWidth="5" strokeLinecap="round" />
            {/* Mid yellow */}
            <path d="M17 40 A 19 19 0 0 1 55 40" fill="none" stroke="#F9C74F" strokeWidth="5" strokeLinecap="round" />
            {/* Inner mint/blue */}
            <path d="M22 40 A 14 14 0 0 1 50 40" fill="none" stroke={color || '#52D1B2'} strokeWidth="5" strokeLinecap="round" />
          </g>
          {/* Cloud endcaps */}
          <ellipse cx="13" cy="40" rx="8" ry="5" fill="#FFF" />
          <ellipse cx="59" cy="40" rx="8" ry="5" fill="#FFF" />
          <circle cx="10" cy="38" r="4" fill="#FFF" />
          <circle cx="62" cy="38" r="4" fill="#FFF" />
        </svg>
      );

    case 'sparkles':
      return (
        <svg viewBox="0 0 48 48" width={size * 0.8} height={size * 0.8} aria-hidden="true">
          {/* Main sparkle */}
          <path
            d="M24 6 Q 24 20, 10 20 Q 24 20, 24 34 Q 24 20, 38 20 Q 24 20, 24 6 Z"
            fill={color || '#F9C74F'}
            filter="drop-shadow(0 0 4px rgba(249, 199, 79, 0.6))"
          />
          {/* Small top right sparkle */}
          <path
            d="M38 10 Q 38 16, 32 16 Q 38 16, 38 22 Q 38 16, 44 16 Q 38 16, 38 10 Z"
            fill="#FFF"
            opacity="0.9"
          />
          {/* Small bottom left sparkle */}
          <path
            d="M10 28 Q 10 33, 5 33 Q 10 33, 10 38 Q 10 33, 15 33 Q 10 33, 10 28 Z"
            fill="#FF88B4"
            opacity="0.9"
          />
        </svg>
      );

    case 'cloud-puff':
      return (
        <svg viewBox="0 0 76 46" width={size * 1.1} height={size * 0.7} aria-hidden="true">
          <g filter="drop-shadow(0 3px 6px rgba(183, 132, 245, 0.25))">
            <path
              d="M18 36 C10 36, 6 28, 12 22 C12 14, 22 10, 28 16 C34 8, 48 8, 52 16 C60 12, 70 18, 68 26 C74 32, 68 36, 60 36 Z"
              fill={color || '#FFF2DF'}
            />
          </g>
          <ellipse cx="30" cy="18" rx="8" ry="3" fill="#FFF" opacity="0.6" />
          <ellipse cx="50" cy="20" rx="6" ry="2.5" fill="#FFF" opacity="0.6" />
        </svg>
      );

    case 'sprinkles':
      return (
        <svg viewBox="0 0 52 38" width={size * 0.8} height={size * 0.6} aria-hidden="true">
          <rect x="8" y="10" width="12" height="4" rx="2" fill="#FF6EA7" transform="rotate(-20 8 10)" />
          <rect x="24" y="6" width="12" height="4" rx="2" fill={color || '#9B5DE5'} transform="rotate(35 24 6)" />
          <rect x="36" y="20" width="12" height="4" rx="2" fill="#F9C74F" transform="rotate(-15 36 20)" />
          <rect x="16" y="24" width="12" height="4" rx="2" fill="#52D1B2" transform="rotate(40 16 24)" />
          <circle cx="34" cy="10" r="2.5" fill="#FF88B4" />
          <circle cx="8" cy="28" r="2.5" fill="#64B5F6" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden="true">
          <circle cx="30" cy="30" r="24" fill={color} />
          <text x="30" y="36" textAnchor="middle" fill="#FFF" fontSize="20" fontWeight="bold">🍬</text>
        </svg>
      );
  }
}
