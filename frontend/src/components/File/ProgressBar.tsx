import React from 'react';
import Spinner from '../Spinner';

interface ProgressBarProps {
  progress: number;
  fileName: string;
  onCancel?: () => void;
  onPauseResume?: () => void;
  uploadPaused?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  fileName,
  onCancel,
  onPauseResume,
  uploadPaused,
}) => {
  return (
    <div className="mt-4 relative border border-black p-2 rounded-lg bg-white flex justify-between items-center">
      <div style={{ width: '100%' }}>
        <div className="flex justify-between items-center">
          <span className="text-black">{fileName}</span>
          <span className="text-black">{progress.toFixed(2)}%</span>
        
        </div>
        <div className="h-2 bg-gray-200 rounded mt-1 relative">
          <div
            className="h-2 bg-green-600 rounded absolute bottom-0"
            style={{ width: `${progress}%`, marginBottom: '3px' }}
          ></div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {!uploadPaused  && <Spinner />}
        {onPauseResume && (
          <button onClick={onPauseResume} className="rounded-full bg-blue-500 text-white p-1">
            {uploadPaused ? (
              <svg height="20px" width="20px" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" 
                  viewBox="0 0 512 512"  xmlSpace="preserve">
                <style type="text/css">
             
                </style>
                <g>
                  <path className="st0" d="M256,0C114.625,0,0,114.625,0,256c0,141.374,114.625,256,256,256c141.374,0,256-114.626,256-256
                    C512,114.625,397.374,0,256,0z M351.062,258.898l-144,85.945c-1.031,0.626-2.344,0.657-3.406,0.031
                    c-1.031-0.594-1.687-1.702-1.687-2.937v-85.946v-85.946c0-1.218,0.656-2.343,1.687-2.938c1.062-0.609,2.375-0.578,3.406,0.031
                    l144,85.962c1.031,0.586,1.641,1.718,1.641,2.89C352.703,257.187,352.094,258.297,351.062,258.898z"/>
                </g>
                </svg>
            ) : (
            <svg fill="#000000" height="20px" width="20px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" 
              viewBox="0 0 512 512" xmlSpace="preserve">
            <path d="M256,0C114.617,0,0,114.615,0,256s114.617,256,256,256s256-114.615,256-256S397.383,0,256,0z M224,320
              c0,8.836-7.164,16-16,16h-32c-8.836,0-16-7.164-16-16V192c0-8.836,7.164-16,16-16h32c8.836,0,16,7.164,16,16V320z M352,320
              c0,8.836-7.164,16-16,16h-32c-8.836,0-16-7.164-16-16V192c0-8.836,7.164-16,16-16h32c8.836,0,16,7.164,16,16V320z"/>
            </svg>
                        )}
          </button>

        )}
        {onCancel && (
          <button onClick={onCancel} className="rounded-full bg-red-500 text-white p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
