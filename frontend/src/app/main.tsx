import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { init } from '@telegram-apps/sdk-react';
import './index.css'
import App from './App.tsx'

// Инициализируем Telegram SDK только если мы в контексте Telegram
try {
  if ((window as any).Telegram?.WebApp) {
    init();
  }
} catch (error) {
  console.warn('Telegram SDK initialization failed:', error);
}

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
