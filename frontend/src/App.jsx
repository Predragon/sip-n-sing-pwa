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
    // Added wrapper div with Tailwind classes for full white background coverage
    <div className="bg-white min-h-screen text-black">
      {/* Renders the Staff Dashboard component if the path is /staff, 
          otherwise renders the Customer Menu component */}
      {isStaffView ? <StaffDashboard /> : <Menu />}
    </div>
  );
}