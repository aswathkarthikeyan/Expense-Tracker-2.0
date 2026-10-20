import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    __KOKO_MOUNTED__?: boolean;
  }
}

window.__KOKO_MOUNTED__ = true;

// Clear any legacy service worker or stale cache that could serve outdated chunk hashes on Cloudflare
if (typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().catch(() => {});
        }
      })
      .catch(() => {});
  }
  if ('caches' in window) {
    caches
      .keys()
      .then((keys) => {
        for (const key of keys) {
          caches.delete(key).catch(() => {});
        }
      })
      .catch(() => {});
  }
  window.addEventListener('vite:preloadError', () => {
    window.location.reload();
  });
}

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    try {
      localStorage.removeItem('koko_clean_entries_v3');
    } catch {
      // Ignore storage errors
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F6F5F0] text-[#141518] flex flex-col items-center justify-center p-6 text-center">
          <h1 className="font-display text-xl font-bold">Koko Vault</h1>
          <p className="text-xs text-[#5A5D65] mt-1 mb-4">
            Refreshing your workspace...
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-[#141518] text-white text-xs font-semibold cursor-pointer"
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement && !rootElement.hasAttribute('data-koko-rendered')) {
  rootElement.setAttribute('data-koko-rendered', 'true');
  createRoot(rootElement).render(
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  );
}
