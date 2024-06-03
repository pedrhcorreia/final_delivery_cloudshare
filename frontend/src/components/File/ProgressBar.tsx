import React from 'react';
import Spinner from '../Spinner'; 

interface ProgressBarProps {
  progress: number;
  fileName: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, fileName }) => {
  return (
    <div className="mt-4 relative border border-black p-2 rounded-lg bg-white flex justify-between items-center">
      <div style={{ width: '170%' }}>
        <div className="flex justify-between items-center">
          <span className="text-black">Uploading {fileName}</span>
          <span className="text-black">{progress.toFixed(2)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded mt-1 relative">
          <div
            className="h-2 bg-green-600 rounded absolute bottom-0"
            style={{ width: `${progress}%`, marginBottom: '3px' }}
          ></div>
        </div>
      </div>
      <div style={{ marginLeft: '2px' }}>
        <Spinner />
      </div>
    </div>
  );
};

export default ProgressBar;
