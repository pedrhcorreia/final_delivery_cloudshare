import React, { useState, useEffect } from 'react';
import { fetchGroupMembers, addUserToGroup, removeMemberFromGroup, searchUsers, renameGroup } from '../../ApiCalls';
import { getCookie } from '../../utils/cookies';
import Spinner from '../Spinner';
import GroupMemberList from './GroupMemberList';
import GroupAddMemberForm from './GroupAddMemberForm';

interface GroupProps {
  group: any;
  onRemove?: (groupId: number) => Promise<void>;
  setToast: React.Dispatch<React.SetStateAction<{ message: string; type: 'error' | 'success' } | null>>;
  readonly: boolean;
}

const Group: React.FC<GroupProps> = ({ group, onRemove, setToast, readonly }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingRemoveGroup, setLoadingRemoveGroup] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [userIdToRemove, setUserIdToRemove] = useState<number | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newGroupNameInput, setNewGroupNameInput] = useState(group.name); 

  useEffect(() => {
    const fetchMembers = async () => {
      setLoadingMembers(true);
      try {
        const accessToken = getCookie('accessToken');
        const userIdStr = getCookie('userId');
        const userId = userIdStr ? parseInt(userIdStr, 10) : null;
        if (accessToken && userId !== null && !isNaN(userId)) {
          const fetchedMembers = await fetchGroupMembers(userId, group.id, accessToken);
          setMembers(fetchedMembers);
        }
      } catch (error) {
        console.error('Error fetching group members:', error);
      } finally {
        setLoadingMembers(false);
      }
    };

    if (isExpanded) {
      fetchMembers();
    } else {
      setMembers([]);
    }
  }, [isExpanded, group.id]);

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
    if (showAddForm) {
      setShowAddForm(false); 
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoadingSearch(true);
      const accessToken = getCookie('accessToken');
      const results = await searchUsers(searchInput, accessToken as string);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      setToast({ message: 'Failed to search users', type: 'error' });
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleAddUserToGroup = async (userId: number) => {
    try {
      const accessToken = getCookie('accessToken');
      const userIdStr = getCookie('userId');
      const ownerId = userIdStr ? parseInt(userIdStr, 10) : null;
      await addUserToGroup(ownerId as number, userId, group.id, accessToken as string);
      setToast({ message: 'User added to group successfully', type: 'success' });
      setMembers((prev) => [
        ...prev,
        { id: userId, username: searchResults.find((u) => u.id === userId)?.username },
      ]);
    } catch (error) {
      console.error('Error adding user to group:', error);
      setToast({ message: 'Failed to add user to group', type: 'error' });
    }
  };

  const handleGroupRename = async () => {
    try {
      const accessToken = getCookie('accessToken');
      const userIdStr = getCookie('userId');
      const ownerId = userIdStr ? parseInt(userIdStr, 10) : null;
      await renameGroup(ownerId as number, accessToken as string, group.id, newGroupNameInput);
      setToast({ message: 'Group renamed successfully', type: 'success' });
      setIsEditing(false);
      group.name = newGroupNameInput; 
    } catch (error) {
      console.error('Error renaming group:', error);
      setToast({ message: 'Failed to rename group', type: 'error' });
    }
  };

  const handleRemoveMemberFromGroup = async (memberId: number) => {
    try {
      setUserIdToRemove(memberId);
      const accessToken = getCookie('accessToken');
      const userIdStr = getCookie('userId');
      const userId = userIdStr ? parseInt(userIdStr, 10) : null;
      await removeMemberFromGroup(userId as number, group.id, memberId, accessToken as string);
      setToast({ message: 'User removed from group successfully', type: 'success' });
      setMembers((prev) => prev.filter((member) => member.id !== memberId));
    } catch (error) {
      console.error('Error removing user from group:', error);
      setToast({ message: 'Failed to remove user from group', type: 'error' });
    } finally {
      setUserIdToRemove(null);
    }
  };

  const handleRemoveGroupClick = async () => {
    try {
      setLoadingRemoveGroup(true);
      await onRemove?.(group.id);
      setToast({ message: 'Group removed successfully', type: 'success' });
    } catch (error) {
      console.error('Error removing group:', error);
      setToast({ message: 'Failed to remove group', type: 'error' });
    } finally {
      setLoadingRemoveGroup(false);
    }
  };

  const handleAddClick = () => {
    setShowAddForm(true);
  };

  const handleCloseAddForm = () => {
    setShowAddForm(false);
  };
  const handleEditClick = () => {
    setIsEditing(true);
    setNewGroupNameInput(group.name);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewGroupNameInput(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGroupRename();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };



  return (
    <li className="text-white bg-gray-700 p-2 rounded-md shadow-sm relative group-sidebar">
      <div className="flex justify-between items-center">
        <span className="font-bold bg-gray-700" title="Group name">
        {isEditing ? (
            <>
              <input
                type="text"
                value={newGroupNameInput}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                className="border-b border-gray-500 text-black focus:outline-none"
                style={{ width: '200px' }} 
              />
              <button onClick={handleGroupRename} className="ml-2 text-blue-600 hover:text-blue-800">✓</button>
            </>
          ) : (
            <>
              <span onClick={handleEditClick} style={{ cursor: 'pointer' }}>
              {group.name}
              </span>
              {!readonly && (
                <>
                  <button onClick={handleEditClick} className="ml-2 text-blue-600 hover:text-blue-800">✎</button>
                </>
              )}

            </>
          )}
          
        </span>
        <button onClick={handleToggle}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-white transform transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="mt-2">
          <GroupMemberList
            members={members}
            loadingMembers={loadingMembers}
            userIdToRemove={userIdToRemove}
            onRemoveMember={onRemove ? handleRemoveMemberFromGroup : undefined}
          />

          {showAddForm && (
            <GroupAddMemberForm
              searchInput={searchInput}
              loadingSearch={loadingSearch}
              searchResults={searchResults}
              onSearchInputChange={handleSearchInputChange}
              onSearchSubmit={handleSearchSubmit}
              onAddUserToGroup={handleAddUserToGroup}
              members={members}
              onClose={handleCloseAddForm}
            />
          )}
        </div>
      )}

      {isExpanded && onRemove && (
        <div className="flex justify-between mt-2">
          <button className="bg-red-500 text-white py-1 px-3 rounded-md" onClick={handleRemoveGroupClick}>
            {loadingRemoveGroup ? <Spinner /> : 'Remove Group'}
          </button>
          <button className="bg-blue-500 text-white py-1 px-3 rounded-md" onClick={handleAddClick}>
            Add Member
          </button>
        </div>
      )}
    </li>
  );
};

export default Group;
