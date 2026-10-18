import React from 'react';
import { InteractionProvider } from './services/interactionContext';
import { RetroDesktop } from './components/Desktop/RetroDesktop';
import './App.css';

function App() {
  return (
    <InteractionProvider>
      <RetroDesktop />
    </InteractionProvider>
  );
}

export default App;
