import React from 'react';
// These components will be created/updated next
import Menu from './components/Menu'; 
import StaffDashboard from './components/StaffDashboard'; 

/**
 * Main application entry point handling simple routing
 * based on the window's URL path.
 */
export default function App() {
  // Checks if the user is accessing the /staff route
  const isStaffView = window.location.pathname.startsWith('/staff');

  return (
    // Inline style for white background (full viewport height, black text default)
    <div style={{ backgroundColor: 'white', minHeight: '100vh', color: 'black' }}>
      {/* Renders the Staff Dashboard component if the path is /staff, 
          otherwise renders the Customer Menu component */}
      {isStaffView ? <StaffDashboard /> : <Menu />}
    </div>
  );
}