import React, { useState, useEffect } from 'react';
import { soundService } from '../../services/soundService';
import { useInteraction } from '../../services/interactionContext';
import './Guestbook.css';

const INITIAL_ENTRIES = [
  {
    id: 'entry-1',
    name: 'Pip ☁️',
    avatar: '👶🏻',
    message: 'Giggles! You stole my giant lollipop again! But I forgive you because you are cute!',
    date: 'Just now',
    sticker: '🍭',
  },
  {
    id: 'entry-2',
    name: 'Captain Gumdrop',
    avatar: '🍬',
    message: 'Reporting from Candyland North: All sugar hills are intact and tasting delicious!',
    date: '2 hours ago',
    sticker: '⭐',
  },
  {
    id: 'entry-3',
    name: 'Teddy Bear',
    avatar: '🧸',
    message: 'Hugging the fluffy clouds while listening to Moonlight Milkshake. 10/10 vibes.',
    date: 'Yesterday',
    sticker: '💖',
  },
  {
    id: 'entry-4',
    name: 'Sir Sprinkle-a-Lot',
    avatar: '🦄',
    message: 'The unicorn piñata is plotting revenge in Rainbow Launch! Beware of flying jelly!',
    date: 'Yesterday',
    sticker: '🌈',
  },
];

const AVATARS = ['👶🏻', '🍭', '🧸', '🦄', '⭐', '🌸', '🧁', '🍪'];

export function Guestbook() {
  const { gigglesReact, incrementHitCount } = useInteraction();

  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem('giggles_guestbook_entries');
    return saved ? JSON.parse(saved) : INITIAL_ENTRIES;
  });

  const [authorName, setAuthorName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('👶🏻');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    localStorage.setItem('giggles_guestbook_entries', JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = authorName.trim();
    const cleanMsg = message.trim();

    if (!cleanName) {
      setFeedback('Please write your cute name!');
      return;
    }
    if (!cleanMsg) {
      setFeedback('Please write a sweet message for Giggles!');
      return;
    }

    const newEntry = {
      id: `entry-${Date.now()}`,
      name: cleanName.slice(0, 30),
      avatar: selectedAvatar,
      message: cleanMsg.slice(0, 160),
      date: 'Just now',
      sticker: '✨',
    };

    setEntries([newEntry, ...entries]);
    setAuthorName('');
    setMessage('');
    setFeedback('Hooray! Your message is posted in the scrapbook! 💖');
    soundService.playChime();
    incrementHitCount(3);
    gigglesReact('guestbook_signed');

    setTimeout(() => setFeedback(''), 4000);
  };

  return (
    <div className="guestbook-root" role="region" aria-label="Giggles Baby Guestbook">
      {/* Header */}
      <div className="guestbook-header-banner">
        <span className="guestbook-icon">📖✨</span>
        <div>
          <h3 className="guestbook-title">Baby Giggles' Scrapbook</h3>
          <p className="guestbook-subtitle">
            Sign the guestbook! <em>(Saved locally in your browser session)</em>
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form className="guestbook-form-card" onSubmit={handleSubmit}>
        <div className="form-row-top">
          <div className="form-field name-field">
            <label htmlFor="gb-name" className="field-label">Your Name / Nickname:</label>
            <input
              id="gb-name"
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Sugar Plum"
              maxLength={30}
              className="gb-input"
            />
          </div>

          <div className="form-field avatar-field">
            <span className="field-label">Pick Avatar:</span>
            <div className="avatar-picker-row">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  className={`avatar-choice-btn ${selectedAvatar === av ? 'active' : ''}`}
                  onClick={() => setSelectedAvatar(av)}
                  aria-label={`Select avatar ${av}`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="gb-msg" className="field-label">Sweet Note for Giggles (max 160 chars):</label>
          <textarea
            id="gb-msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell Giggles your favourite candy, or say hello!"
            maxLength={160}
            rows={2}
            className="gb-textarea"
          />
        </div>

        <div className="form-submit-row">
          <button type="submit" className="btn btn-primary gb-submit-btn">
            Sign Guestbook ✍️💖
          </button>
          {feedback && <span className="gb-feedback-msg" role="status">{feedback}</span>}
        </div>
      </form>

      {/* Entries Stream */}
      <div className="guestbook-entries-list" role="feed" aria-label="Guestbook notes">
        {entries.map((item) => (
          <article key={item.id} className="scrapbook-sticky-note">
            <div className="note-pin" aria-hidden="true" />
            <div className="note-header">
              <span className="note-avatar">{item.avatar}</span>
              <div className="note-meta">
                <span className="note-author">{item.name}</span>
                <span className="note-date">{item.date}</span>
              </div>
              <span className="note-sticker">{item.sticker}</span>
            </div>
            <p className="note-body">{item.message}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
