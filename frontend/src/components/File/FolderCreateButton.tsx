import React, { useState } from 'react';

interface CreateFolderButtonProps {
  onCreate: (folderName: string) => void;
}

const CreateFolderButton: React.FC<CreateFolderButtonProps> = ({ onCreate }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [folderName, setFolderName] = useState('');

  const handleCreateFolder = () => {
    if (folderName.trim() !== '') {
      onCreate(folderName);
      setFolderName('');
      setIsCollapsed(false);
    }
  };

  return (
    <div className="relative flex justify-end mb-4">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="bg-gray-300 hover:bg-customBlue text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
      >
        <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M10 1v8H2v10h16V9h-8V1H4zm6 18H4V11h12v8zM8 0h4v8H8V0zm4 6V2h-4v4h4z"/>
        </svg>
        <span>Create Folder</span>
      </button>
      {isCollapsed && (
        <div className="absolute top-full right-0 mt-2 bg-white border rounded shadow-lg p-4 z-50" style={{ width: '300px' }}>
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Folder Name"
            className="mb-2 px-4 py-2 border rounded w-full"
          />
          <button
            onClick={handleCreateFolder}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-full"
          >
            Create
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateFolderButton;
