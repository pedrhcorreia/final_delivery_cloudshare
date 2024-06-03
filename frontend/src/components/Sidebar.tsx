import React, { useState, useEffect } from 'react';
import GroupList from './group/GroupList'; 
import AddGroupButton from './group/AddGroupButton'; 
import AddGroupForm from './group/AddGroupForm'; 
import { getUserGroups, createGroup } from '../ApiCalls'; 
import { getCookie } from '../utils/cookies';
import Toast from './Toast'; 
import Spinner from './Spinner'; 
import { Group } from '../types/Group'; 

const Sidebar: React.FC = () => {
    const [collapse1, setCollapse1] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groups, setGroups] = useState<Group[]>([]);
    const [loadingGroups, setLoadingGroups] = useState(true);
    const [loadingCreateGroup, setLoadingCreateGroup] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [addGroup, setAddGroup] = useState(false);

    useEffect(() => {
      const fetchUserGroups = async () => {
        try {
          const userIdStr = getCookie('userId');
          const userId = userIdStr ? parseInt(userIdStr, 10) : null;
          const userGroups = await getUserGroups(userId as number, getCookie('accessToken') as string);
          setGroups(userGroups);
          setLoadingGroups(false);
        } catch (error) {
          setError('Failed to fetch user groups');
          setLoadingGroups(false);
        }
      };
  
      fetchUserGroups();
    }, []);
  
    const toggleCollapse1 = () => {
      setCollapse1(!collapse1);
    };
  
    const handleCreateGroup = async () => {
      setLoadingCreateGroup(true);
      try {
        const userIdStr = getCookie('userId');
        const userId = userIdStr ? parseInt(userIdStr, 10) : null;
        await createGroup(userId as number, groupName, getCookie('accessToken') as string);
        const userGroups = await getUserGroups(userId as number, getCookie('accessToken') as string);
        setGroups(userGroups);
        setGroupName('');
        setLoadingCreateGroup(false);
        setError(null);
      } catch (error) {
        setError('Failed to create group');
        setLoadingCreateGroup(false);
      }
    };
  
    const clearError = () => {
      setError(null);
    };
  
    return (
        <div className="w-1/4 bg-gray-200 p-4 h-full">
          <div className="mb-4">
            <button onClick={toggleCollapse1} className="block w-full text-left text-stone-900 bg-white p-2 rounded flex justify-between items-center">
              Groups
              <span className="transform transition-transform duration-200" style={{ transform: collapse1 ? 'rotate(180deg)' : 'rotate(0)' }}>
                &#9660;
              </span>
            </button>
            {collapse1 && (
              <div className="mt-2 p-2 border border-gray-300 rounded bg-white text-stone-900">
                {loadingGroups ? (
                  <Spinner />
                ) : (
                  <>
                    <GroupList groups={groups} />
                    <AddGroupButton onClick={() => setAddGroup(!addGroup)} />
                    {addGroup && (
                        <AddGroupForm onSubmit={handleCreateGroup} />
                    )}
                    {loadingCreateGroup && <Spinner />} 
                    {error && <Toast message={error} onClose={clearError} type={"error"}/>}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      );
    };
      
  
  export default Sidebar;
