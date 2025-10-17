import React, { Suspense, lazy, useEffect, useState } from 'react';
import InstallPWAButton from './components/InstallPWAButton'; // 👈 Add this import

// Lazy-load components for better performance
const Menu = lazy(() => import('./components/Menu'));
const StaffDashboard = lazy(() => import('./components/StaffDashboard'));

export default function App() {
  const [route, setRoute] = useState(window.location.pathname);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Handle simple browser navigation (no React Router)
  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Listen for online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Service Worker registration feedback
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        console.log('✅ Service Worker is active and ready.');
      });
    }
  }, []);

  const isStaffView = route.startsWith('/staff');

  return (
    <div
      style={{
        backgroundColor: 'white',
        minHeight: '100vh',
        color: 'black',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* ⚠️ Offline Banner */}
      {!isOnline && (
        <div
          style={{
            background: '#ffcc00',
            color: '#000',
            padding: '8px 12px',
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          ⚠️ You’re offline — viewing cached content.
        </div>
      )}

      {/* 🌀 Lazy Loading Fallback */}
      <Suspense
        fallback={
          <div
            style={{
              textAlign: 'center',
              marginTop: '40vh',
              fontSize: '18px',
              fontWeight: '500',
            }}
          >
            Loading…
          </div>
        }
      >
        {isStaffView ? <StaffDashboard /> : <Menu />}
      </Suspense>

      {/* 📲 Add the PWA Install Button */}
      <InstallPWAButton />
    </div>
  );
}