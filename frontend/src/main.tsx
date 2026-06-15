/// <reference types="vite/client" />
import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.tsx'
import './index.css'
import './lib/axiosInterceptor'
import { GlobalLoadingProvider } from './components/GlobalLoadingProvider'

// IMPORTANT: Replace with actual Google Client ID from .env
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '662754448460-l09v2cso0jovegsi7tib59uohsd2cjh8.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GlobalLoadingProvider>
        <App />
      </GlobalLoadingProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)

