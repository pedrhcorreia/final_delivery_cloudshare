import React from 'react';

interface RefreshButtonProps {
  onClick: () => void;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ onClick }) => {
  return (
    <div className="flex justify-end mb-4">
      <button
        className="bg-gray-300 hover:bg-customBlue text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center mr-2"
        onClick={onClick}
      >
        <img src='/icons/refresh.svg' alt="Refresh" className="w-6 h-6 mr-2" />
      </button>
    </div>
  );
};

export default RefreshButton;
