import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`toast toast-${toast.type || 'success'}`}
        >
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <div style={{ flex: 1, fontSize: '0.875rem' }}>{toast.message}</div>
          <button 
            onClick={() => onDismiss(toast.id)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'currentColor', 
              cursor: 'pointer',
              opacity: 0.8
            }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
