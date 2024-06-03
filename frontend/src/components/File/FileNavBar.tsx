import React from 'react';
import FileUploadButton from './FileUploadButton';
import RefreshButton from './RefreshButton';
import ProgressBar from './ProgressBar';
import CreateFolderButton from './FolderCreateButton';
import { fetchUserFiles, uploadFile, createEmptyFolder } from '../../ApiCalls';
import { getCookie } from '../../utils/cookies';
import { useNavigate } from 'react-router-dom';
import {useCurrentDir } from '../../CurrentDirContext';

interface FileNavBarProps {
  setFiles: (files: any[]) => void;
  setLoading: (loading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  setUploadingFileName: (fileName: string) => void;
  uploadProgress: number;
  uploadingFileName: string;
  showToast: (message: string, type: 'error' | 'success') => void;
  setCloseSideBar: () => void;
  tabs: { id: string; label: string; }[];
  activeTab: string;
  onTabClick: (tabId: string) => void;
}


const FileNavBar: React.FC<FileNavBarProps> = ({
  setFiles,
  setLoading,
  setUploadProgress,
  setUploadingFileName,
  uploadProgress,
  uploadingFileName,
  showToast,
  setCloseSideBar,
  tabs,
  activeTab,
  onTabClick
}) => {
  
  const navigate = useNavigate();
  const { currentDir } = useCurrentDir(); 
  const handleFolderCreate = async (folderName: string) => {
    try {
      const accessToken = getCookie('accessToken');
      const userIdStr = getCookie('userId');
      const userId = userIdStr ? parseInt(userIdStr, 10) : null;
      if (!accessToken || userId === null || isNaN(userId)) {
        navigate('/auth');
        return;
      }
      setLoading(true)
      await createEmptyFolder(userId, currentDir+folderName, accessToken);
    
      const response = await fetchUserFiles(userId, accessToken );
      setFiles(response);
      setLoading(false);
      showToast(`Folder ${folderName} created successfully`, 'success');
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
      setLoading(true);
      setCloseSideBar();
      const response = await fetchUserFiles(userId, accessToken);
      setFiles(response);
      setLoading(false);
      showToast('Files refreshed successfully', 'success');
    } catch (err) {
      console.error('Error refreshing files:', err);
      showToast('Failed to refresh files', 'error');
      setLoading(false);
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

      const file = fileInput.files[0];
      const modifiedFileName = currentDir+file.name;
      console.log(modifiedFileName);
      const modifiedFile = new File([file], modifiedFileName, {
        type: file.type,
        lastModified: file.lastModified,
      });
      setUploadingFileName(modifiedFile.name);
      setUploadProgress(0);

      await uploadFile(userId, accessToken, modifiedFile, (progress: number) => {
        setUploadProgress(progress);
      });

      setUploadProgress(0);
      setLoading(true);
      const response = await fetchUserFiles(userId, accessToken);
      setFiles(response);
      setLoading(false);
      showToast(`File ${modifiedFile.name} uploaded successfully`, 'success');
    } catch (error) {
      console.error('Error uploading file:', error);
      showToast('Failed to upload file', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col mb-0">
      <div className="flex justify-between w-full">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`px-4 py-1 border border-black focus:outline-none text-left ${activeTab === tab.id ? 'bg-customOrange text-black' : 'bg-whie text-black'}`}
              onClick={() => onTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          <RefreshButton onClick={handleRefreshFiles} />
          <CreateFolderButton onCreate = {handleFolderCreate}/>
          <FileUploadButton onUpload={handleUploadFile} />
        </div>
      </div>
      {uploadProgress > 0 && (
        <div className="mt-2 w-full">
          <ProgressBar progress={uploadProgress} fileName={uploadingFileName} />
        </div>
      )}
    </div>
  );
};

export default FileNavBar;