import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { captureRefFromUrl } from './lib/affiliate'
import { registerServiceWorker } from './lib/pwa'
import './index.css'

// Capture ?ref= before the first render so the code is available to
// every route, including the signup and checkout flows.
captureRefFromUrl()

registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
