import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// CRITICAL: Import the Router
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* CRITICAL: Wrap the App component with the Router */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

