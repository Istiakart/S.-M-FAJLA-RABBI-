
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Entry point for the S M Fajla Rabbi Portfolio Application.
 * Optimized for React 19 using ESM modules and Import Maps from esm.sh.
 */
const mountNode = document.getElementById('root');

// Validate the existence of the root element to prevent runtime mounting failures.
if (!mountNode) {
  console.error('CRITICAL: Mount node #root not found in the DOM. Application failed to initialize.');
  throw new Error("Mount node not found. Ensure <div id='root'></div> is present in index.html.");
}

// Create the React root using the React 19 standard.
const root = ReactDOM.createRoot(mountNode);

// Render the application wrapped in StrictMode for development best practices.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
