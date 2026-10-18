import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { soundService } from './soundService';

const InteractionContext = createContext(null);

const EVENT_REACTIONS = {
  welcome: [
    { text: "HEYYYY! You came! I was literally just staring at a cloud. 👶🏻☁️", mood: 'happy' },
    { text: "Welcome to my tiny corner of the internet. Shoes off, please. The floor is imaginary. 🍭", mood: 'happy' },
    { text: "Psst. You're my favourite visitor today. Don't tell the other humans. ✨", mood: 'mischief' },
  ],
  project_hover: [
    { text: "Ooooooh, that one! Click it! CLICK IT! 👆✨", mood: 'excited' },
    { text: "I worked very hard on this. By 'worked', I mean I supervised and took a nap. 😴", mood: 'mischief' },
    { text: "That button looks suspicious. We should definitely investigate. 🕵️‍♀️", mood: 'mischief' },
  ],
  project_open: {
    candyland: [
      { text: "WELCOME TO CANDYLAND! I pay rent in gummy bears. 🍬", mood: 'excited' },
      { text: "Okay, genius. Let's make something certified adorable. 🎨", mood: 'happy' },
      { text: "I shall guide you. I have no qualifications, but excellent vibes. 🍭", mood: 'happy' },
    ],
    dream_library: [
      { text: "Welcome to Dream Library! Put on your imaginary headphones. 🎵☁️", mood: 'sleepy' },
      { text: "Shhh... the lullabies are starting. Don't worry, I won't drool. 😴", mood: 'sleepy' },
    ],
    rainbow_launch: [
      { text: "TIME TO LAUNCH CANDY! That unicorn piñata has been talking smack! 🦄💥", mood: 'excited' },
      { text: "Aim true! Pull back and release the sugar rocket! 🚀", mood: 'excited' },
    ],
    guestbook: [
      { text: "Write me a sweet message! I can't read yet, but I love the squiggles! 📝💕", mood: 'happy' },
    ],
    settings: [
      { text: "Dials and buttons! Don't worry, I haven't chewed on any of the wires. ⚙️✨", mood: 'mischief' },
    ],
    easter_egg: [
      { text: "WHOA! You found the secret starry sky! Keep your voice down! 🤫⭐", mood: 'surprised' },
    ],
  },
  design_changed: [
    { text: "Oooo, pink frosting! Excellent life choices. 🎨", mood: 'happy' },
    { text: "More sprinkles. I believe in your artistic soul. ✨", mood: 'excited' },
    { text: "This is art. My refrigerator door is ready! 🖼️", mood: 'happy' },
    { text: "WAIT. YOU MADE THAT?! Certified cutie behaviour. 💖", mood: 'excited' },
  ],
  design_downloaded: [
    { text: "DOWNLOADED! Frame it! Put it in the Louvre immediately! 🖼️✨", mood: 'dance' },
    { text: "Good save! I was about to eat the canvas pixels! 😋", mood: 'mischief' },
  ],
  track_played: [
    { text: "This song makes my tiny toes sleepy... 🎶💤", mood: 'sleepy' },
    { text: "One more song? That's what everyone says before 8 hours of naps. 🌙", mood: 'sleepy' },
    { text: "So soothing... the clouds are tucking us in. ☁️✨", mood: 'sleepy' },
  ],
  track_paused: [
    { text: "Did the music pause, or did I accidentally fall asleep? 😴", mood: 'sleepy' },
  ],
  sleep_timer_set: [
    { text: "Sleep timer activated! Counting imaginary fluffy sheep now... 🐑💤", mood: 'sleepy' },
  ],
  sleep_timer_ended: [
    { text: "Zzz... the music stopped gently. Sweet dreams, sweet human. 🌙💤", mood: 'sleepy' },
  ],
  game_started: [
    { text: "PULL BACK! PULL BACK! I believe in your arm! 🏹🦄", mood: 'excited' },
  ],
  slingshot_stretch: [
    { text: "Keep pulling! Steady... ready... 🎯", mood: 'excited' },
  ],
  projectile_launched: [
    { text: "THERE IT GOES! FLY, CANDY, FLY! 🚀🍬", mood: 'excited' },
  ],
  target_hit: [
    { text: "BULLSEYE! CONFETTI EMERGENCY! 💥🦄🎉", mood: 'dance' },
    { text: "DIRECT HIT! The unicorn is raining sweet sprinkles! 🍬✨", mood: 'excited' },
    { text: "Somebody get this human a medal and a giant lollipop! 🍭🏆", mood: 'dance' },
  ],
  level_completed: [
    { text: "MISSION COMPLETE! Professional button presser achievement unlocked! 🌟", mood: 'dance' },
  ],
  target_missed: [
    { text: "THAT WAS SO CLOSE! The piñata definitely felt a gentle breeze. 💨", mood: 'mischief' },
    { text: "Oopsie! The pixels got silly. Try angling a little higher! 🎯", mood: 'happy' },
  ],
  easter_egg_found: [
    { text: "GASP! You touched the glowing secret star! Hold onto your bonnet! 🌟✨", mood: 'surprised' },
  ],
  camera_permission_granted: [
    { text: "Camera activated! Prepare for MAXIMUM CUTENESS! 📸💖", mood: 'excited' },
  ],
  photo_ready: [
    { text: "LOOK AT YOU! You have my rosy cheeks and golden curl now! Adorable! 🥰", mood: 'dance' },
  ],
  guestbook_signed: [
    { text: "Hooray! Your signature is on the fridge of my heart! 💖", mood: 'happy' },
  ],
  poke_giggles: [
    { text: "Hehehe! You poked me! Tickles! 👶🏻💖", mood: 'excited' },
    { text: "EXCUSE YOU. I am very boopable. 🍬", mood: 'mischief' },
    { text: "Boop accepted! Your reward is my eternal friendship. 🌟", mood: 'happy' },
    { text: "Again? Wow. I am basically internet famous now. 💅", mood: 'dance' },
    { text: "Giggle giggle giggle! My cheeks are extra pink now! 🌸", mood: 'happy' },
  ],
  chaos_toggled: [
    { text: "CHAOS ACTIVATED! ALL HAIL THE GUMMY BEAR OVERLORDS! 🤪🌈", mood: 'dance' },
    { text: "Phew, back to cozy mode! That was deliciously chaotic! ☁️🌸", mood: 'happy' },
  ],
  idle: [
    { text: "Are we thinking, or did you fall asleep with your eyes open? 🤔", mood: 'mischief' },
    { text: "Take your time. I am professionally trained in doing nothing. ☁️", mood: 'happy' },
    { text: "Psst... I found a star. It has absolutely no responsibilities. ⭐", mood: 'sleepy' },
  ],
};

export function InteractionProvider({ children }) {
  // Global settings
  const [globalMute, setGlobalMute] = useState(() => {
    return localStorage.getItem('giggles_mute') === 'true';
  });
  const [chaosMode, setChaosMode] = useState(false);
  const [commentaryMuted, setCommentaryMuted] = useState(false);

  // Real interaction hit counter (odometer)
  const [hitCount, setHitCount] = useState(() => {
    const saved = localStorage.getItem('giggles_hit_count');
    return saved ? parseInt(saved, 10) : 42; // starting fun offset
  });

  // Persistent Giggles companion state
  const [gigglesComment, setGigglesComment] = useState(
    'HEYYYY! You came! I was literally just staring at a cloud. 👶🏻☁️'
  );
  const [gigglesMood, setGigglesMood] = useState('happy'); // 'happy' | 'excited' | 'sleepy' | 'mischief' | 'surprised' | 'dance'
  const [isBubbleVisible, setIsBubbleVisible] = useState(true);

  // Window manager state
  const [windows, setWindows] = useState({
    candyland: { isOpen: true, isMinimized: false, zIndex: 10 },
    dream_library: { isOpen: false, isMinimized: false, zIndex: 5 },
    rainbow_launch: { isOpen: false, isMinimized: false, zIndex: 5 },
    guestbook: { isOpen: false, isMinimized: false, zIndex: 5 },
    settings: { isOpen: false, isMinimized: false, zIndex: 5 },
    about: { isOpen: false, isMinimized: false, zIndex: 5 },
    easter_egg: { isOpen: false, isMinimized: false, zIndex: 20 },
  });
  const [, setTopZ] = useState(15);

  // Cooldown timer to prevent overwhelming auto-comments
  const lastCommentTimeRef = useRef(0);
  const idleTimerRef = useRef(null);

  // Sync mute setting with soundService
  useEffect(() => {
    soundService.setMuted(globalMute);
    localStorage.setItem('giggles_mute', globalMute.toString());
  }, [globalMute]);

  // Persist hit counter
  useEffect(() => {
    localStorage.setItem('giggles_hit_count', hitCount.toString());
  }, [hitCount]);

  const incrementHitCount = useCallback((amount = 1) => {
    setHitCount((prev) => prev + amount);
  }, []);

  // Window controls
  const openWindow = useCallback(
    (id) => {
      setTopZ((prevZ) => {
        const nextZ = prevZ + 1;
        setWindows((prev) => ({
          ...prev,
          [id]: { ...prev[id], isOpen: true, isMinimized: false, zIndex: nextZ },
        }));
        return nextZ;
      });
      soundService.playPop();
    },
    []
  );

  const closeWindow = useCallback((id) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false, isMinimized: false },
    }));
    soundService.playPop();
  }, []);

  const minimizeWindow = useCallback((id) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: !prev[id].isMinimized },
    }));
    soundService.playPop();
  }, []);

  const focusWindow = useCallback((id) => {
    setTopZ((prevZ) => {
      const nextZ = prevZ + 1;
      setWindows((prev) => ({
        ...prev,
        [id]: { ...prev[id], isMinimized: false, zIndex: nextZ },
      }));
      return nextZ;
    });
  }, []);

  // Dispatch an event to Giggles
  const gigglesReact = useCallback(
    (eventName, context = {}) => {
      const now = Date.now();
      // If user silenced automatic comments and it's not a direct poke, skip speech bubble
      if (commentaryMuted && eventName !== 'poke_giggles') {
        return;
      }

      // Add small cooldown for automatic comments to avoid spamming (min 3.5s) unless it's a direct poke
      if (eventName !== 'poke_giggles' && now - lastCommentTimeRef.current < 3500) {
        return;
      }

      lastCommentTimeRef.current = now;

      let reactionPool = EVENT_REACTIONS[eventName];
      if (!reactionPool) return;

      // Handle nested context (e.g. project_open with project id)
      if (!Array.isArray(reactionPool) && typeof reactionPool === 'object') {
        const subKey = context.projectId || context.subType || Object.keys(reactionPool)[0];
        reactionPool = reactionPool[subKey] || Object.values(reactionPool)[0];
      }

      if (Array.isArray(reactionPool) && reactionPool.length > 0) {
        const chosen = reactionPool[Math.floor(Math.random() * reactionPool.length)];
        setGigglesComment(chosen.text);
        setGigglesMood(chosen.mood || 'happy');
        setIsBubbleVisible(true);

        if (eventName === 'poke_giggles') {
          soundService.playBoop();
        }
      }
    },
    [commentaryMuted]
  );

  // Idle timer: prompts Giggles after 28 seconds of inactivity
  useEffect(() => {
    const resetIdle = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        gigglesReact('idle');
      }, 28000);
    };

    window.addEventListener('pointerdown', resetIdle);
    window.addEventListener('keydown', resetIdle);
    resetIdle();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener('pointerdown', resetIdle);
      window.removeEventListener('keydown', resetIdle);
    };
  }, [gigglesReact]);

  return (
    <InteractionContext.Provider
      value={{
        globalMute,
        setGlobalMute,
        chaosMode,
        setChaosMode,
        commentaryMuted,
        setCommentaryMuted,
        hitCount,
        incrementHitCount,
        gigglesComment,
        gigglesMood,
        isBubbleVisible,
        setIsBubbleVisible,
        gigglesReact,
        windows,
        openWindow,
        closeWindow,
        minimizeWindow,
        focusWindow,
      }}
    >
      {children}
    </InteractionContext.Provider>
  );
}

export function useInteraction() {
  const ctx = useContext(InteractionContext);
  if (!ctx) {
    throw new Error('useInteraction must be used within an InteractionProvider');
  }
  return ctx;
}
