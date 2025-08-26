import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { HelmetProvider } from 'react-helmet-async'; 
const root = ReactDOM.createRoot(document.getElementById('root'));
// By removing <React.StrictMode>, we prevent the crash caused by the Quill library.
root.render(
  <BrowserRouter>
  <HelmetProvider>
    <App />
  </HelmetProvider>
  </BrowserRouter>
);
