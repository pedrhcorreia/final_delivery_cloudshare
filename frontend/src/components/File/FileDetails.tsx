import React from 'react';
import { getFileType, extractFolderName, formatFileSize } from '../../utils/fileUtils';
import { downloadFile, deleteFile } from '../../ApiCalls'; 
import { getCookie } from '../../utils/cookies';

interface FileDetailsProps {
  file: any;
  onClose: () => void;
  onFileDelete: () => void; 
  onFileDownload: (filename: string) => void;
}


const FileDetails: React.FC<FileDetailsProps> = ({ file, onClose, onFileDelete, onFileDownload }) => {
  const handleDownload = () => {
    const userIdStr = getCookie('userId');
    const userId = userIdStr ? parseInt(userIdStr, 10) : null;
    downloadFile(userId as number, getCookie('accessToken') as string, file.objectKey)
      .then(() => {
        onFileDownload(file.objectKey);
        console.log('File downloaded successfully');
      })
      .catch((error) => {
        console.error('Error downloading file:', error);
      });
  };

  const handleDelete = () => {
    const userIdStr = getCookie('userId');
    const userId = userIdStr ? parseInt(userIdStr, 10) : null;
    deleteFile(userId as number, getCookie('accessToken') as string, file.objectKey)
      .then(() => {
        console.log('File deleted successfully');
        onFileDelete(); 
      })
      .catch((error) => {
        console.error('Error deleting file:', error);
      });
  };

  const fileType = getFileType(file.objectKey);
  const isFolder = fileType === 'Folder';
  const formattedSize = formatFileSize(file.size);

  return (
    <div className="bg-gray-100 p-2 rounded z-50 w-350 h-600 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold mb-0 text-black" style={{ width: '300px' }}>Details</h2>
        <button onClick={onClose} className="p-1 bg-red-600 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <hr className="mb-2" />
      <div className="flex-grow">
        <p className="mb-1 text-black text-sm" style={{ width: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={file.objectKey}>
          <span className="font-semibold">Name:</span> {extractFolderName(file.objectKey)}
        </p>
        {!isFolder && (
          <p className="mb-1 text-black text-sm" style={{ width: '300px' }}>
            <span className="font-semibold">Size:</span> {formattedSize}
          </p>
        )}
        <p className="mb-1 text-black text-sm" style={{ width: '300px' }}>
          <span className="font-semibold">Type:</span> {fileType}
        </p>
        <p className="mb-1 text-black text-sm" style={{ width: '300px' }}>
          <span className="font-semibold">Owned By:</span> {getCookie('username')}
        </p>
      </div>
      <div className="flex justify-between items-center">
        {!isFolder && (
          <button onClick={handleDownload} className="bg-gray-300 hover:bg-customOrange text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center text-sm" style={{ width: '140px' }}>
            <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
            </svg>
            <span>Download</span>
          </button>
        )}
        <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded inline-flex items-center text-sm" style={{ width: '140px' }}>
          <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 18a2 2 0 002-2h0-4a2 2 0 002 2zM4 5a1 1 0 011-1h10a1 1 0 011 1v1h-1V5H5v1H4V5zM7 7h6v9a1 1 0 01-1 1H8a1 1 0 01-1-1V7z" clipRule="evenodd" />
          </svg>
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default FileDetails;
