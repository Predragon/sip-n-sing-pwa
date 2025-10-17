import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// CRITICAL: Import the Router
import { BrowserRouter } from 'react-router-dom'

// Render the root React app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* CRITICAL: Wrap the App component with the Router */}
    <BrowserRouter>
      {/* Added wrapper div for consistent white background and full coverage */}
      <div className="bg-white min-h-screen">
        <App />
      </div>
    </BrowserRouter>
  </React.StrictMode>
)

// ✅ PWA Service Worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registered with scope:', registration.scope)

        // Optional: handle updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('🔁 New content is available; please refresh.')
              } else {
                console.log('🎉 Content cached for offline use.')
              }
            }
          }
        }
      })
      .catch(error => {
        console.error('❌ Service Worker registration failed:', error)
      })
  })
}