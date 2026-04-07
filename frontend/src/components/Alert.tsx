'use client';

import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AlertProps {
  message: string;
  type: 'error' | 'success' | 'info';
  autoClose?: number;
  onClose?: () => void;
}

export function Alert({ message, type, autoClose = 5000, onClose }: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, isVisible, onClose]);

  if (!isVisible) return null;

  const bgColor = {
    error: 'bg-red-50 border-red-200',
    success: 'bg-green-50 border-green-200',
    info: 'bg-blue-50 border-blue-200'
  }[type];

  const textColor = {
    error: 'text-red-800',
    success: 'text-green-800',
    info: 'text-blue-800'
  }[type];

  const Icon = type === 'error' ? AlertCircle : CheckCircle;

  return (
    <div className={`border rounded-lg p-4 flex items-start gap-3 ${bgColor}`}>
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${textColor === 'text-red-800' ? 'text-red-600' : textColor === 'text-green-800' ? 'text-green-600' : 'text-blue-600'}`} />
      <div className="flex-1">
        <p className={`font-medium ${textColor}`}>{message}</p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className={`p-1 rounded hover:bg-black/10 ${textColor}`}
      >
        <X size={18} />
      </button>
    </div>
  );
}

interface AlertContainerProps {
  error?: string;
  success?: string;
  onErrorClose?: () => void;
  onSuccessClose?: () => void;
}

export function AlertContainer({ error, success, onErrorClose, onSuccessClose }: AlertContainerProps) {
  return (
    <div className="space-y-3">
      {error && (
        <Alert
          message={error}
          type="error"
          autoClose={5000}
          onClose={onErrorClose}
        />
      )}
      {success && (
        <Alert
          message={success}
          type="success"
          autoClose={5000}
          onClose={onSuccessClose}
        />
      )}
    </div>
  );
}
