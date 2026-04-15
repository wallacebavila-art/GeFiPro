import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastProvider } from './context/ToastContext.jsx';
import { LoadingProvider } from './context/LoadingContext.jsx';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <LoadingProvider>
        <App />
      </LoadingProvider>
    </ToastProvider>
  </StrictMode>,
);
