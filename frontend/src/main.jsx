import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n';
import './styles/global.css';

// Performance: mark initial render start for diagnostics
if (typeof performance !== 'undefined') {
  performance.mark('app-start');
}

// Register PWA service worker for offline caching (production only)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: false }); // defer SW registration after page loads
  }).catch(() => {
    // Ignore PWA register failure in environments where virtual module isn't loaded
  });
}

const container = document.getElementById('root');

// Accessibility: inject skip-to-main link before React mounts
// This is rendered server-side-style so it's available immediately for screen readers
const skipLink = document.createElement('a');
skipLink.href = '#main-content';
skipLink.className = 'skip-to-main';
skipLink.textContent = "Asosiy kontentga o'tish";
document.body.insertBefore(skipLink, container);

import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
