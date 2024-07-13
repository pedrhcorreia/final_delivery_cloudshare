import React from 'react';

interface ConfirmationDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white p-4 shadow-md rounded w-80">
        <p className="text-lg font-semibold mb-4">{message}</p>
        <div className="flex justify-end">
          <button onClick={onCancel} className="mr-2 px-4 py-2 border rounded bg-gray-200 hover:bg-gray-300">No</button>
          <button onClick={onConfirm} className="px-4 py-2 border rounded bg-blue-600 text-white hover:bg-blue-700">Yes</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
