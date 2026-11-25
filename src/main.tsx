import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LanguageProvider } from './i18n/LanguageProvider';
import App from './App';
import './index.css';

// Light deterrent against copying photos: no right-click menu and no dragging images out of the page.
// Form fields keep their menu so visitors can still paste. (Screenshots and browser tools still work.)
const editable = 'input, textarea, select, [contenteditable="true"]';
document.addEventListener('contextmenu', (e) => {
  if (!(e.target instanceof Element && e.target.closest(editable))) e.preventDefault();
});
document.addEventListener('dragstart', (e) => {
  if (e.target instanceof HTMLImageElement || e.target instanceof HTMLCanvasElement) e.preventDefault();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);
