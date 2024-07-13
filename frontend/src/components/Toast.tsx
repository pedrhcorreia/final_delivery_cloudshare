import React from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
  type: 'error' | 'success' | 'info';
}

const Toast: React.FC<ToastProps> = ({ message, onClose, type }) => {
  const toastColors = {
    error: {
      bg: 'bg-red-100',
      text: 'text-red-500',
    },
    success: {
      bg: 'bg-green-100',
      text: 'text-green-500',
    },
    info: {
      bg: 'bg-blue-100',
      text: 'text-blue-500',
    },
  };

  const { bg, text } = toastColors[type];

  return (
    <div
      className={`fixed bottom-4 left-4 p-4 ${bg} ${text} z-50 transition-opacity duration-300`}
      style={{
        maxWidth: 'calc(100vw - 32px)',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '12px',
        border: '2px solid black',
      }}
    >
      <div className="mr-2">{message}</div>
      <button
        className="text-black rounded-full hover:bg-white hover:text-gray-800 transition-colors duration-300"
        onClick={onClose}
      >
        <svg
          className="w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
