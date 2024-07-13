import React, { useState, useEffect } from 'react';
import { getFileType,  formatFileSize, formatLastModified, getFileIcon, getCleanFileName } from '../../utils/fileUtils';
import {  downloadFileStream, deleteFile, deleteFileShare, renameFile } from '../../ApiCalls';
import { getCookie } from '../../utils/cookies';
import Spinner from '../../components/Spinner';
import ConfirmationDialog from './ConfirmDialog';

interface FileDetailsProps {
  file: any;
  onClose?: () => void;
  onFileDelete?: () => void;
  onFileDownload?: (filename: string) => void;
  onFileShare?: () => void;
  onFileShareDelete?: (fileShareId: number, objectKey: string) => void;
  setNewFileName?: (newFileName: string | null) => void; 
  hasDuplicateFileSharingIds?: (file:any) => boolean;
  readOnly : boolean;
  notRoot: boolean;
}

const FileDetails: React.FC<FileDetailsProps> = ({
  file,
  onClose,
  onFileDelete,
  onFileDownload,
  onFileShare,
  onFileShareDelete,
  setNewFileName,
  readOnly,
  notRoot,
  hasDuplicateFileSharingIds

}) => {
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const userIdFromCookie = getCookie('userId');
  const accessTokenFromCookie = getCookie('accessToken');
  const fileIcon = getFileIcon(file.objectKey);
  const [newFileNameInput, setNewFileNameInput] = useState(getCleanFileName(file.objectKey)); 
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [fileShareToDelete, setFileShareToDelete] = useState<any | null>(null);
  useEffect(() => {
    setNewFileNameInput(file.objectKey); 
  }, [file]);

  const handleDownload = () => {
    if (onFileDownload) {
      const userId = file.fileSharing === undefined ? (userIdFromCookie ? parseInt(userIdFromCookie, 10) : null) : file.fileSharing.sharedByUserId;
      downloadFileStream(userId as number, accessTokenFromCookie as string, file.objectKey)
        .then(() => {
          onFileDownload(file.objectKey);
          console.log('File downloaded successfully');
        })
        .catch((error) => {
          console.error('Error downloading file:', error);
        });
    }
  };

  const handleDelete = () => {
    if (onFileDelete) {
      const userId = userIdFromCookie ? parseInt(userIdFromCookie, 10) : null;

      setDeleting(true);

      deleteFile(userId as number, accessTokenFromCookie as string, file.objectKey)
        .then(() => {
          console.log('File deleted successfully');
          setDeleting(false);
          onFileDelete();
        })
        .catch((error) => {
          console.error('Error deleting file:', error);
          setDeleting(false);
        });
    }
  };

  const handleFileRename = () => {
    setIsLoading(true);
    const userId = userIdFromCookie ? parseInt(userIdFromCookie, 10) : null;
    const replaceStr= file.objectKey.replace(getCleanFileName(file.objectKey), newFileNameInput);
    console.log(replaceStr);
    renameFile(userId as number, accessTokenFromCookie as string, file.objectKey, replaceStr)
      .then(() => {
        console.log('File renamed successfully');
        setIsLoading(false);
        setIsEditing(false);
        if (setNewFileName) {
          setNewFileName(newFileNameInput);
        }
      })
      .catch((error) => {
        console.error('Error renaming file:', error);
        setIsLoading(false);
        setNewFileNameInput(file.objectKey); 
      });
  };

  const handleMoveToRoot = () =>{
    const rootName = getCleanFileName(file.objectKey) +( getFileType(file.objectKey)==="Folder"? '/' :'');
    const userId = userIdFromCookie ? parseInt(userIdFromCookie, 10) : null;
    renameFile(userId as number, accessTokenFromCookie as string, file.objectKey, rootName)
      .then(() => {
        console.log('File renamed successfully');
        if (setNewFileName) {
          setNewFileName(rootName);
        }
      })
      .catch((error) => {
        console.error('Error renaming file:', error);
        setIsLoading(false);
        setNewFileNameInput(file.objectKey); 
      });
  }

  const handleFileShareDelete = (fileShareId: number, objectKey: string) => {
    if (hasDuplicateFileSharingIds && hasDuplicateFileSharingIds(file)) {
      setShowConfirmation(true);
      setFileShareToDelete(fileShareId)
    } else {
      performFileShareDelete();
    }
  };

  const performFileShareDelete = () => {
    deleteFileShare(parseInt(userIdFromCookie as string, 10), fileShareToDelete, accessTokenFromCookie as string)
      .then((response) => {
        console.log(response);
        if (onFileShareDelete) {
          onFileShareDelete(fileShareToDelete, file.objectKey);
        }
        setFileShareToDelete(null);
        console.log(`File share ${fileShareToDelete} deleted successfully`);
      })
      .catch((error) => {
        console.error(`Error deleting file share ${fileShareToDelete}:`, error);
      });
  };

  const handleConfirmDelete = () => {
    setShowConfirmation(false);
    performFileShareDelete();
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setNewFileNameInput(file.objectKey);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewFileNameInput(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleFileRename();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const fileType = getFileType(file.objectKey);
  const isFolder = fileType === 'Folder';
  const formattedSize = formatFileSize(file.size);

  return (
    <div className="bg-gray-100 p-2 rounded z-50 w-350 h-600 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold mb-0 text-black" style={{ width: '300px' }}>Details</h2>
        {onClose && (
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
        )}
      </div>
      <hr className="mb-2" />
      <div className="flex-grow">
        <img src={fileIcon} alt="File icon" className="w-16 h-16" />
        <div className="mb-1 text-black text-sm" style={{ width: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={file.objectKey}>
          <span className="font-semibold">Name:</span>
          {isEditing ? (
            <>
              <input
                type="text"
                value={getCleanFileName(newFileNameInput)}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                className="border-b border-gray-500 focus:outline-none"
                style={{ width: '200px' }}
              />
              <button onClick={handleFileRename} className="ml-2 text-blue-600 hover:text-blue-800">✓</button>
              {isLoading && <Spinner />} 
            </>
          ) : (
            <>
              <span onClick={handleEditClick} style={{ cursor: 'pointer' }}>
                {getCleanFileName(file.objectKey)}
              </span>
              {!readOnly &&(
                <>
                  <button onClick={handleEditClick} className="ml-2 text-blue-600 hover:text-blue-800">✎</button>
                </>
              )}
              
              
            </>
          )}
        </div>

        {!isFolder && (
          <p className="mb-1 text-black text-sm" style={{ width: '300px' }}>
            <span className="font-semibold">Size:</span> {formattedSize}
          </p>
        )}
        <p className="mb-1 text-black text-sm" style={{ width: '300px' }}>
          <span className="font-semibold">Type:</span> {fileType}
        </p>
        <p className="mb-1 text-black text-sm" style={{ width: '300px' }}>
          <span className="font-semibold">Last Modified:</span> {formatLastModified(file.lastModified)}
        </p>
        {file.fileSharing ? (
          <>
            {parseInt(userIdFromCookie as string) === (Array.isArray(file.fileSharing) ? file.fileSharing[0].sharedByUserId : file.fileSharing.sharedByUserId) ? (
              <>
                <p className="mb-1 text-black text-sm" style={{ width: '300px' }}>
                  <span className="font-semibold">Owned By:</span> {getCookie('username')}
                </p>
                <div className="mb-1 text-black text-sm" style={{ width: '300px' }}>
                  <span className="font-semibold">Shared to:</span>
                  <ul className="list-disc pl-5">
                    {Array.isArray(file.fileSharing) ? (
                      file.fileSharing.map((sharingInfo: any, index: number) => (
                        <li key={index} className="flex items-center">
                          <img src="/icons/avatar-icon.png" alt="User Icon" className="w-5 h-5 rounded-full mr-2" />
                          {sharingInfo.sharedToUsername}
                          <button
                            onClick={() => handleFileShareDelete(sharingInfo.id, file.objectKey)}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            &times;
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-center">
                        {file.fileSharing.sharedToUserId}
                        <button
                          onClick={() => handleFileShareDelete(file.fileSharing.id, file.objectKey)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          &times;
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              </>
            ) : (
              <p className="mb-1 text-black text-sm" style={{ width: '300px' }}>
                <span className="font-semibold">Shared By:</span> {file.fileSharing.sharedByUsername}
              </p>
            )}
          </>
        ) : (
          <p className="mb-1 text-black text-sm" style={{ width: '300px' }}>
            <span className="font-semibold">Owned By:</span> {getCookie('username')}
          </p>
        )}
      </div>
      <div className="flex flex-col items-left space-y-2">
        {!isFolder && onFileDownload && !deleting && (
          <button onClick={handleDownload} className="bg-gray-300 hover:bg-gray-500 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center text-sm" style={{ width: '170px' }}>
            <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
            </svg>
            <span>Download</span>
          </button>
        )}
        {file.fileSharing === undefined && onFileShare && (
          <>
            {!deleting && onFileDelete ? (
              <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded inline-flex items-center text-sm" style={{ width: '170px' }}>
                <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 18a2 2 0 002-2h0-4a2 2 0 002 2zM4 5a1 1 0 011-1h10a1 1 0 011 1v1h-1V5H5v1H4V5zM7 7h6v9a1 1 0 01-1 1H8a1 1 0 01-1-1V7z" clipRule="evenodd" />
                </svg>
                <span>Delete</span>
              </button>
            ) : (
              <div className="bg-red-600 text-white font-bold py-2 px-4 rounded inline-flex items-center text-sm" style={{ width: '170px' }}>
                <Spinner />
              </div>
            )}
            <button onClick={onFileShare} className="bg-customBlue hover:bg-blue-800 text-black font-bold py-2 px-4 rounded inline-flex items-center text-sm" style={{ width: '170px' }}>
              <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path fillRule="evenodd" clipRule="evenodd" d="M13.803 5.33333C13.803 3.49238 15.3022 2 17.1515 2C19.0008 2 20.5 3.49238 20.5 5.33333C20.5 7.17428 19.0008 8.66667 17.1515 8.66667C16.2177 8.66667 15.3738 8.28596 14.7671 7.67347L10.1317 10.8295C10.1745 11.0425 10.197 11.2625 10.197 11.4872C10.197 11.9322 10.109 12.3576 9.94959 12.7464L15.0323 16.0858C15.6092 15.6161 16.3473 15.3333 17.1515 15.3333C19.0008 15.3333 20.5 16.8257 20.5 18.6667C20.5 20.5076 19.0008 22 17.1515 22C15.3022 22 13.803 20.5076 13.803 18.6667C13.803 18.1845 13.9062 17.7255 14.0917 17.3111L9.05007 13.9987C8.46196 14.5098 7.6916 14.8205 6.84848 14.8205C4.99917 14.8205 3.5 13.3281 3.5 11.4872C3.5 9.64623 4.99917 8.15385 6.84848 8.15385C7.9119 8.15385 8.85853 8.64725 9.47145 9.41518L13.9639 6.35642C13.8594 6.03359 13.803 5.6896 13.803 5.33333Z" fill="#1C274C" />
              </svg>
              <span>Share</span>
            </button>
            {!readOnly && notRoot && (
              <button
                onClick={handleMoveToRoot}
                className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded inline-flex items-center text-sm" style={{ width: '170px' }}>
    
                  <span>Move to Root</span>
              </button>
            )}
          </>
        )}
      </div>
      {showConfirmation && (
        <ConfirmationDialog
          message="This file/folder was shared as part of a folder, undoing this will remove this uses access to all contents of the folder originally shared, proceed?"
          onConfirm={() => {handleConfirmDelete(); 
            }}
          onCancel={() => { handleCancelDelete();
            }
          }
        />
      )}
    </div>
  );
};

export default FileDetails;
