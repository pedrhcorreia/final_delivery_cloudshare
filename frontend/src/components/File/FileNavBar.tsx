import React, { useState, useRef } from 'react';
import FileUploadButton from './FileUploadButton';
import RefreshButton from './RefreshButton';
import ProgressBar from './ProgressBar';
import CreateFolderButton from './FolderCreateButton';
import { uploadFile, createEmptyFolder, initiateMultipartUpload, abortMultipartUpload, uploadPart, completeMultipartUpload } from '../../ApiCalls';
import { getCookie } from '../../utils/cookies';
import { useNavigate } from 'react-router-dom';
import { useCurrentDir } from '../../CurrentDirContext';
import ConfirmationDialog from './ConfirmDialog';

interface FileNavBarProps {
  setLoading: (loading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  setUploadingFileName: (fileName: string) => void;
  uploadProgress: number;
  uploadingFileName: string;
  showToast: (message: string, type: 'error' | 'success') => void;
  setCloseSideBar: () => void;
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabClick: (tabId: string) => void;
  loadFiles: (userId: number, accessToken: string) => void;
  doesFilenameExist: (filename: string, isFile: boolean) => string | null;
}

interface UploadFileState {
  file: File;
  progress: number;
  uploadPaused: boolean;
  uploadId?: string;
  canceled?: boolean;
  partNumber?: number;
  abortController?: AbortController;
}

const FileNavBar: React.FC<FileNavBarProps> = ({
  setLoading,
  setUploadProgress,
  setUploadingFileName,
  uploadProgress,
  uploadingFileName,
  showToast,
  setCloseSideBar,
  tabs,
  activeTab,
  onTabClick,
  loadFiles,
  doesFilenameExist
}) => {
  const navigate = useNavigate();
  const { currentDir } = useCurrentDir();

  const [uploadFiles, setUploadFiles] = useState<UploadFileState[]>([]);
  const [showUploads, setShowUploads] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [modifiedFileName, setModifiedFileName] = useState('');
  const [isFileUpload, setIsFileUpload] = useState(true);
  const uploadRefs = useRef<Map<string, UploadFileState>>(new Map());
  const CHUNK_SIZE = 5 * 1024 * 1024;

  const handlePauseResumeUpload = (uploadId?: string) => {
    if (uploadId) {
      setUploadFiles(prevUploads =>
        prevUploads.map(upload => {
          if (upload.uploadId === uploadId) {
            const updatedUpload = { ...upload, uploadPaused: !upload.uploadPaused };
            const updatedRef = uploadRefs.current.get(uploadId);
            if (updatedRef) {
              updatedRef.uploadPaused = updatedUpload.uploadPaused;
            }
            return updatedUpload;
          }
          return upload;
        })
      );
    }
  };
  
  
  


  const handleAbortUpload = async (file: File, uploadId?: string) => {
    try {
      if (uploadId) {
        const userIdStr = getCookie('userId');
        const accessToken = getCookie('accessToken');
        if (!userIdStr || !accessToken) {
          showToast('User ID or access token is missing', 'error');
          return;
        }
        await abortMultipartUpload(parseInt(userIdStr, 10), file.name, uploadId, accessToken);
        showToast(`Upload of ${file.name} canceled`, 'success');
        
        setUploadFiles((prevUploads) =>
          prevUploads.filter((upload) => upload.uploadId !== uploadId)
        );
        
        const uploadState = uploadRefs.current.get(uploadId);
        if (uploadState) {
          uploadState.canceled = true;
    
          
          if (uploadState.abortController) {
            uploadState.abortController.abort();
            uploadState.abortController = undefined; 
          }
          uploadRefs.current.delete(uploadId);
        }
      }
        
      setIsFileUpload(false);
      setCurrentFile(null);
    } catch (error) {
      console.error('Error canceling upload:', error);
      showToast('Failed to cancel upload', 'error');
    }
  };
  

  const handleFolderCreate = async (folderName: string) => {
    try {
      const accessToken = getCookie('accessToken');
      const userIdStr = getCookie('userId');
      const userId = userIdStr ? parseInt(userIdStr, 10) : null;
      if (!accessToken || userId === null || isNaN(userId)) {
        navigate('/auth');
        return;
      }

      let modifiedFolderName = currentDir + folderName;
      const existingFolderName = doesFilenameExist(modifiedFolderName, false);

      if (existingFolderName) {
        setIsFileUpload(false);
        setCurrentFile(null);
        setModifiedFileName(currentDir + existingFolderName);
        setShowDialog(true);
        return;
      } else {
        setLoading(true);
        await createEmptyFolder(userId, currentDir + folderName, accessToken);
        await loadFiles(userId, accessToken);
        setLoading(false);
        showToast(`Folder ${folderName} created successfully`, 'success');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      showToast('Failed to create folder', 'error');
    }
  };

  const handleRefreshFiles = async () => {
    const accessToken = getCookie('accessToken');
    const userIdStr = getCookie('userId');
    const userId = userIdStr ? parseInt(userIdStr, 10) : null;
    if (!accessToken || userId === null || isNaN(userId)) {
      navigate('/auth');
      return;
    }
    try {
      setCloseSideBar();
      await loadFiles(userId, accessToken);
      showToast('Files refreshed successfully', 'success');
    } catch (err) {
      console.error('Error refreshing files:', err);
      showToast('Failed to refresh files', 'error');
    }
  };

  const handleUploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const userIdStr = getCookie('userId');
      const userId = userIdStr ? parseInt(userIdStr, 10) : null;
      const accessToken = getCookie('accessToken');
      if (!userId || !accessToken) {
        showToast('User ID or access token is missing', 'error');
        return;
      }
  
      const fileInput = event.target;
      if (!fileInput.files || fileInput.files.length === 0) {
        showToast('No file selected', 'error');
        return;
      }
  
      const filesToUpload = Array.from(fileInput.files);
      fileInput.value = '';
  
      const uploadPromises = filesToUpload.map(async (file) => {
        let modifiedFileName = currentDir + file.name;
        const existingFileName = doesFilenameExist(file.name, true);
  
        if (existingFileName) {
          setIsFileUpload(true);
          setCurrentFile(file);
          setModifiedFileName(currentDir + existingFileName);
          setShowDialog(true);
          return;
        } else {
          if (file.size > CHUNK_SIZE) {
            await uploadSelectedFileInChunks(file, modifiedFileName, userId, accessToken);
          } else {
            await uploadSelectedFile(file, modifiedFileName, userId, accessToken);
          }
        }
      });
  
      // Wait for all uploads to complete
      await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading file:', error);
      showToast('Failed to upload file', 'error');
      setLoading(false);
    }
  };
  

  const uploadSelectedFile = async (file: File, modifiedFileName: string, userId: number, accessToken: string) => {
    const modifiedFile = new File([file], modifiedFileName, {
      type: file.type,
      lastModified: file.lastModified,
    });

    setUploadFiles((prevFiles) => [
      ...prevFiles,
      { file: modifiedFile, progress: 0, uploadPaused: false },
    ]);

    setUploadingFileName(modifiedFile.name);

    await uploadFile(userId, accessToken, modifiedFile, (progress: number) => {
      setUploadFiles((prevFiles) =>
        prevFiles.map((prevFile) =>
          prevFile.file === modifiedFile
            ? { ...prevFile, progress }
            : prevFile
        )
      );
    });

    await loadFiles(userId, accessToken);

    setUploadFiles((prevFiles) =>
      prevFiles.filter((prevFile) => prevFile.file !== modifiedFile)
    );

    showToast(`File ${modifiedFile.name} uploaded successfully`, 'success');
  };

  const uploadSelectedFileInChunks = async (
    file: File,
    modifiedFileName: string,
    userId: number,
    accessToken: string
  ) => {
    try {
      const { uploadId } = await initiateMultipartUpload(
        userId,
        modifiedFileName,
        file.type,
        accessToken
      );
  
      let partNumber = 1;
      let uploadedBytes = 0;
  
      const modifiedFile = new File([file], modifiedFileName, {
        type: file.type,
        lastModified: file.lastModified,
      });
  
      const uploadState: UploadFileState = {
        file: modifiedFile,
        progress: 0,
        uploadPaused: false,
        canceled: false,
        uploadId,
        partNumber,
      };
  
      setUploadFiles(prevUploads => [...prevUploads, uploadState]);
      uploadRefs.current.set(uploadId, uploadState);
  
      setUploadingFileName(modifiedFile.name);
  
      const readAndUploadNextChunk = async (start: number) => {
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const filePart = file.slice(start, end);
        const currentUpload = uploadRefs.current.get(uploadId);
  
        if (!currentUpload || currentUpload.canceled) {
          console.log(`Upload for ${modifiedFileName} canceled`);
          return;
        }
        while (currentUpload.uploadPaused) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          if (currentUpload.canceled) {
            console.log(`Upload for ${modifiedFileName} paused and then canceled`);
            return;
          }
        }
  
        const controller = new AbortController();
        currentUpload.abortController = controller;
  
        try {
          await uploadPart(
            userId,
            accessToken,
            modifiedFileName,
            uploadId,
            partNumber,
            filePart,
            controller
          );
        
          let progress = Math.floor((uploadedBytes / file.size) * 100);
          partNumber++;
          uploadedBytes += filePart.size;
          if(!currentUpload.uploadPaused){
            progress = Math.floor((uploadedBytes / file.size) * 100);
          }
  
          
          setUploadFiles(prevUploads =>
            prevUploads.map(prevFile =>
              prevFile.uploadId === uploadId ? { ...prevFile, progress } : prevFile
            )
          );
  
          if (end < file.size) {
            await readAndUploadNextChunk(end);
          } else {
            await completeMultipartUpload(userId, accessToken, modifiedFileName, uploadId);
            await loadFiles(userId, accessToken);
            setUploadFiles(prevFiles =>
              prevFiles.filter(prevFile => prevFile.uploadId !== uploadId)
            );
            uploadRefs.current.delete(uploadId);
            showToast(`File ${modifiedFileName} uploaded successfully`, 'success');
          }
        } catch (err) {
            console.error( err);
          
        }
      };
  
      await readAndUploadNextChunk(0);
  
    } catch (err) {
      console.error('Error initiating multipart upload:', err);
      showToast('Failed to initiate multipart upload', 'error');
    }
  };
  

  const handleConfirmUpload = async () => {
    if (isFileUpload && currentFile) {
      const userIdStr = getCookie('userId');
      const userId = userIdStr ? parseInt(userIdStr, 10) : null;
      const accessToken = getCookie('accessToken');
      setCurrentFile(null);
      setModifiedFileName('');
      setShowDialog(false);
      if (userId && accessToken) {
        if (currentFile.size > CHUNK_SIZE) {
          await uploadSelectedFileInChunks(currentFile, modifiedFileName, userId, accessToken);
        } else {
          await uploadSelectedFile(currentFile, modifiedFileName, userId, accessToken);
        }
      }
    } else {
      await confirmFolderCreate();
    }
  };

  const confirmFolderCreate = async () => {
    try {
      const accessToken = getCookie('accessToken');
      const userIdStr = getCookie('userId');
      const userId = userIdStr ? parseInt(userIdStr, 10) : null;
      if (!accessToken || userId === null || isNaN(userId)) {
        navigate('/auth');
        return;
      }
      setLoading(true);
      await createEmptyFolder(userId, modifiedFileName, accessToken);
      await loadFiles(userId, accessToken);
      setLoading(false);
      showToast(`Folder ${modifiedFileName} created successfully`, 'success');
    } catch (error) {
      console.error('Error creating folder:', error);
      showToast('Failed to create folder', 'error');
    } finally {
      setShowDialog(false);
    }
  };

  const handleCancelUpload = () => {
    showToast(`${isFileUpload ? `File ${currentFile?.name}` : `Folder creation`} canceled`, 'error');
    setCurrentFile(null);
    setModifiedFileName('');
    setShowDialog(false);
  };

  return (
    <div className="flex flex-col mb-0 relative">
      <div className="flex justify-between w-full items-end">
        <div className="flex h-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-2 py-1 border border-black focus:outline-none text-left ${
                activeTab === tab.id ? 'bg-customOrange text-black' : 'bg-gray-200 text-black'
              }`}
              onClick={() => onTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-4 relative">
          <RefreshButton onClick={handleRefreshFiles} />
          <CreateFolderButton onCreate={handleFolderCreate} />
          <FileUploadButton onUpload={handleUploadFile} />
  
          {uploadFiles.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowUploads(!showUploads)}
                className="mr-2 bg-gray-200 text-black px-2 py-1 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
           
              {showUploads && (
                <div className="absolute right-0 top-full mt-1 mr-2 z-50 bg-gray-200 p-4 rounded-lg shadow-lg" style={{ minWidth: '500px' }}>
                  <div className="font-bold text-lg mb-2">Uploads:</div>
                  {uploadFiles.map((upload, index) => (
                    <div key={index} className="mb-2">
                      <ProgressBar
                        progress={upload.progress}
                        fileName={upload.file.name}
                        onCancel={() => handleAbortUpload(upload.file, upload.uploadId)}
                        onPauseResume={() => handlePauseResumeUpload(upload.uploadId)}
                        uploadPaused={upload.uploadPaused}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {showDialog && (
        <ConfirmationDialog
          message={`File name already exists, would you like to upload it as '${modifiedFileName}'?`}
          onConfirm={handleConfirmUpload}
          onCancel={handleCancelUpload}
        />
      )}
    </div>
  );
  
};

export default FileNavBar;
