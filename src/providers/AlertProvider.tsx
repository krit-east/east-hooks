'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export interface AlertProps {
  message: string;
  description: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

interface AlertItem extends AlertProps {
  id: string;
  createdAt: number;
  exiting?: boolean;
}

interface AlertContextProps {
  alerts: AlertItem[];
  showAlert: (props: AlertProps) => void;
  closeAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export const useAlert = (): AlertContextProps => {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useAlert ต้องใช้ภายใน AlertProvider');
  return context;
};

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const showAlert = useCallback((props: AlertProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newAlert: AlertItem = { id, createdAt: Date.now(), ...props, duration: props.duration || 3000 };
    setAlerts(prev => [newAlert, ...prev]);

    if (props.duration !== 0) {
      setTimeout(() => closeAlert(id), newAlert.duration);
    }
  }, []);

  const closeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.map(alert => alert.id === id ? { ...alert, exiting: true } : alert));

    setTimeout(() => {
      setAlerts((prev) => prev.filter(alert => alert.id !== id));
    }, 300);
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      @keyframes countdown {
        from { width: 100%; }
        to { width: 0%; }
      }
    `;
    document.head.appendChild(style);

    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, showAlert, closeAlert }}>
      {children}
      <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '280px', maxWidth: '360px' }}>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            style={{
              background: '#1e1e1e',
              borderLeft: `4px solid ${alert.type === 'success' ? '#4CAF50' : alert.type === 'error' ? '#F44336' : alert.type === 'warning' ? '#FF9800' : '#2196F3'}`,
              padding: '0.8rem 1rem',
              borderRadius: '8px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
              animation: alert.exiting ? 'slideOut 0.3s ease forwards' : 'slideIn 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              fontSize: '0.9rem',
              color: '#fff',
            }}>
            <button
              onClick={() => closeAlert(alert.id)}
              style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}
            >×</button>
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: '#f5f5f5' }}>{alert.message}</div>
            <div style={{ color: '#ccc' }}>{alert.description}</div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, height: '3px', backgroundColor: alert.type === 'success' ? '#4CAF50' : alert.type === 'error' ? '#F44336' : alert.type === 'warning' ? '#FF9800' : '#2196F3', animation: `countdown ${alert.duration}ms linear forwards` }} />
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};

export default AlertProvider;
