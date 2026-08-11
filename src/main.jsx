// Entry point — Vite ESM. Boots the React app into #root.
import React from 'react';
import { createRoot } from 'react-dom/client';

// Side-effect import: exposes window.__CONTENT_SEED (used by lib/admin.jsx fallback).
import './lib/contentSeedData.js';

import { Root } from './App.jsx';

const root = createRoot(document.getElementById('root'));
root.render(<Root/>);
