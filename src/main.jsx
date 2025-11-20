import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import './index.css'
import Root from './Root.jsx';

if (import.meta.env.PROD) {
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    for (let key in window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] =
        typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] === "function"
          ? () => {}
          : null;
    }
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
