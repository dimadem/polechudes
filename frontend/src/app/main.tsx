import { createRoot } from 'react-dom/client'
// import { init } from '@telegram-apps/sdk-react';
import './index.css'
import App from './App.tsx'

// init();

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <App />
)
