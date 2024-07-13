import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserFiles, getFilesSharedByUser, getFilesSharedToUser, getUserGroups, createGroup, deleteGroup, renameFile } from '../ApiCalls';
import { getCookie, eraseCookie } from '../utils/cookies';
import NavigationBar from '../components/NavigationBar';
import Toast from '../components/Toast';
import { getFileType, getCleanFileName, filterMissingFolder } from '../utils/fileUtils';
import FileDetails from '../components/File/FileDetails';
import FileGrid from '../components/File/FileGrid';
import FileNavBar from '../components/File/FileNavBar';
import { useCurrentDir } from '../CurrentDirContext';
import DirectoryNavigationBar from '../components/File/DirectoryNavigationBar';
import GroupSidebar from '../components/group/GroupSideBar';
import FileShareSidebar from '../components/FileShare/FileShareSideBar';

const Home: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadingFileName, setUploadingFileName] = useState<string>('');
  const [sidebarPosition, setSidebarPosition] = useState<{ left: number; top: number } | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [showGroupsSidebar, setShowGroupsSidebar] = useState(false);
  const [showAddGroupForm, setShowAddGroupForm] = useState(false);
  const [showFileShareSidebar, setShowFileShareSidebar] = useState(false);

  const navBarStart = ':/';
  const navigate = useNavigate();
  const { currentDir, setCurrentDir } = useCurrentDir();
  const [filteredFiles, setFilteredFiles] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState(navBarStart + currentDir);
  const [searchValue, setSearchValue] = useState('');
  const [currentSharedByUserId, setCurrentSharedByUserId] = useState<number | null>(null);
  const [hoveredFile, setHoveredFile] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>('myFiles');
  const tabs = [
    { id: 'myFiles', label: 'My Files' },
    { id: 'sharedToMe', label: 'Shared To Me' },
    { id: 'sharedByMe', label: 'Shared By Me' },
  ];
  const loadFiles = useCallback((userId: number, accessToken: string, ) => {
    setLoading(true);
    const updateFileSharing = (mappedFiles: any[], newFile: any) => {
      const existingFileIndex = mappedFiles.findIndex(file => file.objectKey === newFile.objectKey);
      if (existingFileIndex !== -1) {
        const existingFile = mappedFiles[existingFileIndex];
        if (Array.isArray(existingFile.fileSharing)) {
          existingFile.fileSharing.push(newFile.fileSharing);
        } else {
          existingFile.fileSharing = [existingFile.fileSharing, newFile.fileSharing];
        }
        mappedFiles[existingFileIndex] = existingFile;
      } else {
        newFile.fileSharing = [newFile.fileSharing];
        mappedFiles.push(newFile);
      }
    };

    if (activeTab === 'myFiles') {
      fetchUserFiles(userId, accessToken)
        .then((response) => {
          console.log(response);
          setFiles(response);
          setLoading(false);
        })
        .catch((err) => {
          setToast({ message: 'Failed to load user files', type: 'error' });
          setLoading(false);
          eraseCookie('accessToken');
          eraseCookie('userId');
          eraseCookie('username');
          navigate('/auth');
        });
    } else if (activeTab === 'sharedToMe') {
      getFilesSharedToUser(userId, accessToken)
        .then((response) => {
          console.log(response);
          const mappedFiles = response.map((item: any) => ({
            ...item.fileObject,
            fileSharing: item.fileSharing
          }));
          setFiles(mappedFiles);
          setLoading(false);
        })
        .catch((err) => {
          setToast({ message: 'Failed to load shared files to user', type: 'error' });
          setLoading(false);
        });
      } else if (activeTab === 'sharedByMe') {
        getFilesSharedByUser(userId, accessToken)
          .then((response) => {
            const mappedFiles: any[] = [];
            response.forEach((item: any) => {
              const newFile = {
                ...item.fileObject,
                fileSharing: item.fileSharing
              };
              updateFileSharing(mappedFiles, newFile);
            });
            console.log(mappedFiles);
            setFiles(mappedFiles);
            setLoading(false);
          })
          .catch((err) => {
            setToast({ message: 'Failed to load shared files by user', type: 'error' });
            setLoading(false);
          });
      }
  }, [navigate, setToast, setFiles, setLoading, activeTab]);

  useEffect(() => {
    const accessToken = getCookie('accessToken');
    const userIdStr = getCookie('userId');
    const userId = userIdStr ? parseInt(userIdStr, 10) : null;

    if (!accessToken || userId === null || isNaN(userId)) {
      navigate('/auth');
    } else {
      loadFiles(userId, accessToken);      
    }
  }, [ navigate, loadFiles]);

  useEffect(() => {

    if(currentDir ===''){setCurrentSharedByUserId(null)}
    const filtered = files.filter((file) => {
      if (!file.objectKey.startsWith(currentDir) || file.objectKey === currentDir) return false; 
      const remaining = file.objectKey.substring(currentDir.length); 
      let foundSlash = false;
      for (let i = 0; i < remaining.length; i++) {
        if (remaining[i] === '/') {
          foundSlash = true;
        } else if (foundSlash) {
          return filterMissingFolder(file, files, remaining, i);
          
        }       
        
      }

      if (currentSharedByUserId !== null) {
        if (file.fileSharing.sharedByUserId === currentSharedByUserId) {
          return true; 
        }
        return false; 
      }
      return true; 
    });
    filtered.sort((a, b) => {
      const endsWithSlashA = a.objectKey.endsWith('/');
      const endsWithSlashB = b.objectKey.endsWith('/');
      
      if (endsWithSlashA && !endsWithSlashB) {
        return 1; 
      } else if (!endsWithSlashA && endsWithSlashB) {
        return -1;
      } else {
        return 0; 
      }
    });
    console.log(filtered);

    const furtherFiltered = filtered.filter((file) => {
      return searchValue ? file.objectKey.includes(currentDir + searchValue) : true;
    });

    setFilteredFiles(furtherFiltered);

    console.log(furtherFiltered);
  }, [currentDir, files, activeTab,currentSharedByUserId, searchValue]);
  

  useEffect(() => {
    if(showGroupsSidebar){
      const accessToken = getCookie('accessToken');
      const userIdStr = getCookie('userId');
      const userId = userIdStr ? parseInt(userIdStr, 10) : null;
      if (accessToken && userId !== null && !isNaN(userId)) {
        getUserGroups(userId, accessToken)
          .then((response) => {
            setGroups(response);
          })
          .catch((err) => {
            console.error('Error fetching user groups:', err);
            setToast({ message: 'Failed to load groups', type: 'error' });
          });
      }
    }

  }, [showGroupsSidebar]);

  const handleToastClose = () => {
    setToast(null);
  };

  const handleFileClick = (file: any, fileSharing: any | null, event: React.MouseEvent<HTMLDivElement>) => {
    if (event.detail === 2) {
      if (getFileType(file.objectKey) === 'Folder') {
        setCurrentDir(file.objectKey);
        setInputValue(navBarStart + file.objectKey);
        if (fileSharing ) {
          setCurrentSharedByUserId(fileSharing.sharedByUserId);
        } else {
          setCurrentSharedByUserId(null);
        }
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


  const handleDragOver = (file: any, event: React.DragEvent<HTMLDivElement>) => {
    setHoveredFile(null);
    if (file && getFileType(file.objectKey) === "Folder") {
      setHoveredFile(file);
    }
    event.preventDefault();
  };
  
  const handleDragStart = (file: any, event: React.DragEvent<HTMLDivElement>) => {
    setHoveredFile(null);
    event.dataTransfer.setData("fileKey", file.objectKey);
  };
  
  const handleDragEnd = (file: any, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setHoveredFile(null);
  
    const fileKey = event.dataTransfer.getData("fileKey");
    const accessToken = getCookie('accessToken');
    const userIdStr = getCookie('userId');
    const userId = userIdStr ? parseInt(userIdStr, 10) : null;
  
  
    if (getFileType(file.objectKey) !== "Folder") {
      console.error("Target is not a folder, cannot move file.");
      setToast({ message: 'Target is not a folder, cannot move file.', type: 'error' });
      return;
    }
  
    const newFileKey = file.objectKey + getCleanFileName(fileKey) + (getFileType(fileKey) === "Folder" ? '/' : '');
    
    renameFile(userId as number, accessToken as string, fileKey, newFileKey)
      .then(() => {
        setToast({ message: `File ${getCleanFileName(fileKey)} was moved successfully to Folder ${getCleanFileName(file.objectKey)}`, type: 'success' });
        loadFiles(userId as number, accessToken as string);
      })
      .catch((err) => {
        console.error('Error moving file:', err);
        setToast({ message: 'Failed to move file', type: 'error' });
      });
  };
  

  const handleNewFileNameUpdate = (newFileName: string | null) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) => (file.objectKey === selectedFile.objectKey ? { ...file, objectKey: newFileName } : file))
    );
    setSelectedFile(null);
    const accessToken = getCookie('accessToken');
    const userIdStr = getCookie('userId');
    const userId = userIdStr ? parseInt(userIdStr, 10) : null;
    if (accessToken && userId !== null && !isNaN(userId)) {
      loadFiles(userId, accessToken);
    }
  };

  const doesFileNameExist = (filename: string, isFile: boolean) => {
    const baseNameMatch = filename.match(/^(.*?)( \((\d+)\))?(\/|\.\w+)?$/);
    
    if (!baseNameMatch) {
      return null;
    }
    
  
    let baseName = baseNameMatch[1];
    let currentCounter = baseNameMatch[3] ? parseInt(baseNameMatch[3]) : 0;
    let extension = baseNameMatch[4] || '';
    let newFilename = filename ;
    if (!isFile ) {
      extension = '';
      newFilename+= '/';
    }
    let counter = currentCounter + 1;
    for (let i = 0; i < files.length; i++) {
      if (files[i].objectKey === newFilename) {
        newFilename = `${baseName} (${counter})${extension}${!isFile? '/': ''}`;
        counter++;
        i = -1;
      }
    }
    if(!isFile){
      newFilename=newFilename.substring(0, newFilename.length-1)
    }
    return newFilename === filename ? null : newFilename;
  };
  
  
  const handleFileDelete = () => {
    setToast({ message: `File was deleted successfully`, type: 'success' });
    setSelectedFile(null);
    const accessToken = getCookie('accessToken');
    const userIdStr = getCookie('userId');
    const userId = userIdStr ? parseInt(userIdStr, 10) : null;

    if (accessToken && userId !== null && !isNaN(userId)) {
      loadFiles(userId, accessToken);    
    }
  };

  const handleSubmitValue = (value: string) => {
    if(value.charAt(value.length-1)==='/'){
      if(!files.some(f=>{ return f.objectKey ===value.substring(2, value.length)})){
        setCurrentDir('');
        setInputValue(':/');
      }else{
        setInputValue(value);
        setCurrentDir(value.substring(2, value.length));
      }
    }else{
      setInputValue(value);
    }
    
  };
 
  const handleSearchSubmit = (value: string) => {
    setSearchValue(value);
  }

  const handleArrowButtonClick = () => {
    let newValue = inputValue.slice(0, -1); 
    for (let i = newValue.length - 1; i >= 0; i--) {
      if (newValue[i] === '/') {
        newValue = newValue.slice(0, i + 1);
        const tempValue= newValue.endsWith('/') ? newValue : newValue + '/'; 
        if(files.some(f => f.objectKey=== tempValue.substring(2, tempValue.length))){
          break;
        }
      }
    }
    newValue = newValue.endsWith('/') ? newValue : newValue + '/';  
    handleSubmitValue(newValue);
    setCurrentDir(newValue.slice(2)); 
  };

  const handleCloseSidebar = () => {
    setSelectedFile(null);
    setSidebarPosition(null);
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setSelectedFile(null);
    setCurrentDir('');
    setInputValue(navBarStart);
    setCurrentSharedByUserId(null);
  };

  const handleFileDownload = (fileName: string) => {
    setToast({ message: `File ${fileName} was downloaded successfully`, type: 'success' });
    setSelectedFile(null);
    setSidebarPosition(null);
  };

  const handleGroupsSidebarToggle = () => {
    setShowGroupsSidebar(!showGroupsSidebar);

  };

  const handleAddGroup = (groupName: string) => {
    const accessToken = getCookie('accessToken');
    const userIdStr = getCookie('userId');
    const userId = userIdStr ? parseInt(userIdStr, 10) : null;

    if (accessToken && userId !== null && !isNaN(userId)) {
      createGroup(userId, groupName, accessToken)
        .then(() => {
          setToast({ message: 'Group created successfully', type: 'success' });
          getUserGroups(userId, accessToken)
            .then((response) => {
              setGroups(response);
              setShowAddGroupForm(false);
            })
            .catch((err) => {
              console.error('Error fetching user groups:', err);
              setToast({ message: 'Failed to load groups', type: 'error' });
            });
        })
        .catch(() => {
          setToast({ message: 'Failed to create group', type: 'error' });
        });
    }
  };

  const handleRemoveGroup = (groupId: number) => {
    const accessToken = getCookie('accessToken');
    const userIdStr = getCookie('userId');
    const userId = userIdStr ? parseInt(userIdStr, 10) : null;

    if (accessToken && userId !== null && !isNaN(userId)) {
      deleteGroup(userId, groupId, accessToken)
        .then(() => {
          setToast({ message: 'Group removed successfully', type: 'success' });
          setGroups(groups.filter((group) => group.id !== groupId));
        })
        .catch(() => {
          setToast({ message: 'Failed to remove group', type: 'error' });
        });
    }
  };

  const handleOpenFileShareSideBar = () => {
    
    setShowFileShareSidebar(true);
  };

  const handleCloseFileShareSidebar = () => {
    setShowFileShareSidebar(false);
  };

  const handleFileShareDelete = (fileShareId: number, objectKey: string) => {

    setToast({ message: `File share removed successfully`, type: 'success' });
    const accessToken = getCookie('accessToken');
    const userIdStr = getCookie('userId');
    const userId = userIdStr ? parseInt(userIdStr, 10) : null;

    if (accessToken && userId !== null && !isNaN(userId)) {
      loadFiles(userId, accessToken);    
      setSelectedFile(null);
    }
  };
  
  const hasDuplicateFileSharingIds = (file: any) => {
    if (!file.fileSharing) {
        return false;
    }

    const fileSharingIds = file.fileSharing.map((fs: any) => fs.id);

    let fileSharingIdCount = false;
    files.forEach(f => {
        if (f === file || !f.fileSharing) {
            return;
        }
        f.fileSharing.forEach((fs: any) => {
            const id = fs.id;
            if (fileSharingIds.includes(id)) {
              fileSharingIdCount = true;;
            }
        });
    });

    return fileSharingIdCount;
};
  

  return (
    <div className="min-h-screen bg-gray-100 text-black flex flex-col overflow-hidden">
      <NavigationBar onGroupsToggle={handleGroupsSidebarToggle} />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-full flex flex-col items-center overflow-hidden">
          <div className="w-full bg-white p-6 rounded shadow-md w-full overflow-y-auto">
            <div className="w-full ">
              <FileNavBar
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
                loadFiles={loadFiles}
                doesFilenameExist={doesFileNameExist}
              />
            </div>
            <DirectoryNavigationBar inputValue={inputValue} handleSubmitValue={handleSubmitValue} handleArrowButtonClick={handleArrowButtonClick} handleSearchSubmit={handleSearchSubmit}/>
            <div className="w-full">
              
                <FileGrid
                  files={filteredFiles}
                  selectedFile={selectedFile}
                  hoveredFile={hoveredFile}
                  onFileClick={handleFileClick}
                  handleDragStart={handleDragStart}
                  handleDragEnd={handleDragEnd}
                  handleDragOver={handleDragOver}
                  loading={loading}
                  canFilesBeDragged={activeTab === 'myFiles'}
                />
 
            </div>
          </div>
        </div>
      </div>
      {selectedFile && sidebarPosition && (
        <div
          id="file-sidebar"
          className="p-4 rounded bg-backgroundBlueCustom shadow-md mt-4"
          style={{ position: 'fixed', left: sidebarPosition.left, top: sidebarPosition.top, boxShadow: '0 4px 6px rgba(0, 175, 239, 0.5)' }}
        >
          <FileDetails
            file={selectedFile}
            onClose={handleCloseSidebar}
            onFileDelete={handleFileDelete}
            onFileDownload={handleFileDownload}
            onFileShare={handleOpenFileShareSideBar}
            onFileShareDelete={handleFileShareDelete}
            setNewFileName={handleNewFileNameUpdate}
            readOnly={activeTab!=="myFiles"}
            notRoot={currentDir!== ''}
            hasDuplicateFileSharingIds={hasDuplicateFileSharingIds}
          />
        </div>
      )}
      {toast && <Toast message={toast.message} onClose={handleToastClose} type={toast.type} />}
      {showGroupsSidebar && (
        <GroupSidebar
          groups={groups}
          onClose={handleGroupsSidebarToggle}
          handleRemoveGroup={handleRemoveGroup}
          handleAddGroup={handleAddGroup}
          setShowAddGroupForm={setShowAddGroupForm}
          showAddGroupForm={showAddGroupForm}
          setToast={setToast}
        />
      )}
      {showFileShareSidebar && ( 
      <FileShareSidebar 
      onClose={handleCloseFileShareSidebar} 
      selectedFile={selectedFile} 
      groups={groups} 

      setToast={setToast}
      />)}
    </div>
  );
};

export default Home;
