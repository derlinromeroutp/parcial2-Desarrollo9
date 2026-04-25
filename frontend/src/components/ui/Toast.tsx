import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';

interface ToastItem {
  id: number;
  message: string;
  type?: 'default' | 'success' | 'error';
}

interface ToastContextType {
  showToast: (message: string, type?: ToastItem['type']) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

const typeColors: Record<string, string> = {
  default: 'var(--ink)',
  success: 'var(--success)',
  error: 'var(--error)',
};

const SingleToast: React.FC<{ item: ToastItem; onDone: (id: number) => void }> = ({ item, onDone }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible) {
      const t = setTimeout(() => onDone(item.id), 300);
      return () => clearTimeout(t);
    }
  }, [visible, item.id, onDone]);

  return (
    <div style={{
      background: 'var(--white)',
      border: '0.5px solid var(--line)',
      borderRadius: 8,
      padding: '10px 16px',
      fontSize: '0.825rem',
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      color: typeColors[item.type || 'default'],
      animation: visible ? 'slideUpFade 0.3s ease both' : 'fadeIn 0.3s ease reverse both',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
    }}>
      {item.message}
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  let counter = React.useRef(0);

  const showToast = useCallback((message: string, type: ToastItem['type'] = 'default') => {
    const id = ++counter.current;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        alignItems: 'center',
        zIndex: 9999,
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <SingleToast key={t.id} item={t} onDone={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
