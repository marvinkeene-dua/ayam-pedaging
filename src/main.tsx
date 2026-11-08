import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/eb-garamond';
import '@fontsource-variable/jost';
import './index.css';
import App from './App.tsx';
import { ToastProvider } from './components/Toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
);
