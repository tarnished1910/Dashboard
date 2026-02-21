import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

function showStartupError(message: string) {
  const fallback = document.getElementById('startup-fallback');
  if (fallback) {
    fallback.innerHTML = `
      <div style="max-width: 640px; margin: 0 auto; border: 1px solid #fecaca; background: #ffffff; border-radius: 12px; padding: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.08)">
        <h1 style="margin: 0 0 8px; color: #b91c1c; font-size: 20px; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;">Dashboard failed to start</h1>
        <p style="margin: 0 0 8px; color: #334155; font-size: 14px; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;">The app hit an early startup error. Open browser DevTools Console for details.</p>
        <pre style="margin: 0; white-space: pre-wrap; color: #991b1b; font-size: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;">${message}</pre>
      </div>
    `;
    fallback.style.display = 'flex';
  }
}

window.addEventListener('error', (event) => {
  const message = event.error instanceof Error ? event.error.message : String(event.message);
  showStartupError(message);
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason instanceof Error ? event.reason.message : String(event.reason);
  showStartupError(reason);
});

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );

  const fallback = document.getElementById('startup-fallback');
  if (fallback) {
    fallback.style.display = 'none';
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  showStartupError(message);
}
