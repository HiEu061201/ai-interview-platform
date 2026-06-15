import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
}

const LoadingContext = createContext<LoadingContextType>({ isLoading: false, loadingMessage: '' });

export const useLoading = () => useContext(LoadingContext);

// Track active requests
let activeRequests = 0;
let setGlobalLoading: ((loading: boolean) => void) | null = null;
let setGlobalMessage: ((msg: string) => void) | null = null;
let requestStartTimes: Map<string, number> = new Map();

// Slow request threshold (ms)
const SLOW_REQUEST_THRESHOLD = 3000;

export function GlobalLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [serverWaking, setServerWaking] = useState(false);

  useEffect(() => {
    setGlobalLoading = setIsLoading;
    setGlobalMessage = setLoadingMessage;

    // --- Axios request interceptor: track start time ---
    const reqInterceptor = axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const id = `${config.method}-${config.url}-${Date.now()}`;
      (config as any)._requestId = id;
      requestStartTimes.set(id, Date.now());
      activeRequests++;
      setIsLoading(true);
      setLoadingMessage('Processing...');
      return config;
    });

    // --- Axios response interceptor: clear loading ---
    const resInterceptor = axios.interceptors.response.use(
      (response: AxiosResponse) => {
        const id = (response.config as any)._requestId;
        requestStartTimes.delete(id);
        activeRequests = Math.max(0, activeRequests - 1);
        if (activeRequests === 0) {
          setIsLoading(false);
          setLoadingMessage('');
        }
        return response;
      },
      (error) => {
        const id = error?.config?._requestId;
        if (id) requestStartTimes.delete(id);
        activeRequests = Math.max(0, activeRequests - 1);
        if (activeRequests === 0) {
          setIsLoading(false);
          setLoadingMessage('');
        }
        return Promise.reject(error);
      }
    );

    // --- Slow request detector: update message if request takes too long ---
    const slowCheckInterval = setInterval(() => {
      if (activeRequests > 0) {
        const now = Date.now();
        for (const [, startTime] of requestStartTimes) {
          if (now - startTime > SLOW_REQUEST_THRESHOLD) {
            setLoadingMessage('Server is waking up, please wait...');
            break;
          }
        }
      }
    }, 1000);

    // --- Warm-up ping on app load ---
    const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://ai-interview-backend-ns52.onrender.com/api' : 'http://localhost:8080/api');
    
    // Silent warm-up: fire a lightweight GET to wake up Render
    fetch(`${API_BASE}/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => {});

    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
      clearInterval(slowCheckInterval);
      setGlobalLoading = null;
      setGlobalMessage = null;
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, loadingMessage }}>
      {children}
      {/* Global Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)',
          transition: 'opacity 0.3s ease',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px 48px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            animation: 'fadeInUp 0.3s ease',
          }}>
            {/* Spinner */}
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #4f46e5',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{
              color: '#334155',
              fontSize: '16px',
              fontWeight: 600,
              margin: 0,
              fontFamily: 'Inter, sans-serif',
            }}>
              {loadingMessage || 'Processing...'}
            </p>
            {loadingMessage.includes('waking') && (
              <p style={{
                color: '#94a3b8',
                fontSize: '13px',
                margin: 0,
                fontFamily: 'Inter, sans-serif',
                maxWidth: '280px',
                textAlign: 'center',
              }}>
                Free-tier server sleeps after inactivity. This only takes a moment.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Inline CSS animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </LoadingContext.Provider>
  );
}
