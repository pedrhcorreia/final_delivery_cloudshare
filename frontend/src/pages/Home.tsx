import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserFiles  } from '../ApiCalls';
import { getCookie, eraseCookie } from '../utils/cookies';
import NavigationBar from '../components/NavigationBar';
import Toast from '../components/Toast';
import { getFileType } from '../utils/fileUtils';
import FileDetails from '../components/File/FileDetails';
import FileGrid from '../components/File/FileGrid';
import FileNavBar from '../components/File/FileNavBar';
import GroupCollapse from '../components/group/GroupCollapse';
import { useCurrentDir } from '../CurrentDirContext';
import DirectoryNavigationBar from '../components/File/DirectoryNavigationBar';


const Home: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadingFileName, setUploadingFileName] = useState<string>('');
  const [sidebarPosition, setSidebarPosition] = useState<{ left: number; top: number } | null>(null);

  const navBarStart = ':/';
  const navigate = useNavigate();
  const { currentDir, setCurrentDir } = useCurrentDir();
  const [filteredFiles, setFilteredFiles] = useState<any[]>([]);  
  const [inputValue, setInputValue] = useState(navBarStart + currentDir);


  const [activeTab, setActiveTab] = useState<string>('myFiles');
  const tabs = [
    { id: 'myFiles', label: 'My Files' },
    { id: 'sharedToMe', label: 'Shared To Me' },
    { id: 'sharedByMe', label: 'Shared By Me' },
  ];
  




  useEffect(() => {
    const accessToken = getCookie('accessToken');
    const userIdStr = getCookie('userId');
    const userId = userIdStr ? parseInt(userIdStr, 10) : null;

    if (!accessToken || userId === null || isNaN(userId)) {
      navigate('/auth');
    } else {
      fetchUserFiles(userId, accessToken)
        .then((response) => {
          setFiles(response);
          setLoading(false);
        })
        .catch((err) => {
          setToast({ message: 'Failed to load user info', type: 'error' });
          setLoading(false);
          eraseCookie('accessToken');
          eraseCookie('userId');
          eraseCookie('username');
          navigate('/auth');
        });
    }
  }, [navigate]);

  useEffect(() => {
 
    const filtered = files.filter((file) => {
      if (!file.objectKey.startsWith(currentDir) || file.objectKey === currentDir) return false; 
      
      const remaining = file.objectKey.substring(currentDir.length); 
      let foundSlash = false;
    
      for (let i = 0; i < remaining.length; i++) {
        if (remaining[i] === '/') {
          foundSlash = true;
        } else if (foundSlash) {
          return false;
        }
      }
      
      return true; 
    });
    
    
    setFilteredFiles(filtered);
  }, [currentDir, files]);
  
  
  

  const handleToastClose = () => {
    setToast(null);
  };

  const handleFileClick = (file: any, event: React.MouseEvent<HTMLDivElement>) => {
    if (event.detail === 2) {
  
      if (getFileType(file.objectKey) === 'Folder') {
        setCurrentDir(file.objectKey);
        setInputValue(navBarStart+file.objectKey);
      }
      setSelectedFile(null);
      return; 
    }

    setSelectedFile(file);
    const rect = event.currentTarget.getBoundingClientRect();
    const sidebarWidth = 350; 
    const sidebarHeight = 400; 

    const availableSpaceRight = window.innerWidth - rect.right;
    const availableSpaceLeft = rect.left;
    const availableSpaceTop = rect.top;
    const availableSpaceBottom = window.innerHeight - rect.bottom;


    let leftPosition;
    if (availableSpaceRight >= sidebarWidth) {
      leftPosition = rect.right;
    } else if (availableSpaceLeft >= sidebarWidth) {
      leftPosition = rect.left - sidebarWidth;
    } else {
      leftPosition = rect.right;
    }


    let topPosition;
    if (availableSpaceBottom >= sidebarHeight) {
      topPosition = rect.top;
    } else if (availableSpaceTop >= sidebarHeight) {
      topPosition = rect.bottom - sidebarHeight;
    } else {
      topPosition = rect.top;
    }
    setSidebarPosition({ left: leftPosition, top: topPosition });
  };

  const handleFileDelete = () => {
    setToast({ message: `File was deleted successfully`, type: 'success' });
    setSelectedFile(null);
    const accessToken = getCookie('accessToken');
    const userIdStr = getCookie('userId');
    const userId = userIdStr ? parseInt(userIdStr, 10) : null;
  
    if (accessToken && userId !== null && !isNaN(userId)) {
      fetchUserFiles(userId, accessToken)
        .then((response) => {
          setSelectedFile(null);
          setFiles(response);
        })
        .catch((err) => {
          console.error('Error fetching user files:', err);
          setToast({ message: 'Failed to refresh files', type: 'error' });
        });
    }
  };

  const handleSubmitValue= (value: string) =>{
    setInputValue(value);
  }

  const handleCloseSidebar = () => {
    setSelectedFile(null);
    setSidebarPosition(null);
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setSelectedFile(null);
    //TODO add logic here for different files yada yada you will remember
  };

  const handleFileDownload = (fileName : string) =>{
    setToast({ message: `File ${fileName} was downloaded successfully`, type: 'success' });
    setSelectedFile(null);
    setSidebarPosition(null);
  }



  return (
    <div className="min-h-screen bg-gray-100 text-black flex flex-col overflow-hidden">
      <NavigationBar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-5/6 flex flex-col items-center overflow-hidden">
          <div className="bg-white p-6 rounded shadow-md w-full overflow-y-auto">
            <div className="w-full ">
              <FileNavBar
                setFiles={setFiles}
                setLoading={setLoading}
                setUploadProgress={setUploadProgress}
                setUploadingFileName={setUploadingFileName}
                setCloseSideBar={handleCloseSidebar}
                uploadProgress={uploadProgress}
                uploadingFileName={uploadingFileName}
                showToast={(message, type) => setToast({ message, type })} 
                tabs={tabs}
                activeTab={activeTab}
                onTabClick={handleTabClick}
              />
            </div>
            <DirectoryNavigationBar inputValue={inputValue} handleSubmitValue={handleSubmitValue} />
            <div className="w-full">
              {activeTab === 'myFiles' ? (
                <FileGrid
                  files={filteredFiles}
                  selectedFile={selectedFile}
                  onFileClick={handleFileClick}
                  loading={loading}
                />
              ) : (
                <div className="w-full p-6 rounded shadow-md bg-gray-200 text-black" style={{ minHeight: '700px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <p style={{ textAlign: 'center' }}>Not implemented</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-1/6">
          <GroupCollapse />
        </div>
      </div>
      {selectedFile && sidebarPosition && (
        <div id="file-sidebar" className="p-4 rounded bg-backgroundBlueCustom shadow-md mt-4" style={{ position: 'fixed', left: sidebarPosition.left, top: sidebarPosition.top, boxShadow: '0 4px 6px rgba(0, 175, 239, 0.5)' }}>
          <FileDetails file={selectedFile} onClose={handleCloseSidebar} onFileDelete={handleFileDelete} onFileDownload={handleFileDownload} />
        </div>
      )}
      {toast && <Toast message={toast.message} onClose={handleToastClose} type={toast.type} />}
    </div>
  )
  
}

export default Home;
