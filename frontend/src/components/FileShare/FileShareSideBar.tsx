import React, { useState } from 'react';
import { getCookie } from '../../utils/cookies';
import { searchUsers, shareFile } from '../../ApiCalls';
import { User } from '../../types/User';
import UserSearch from './UserSearch';
import FileDetails from '../File/FileDetails';
import GroupElement from '../group/Group';
import { Group } from '../../types/Group';

interface FileShareSidebarProps {
  onClose: () => void;
  selectedFile: any;
  groups: any[]; 
  setToast: React.Dispatch<React.SetStateAction<{ message: string; type: 'error' | 'success' } | null>>;
}

const FileShareSidebar: React.FC<FileShareSidebarProps> = ({ onClose, selectedFile, groups, setToast }) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [checkedUsers, setCheckedUsers] = useState<Set<User>>(new Set());
  const [checkedGroups, setCheckedGroups] = useState<Set<Group>>(new Set()); 
  const [usersCollapsed, setUsersCollapsed] = useState(true); 
  const [groupsCollapsed, setGroupsCollapsed] = useState(true); 

  const handleSearch = (query: string) => {
    setLoadingSearch(true);
    const accessToken = getCookie('accessToken');
    searchUsers(query, accessToken as string)
      .then((results) => {
        setSearchResults(results);
        setLoadingSearch(false);
      })
      .catch((error) => {
        console.error('Error searching users:', error);
        setLoadingSearch(false);
      });
  };

  const handleCloseUserSearch = () => {
    setSearchResults([]);
  };

  const handleFileShare = async () => {
    try {
      const accessToken = getCookie('accessToken');
      const userIdStr = getCookie('userId');
      const userId = userIdStr ? parseInt(userIdStr, 10) : null;
      const selectedUsers = Array.from(checkedUsers).map((user) => user.id);
      const selectedGroups = Array.from(checkedGroups); 

      for (const selectedUser of selectedUsers) {
        const result = await shareFile(userId as number, selectedUser, selectedFile.objectKey, "USER", accessToken as string);
        console.log('File shared successfully with user:', selectedUser, result);
      }

      for (const group of selectedGroups) {
        const result = await shareFile(userId as number, group.id, selectedFile.objectKey, "GROUP", accessToken as string);
        console.log('File shared successfully with group:', group, result);
      }

      setCheckedUsers(new Set());
      setCheckedGroups(new Set());
      setSearchResults([]);
      setSearchInput('');

      setToast({ message: 'File shared successfully!', type: 'success' });
      onClose();
    } catch (error) {
      console.error('Error sharing file:', error);
      setToast({ message: 'Error sharing file. Please try again later.', type: 'error' });
    }
  };

  const toggleCheckUser = (user: User) => {
    const updatedCheckedUsers = new Set(checkedUsers);
    if (updatedCheckedUsers.has(user)) {
      updatedCheckedUsers.delete(user);
    } else {
      updatedCheckedUsers.add(user);
    }
    setCheckedUsers(updatedCheckedUsers);
  };

  const toggleCheckGroup = (group: any) => {
    const updatedCheckedGroups = new Set(checkedGroups);
    if (updatedCheckedGroups.has(group)) {
      updatedCheckedGroups.delete(group);
    } else {
      updatedCheckedGroups.add(group);
    }
    setCheckedGroups(updatedCheckedGroups);
  };

  const toggleUsersCollapse = () => {
    setUsersCollapsed(!usersCollapsed);
  };

  const toggleGroupsCollapse = () => {
    setGroupsCollapsed(!groupsCollapsed);
  };


  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50">
      <div className="absolute top-0 right-0 h-full bg-gray-800 text-white p-6 w-100">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 bg-red-600 rounded-full"
          style={{ width: '24px', height: '24px' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-semibold">Sharing File:</h2>
        </div>
        <FileDetails file={selectedFile} readOnly={true} notRoot={false} />

        <div className="flex items-center mb-4 cursor-pointer" onClick={toggleUsersCollapse}>
          <h2 className="text-xl font-semibold">With Users:</h2>
          <svg
            className={`ml-2 h-6 w-6 ${usersCollapsed ? 'transform rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 12a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 9.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-.707.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {!usersCollapsed && (
          <UserSearch
            onClose={handleCloseUserSearch}
            loadingSearch={loadingSearch}
            searchInput={searchInput}
            onSearch={handleSearch}
            sortedResults={searchResults}
            checkedUsers={checkedUsers}
            toggleCheck={toggleCheckUser}
          />
        )}

        <div className="flex items-center mb-4 cursor-pointer" onClick={toggleGroupsCollapse}>
          <h2 className="text-xl font-semibold">With Groups:</h2>
          <svg
            className={`ml-2 h-6 w-6 ${groupsCollapsed ? 'transform rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 12a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 9.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-.707.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {!groupsCollapsed && (
          <div>
            {groups.map((group) => (
              <div key={group.id} className="flex items-center  w-full">
                <img src="/icons/group-icon.png" alt="Group Icon" className="w-8 h-8 rounded-full mb-auto mr-2" /> 
                <ul className="space-y-2 w-full">
                  <GroupElement group={group} setToast={setToast} readonly={true} />
                </ul>
                <input
                  type="checkbox"
                  id={`group-${group.id}`}
                  className="mr-1 ml-auto mb-auto h-7 w-7"
                  checked={checkedGroups.has(group)}
                  onChange={() => toggleCheckGroup(group)}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-left mt-4">
          <button
            onClick={handleFileShare}
            className="bg-blue-500 text-white py-2 px-4 rounded"
            disabled={(checkedUsers.size === 0 && checkedGroups.size === 0) || loadingSearch}
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileShareSidebar;
