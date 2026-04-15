import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import '@fontsource/sora/300.css';
import '@fontsource/sora/400.css';
import '@fontsource/sora/500.css';
import '@fontsource/sora/700.css';

createRoot(document.getElementById('root')).render(
    <App />
)