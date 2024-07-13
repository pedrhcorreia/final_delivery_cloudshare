import React from 'react';
import AddGroupButton from './AddGroupButton';
import AddGroupForm from './AddGroupForm';
import Group from './Group';

interface GroupSidebarProps {
  groups: any[];
  onClose: () => void;
  handleAddGroup: (groupName: string) => void;
  handleRemoveGroup: (groupId: number) => void;
  showAddGroupForm: boolean;
  setShowAddGroupForm: React.Dispatch<React.SetStateAction<boolean>>;
  setToast: React.Dispatch<React.SetStateAction<{ message: string; type: 'error' | 'success' } | null>>;
}

const GroupSidebar: React.FC<GroupSidebarProps> = ({ groups, onClose, handleAddGroup, handleRemoveGroup, showAddGroupForm, setShowAddGroupForm, setToast }) => {
  
  const handleRemoveGroupClick = async (groupId: number) => {
    try {
      handleRemoveGroup(groupId);
    } catch (error) {
      console.error('Error removing group:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50">
      <div className="absolute top-0 right-0 h-full bg-gray-800 text-white p-6 w-80">
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
          <img src="/icons/group-icon.png" alt="Group Icon" className="w-10 h-10 rounded-full mr-2" />
          <h2 className="text-xl font-semibold">My Groups</h2>
        </div>
        <ul className="space-y-2 mt-4">
          {groups.map((group, index) => (
            <Group
              key={index}
              group={group}
              onRemove={() => handleRemoveGroupClick(group.id)}
              setToast={setToast}
              readonly={false}
            />
          ))}
        </ul>
        <div className="flex flex-col border-white">
          <div className="flex justify-between mt-6 mb-4">
            <AddGroupButton onClick={() => setShowAddGroupForm(true)} />
          </div>
          {showAddGroupForm && (
            <div className="mt-4">
              <AddGroupForm isVisible={showAddGroupForm} onSubmit={handleAddGroup} onClose={() => setShowAddGroupForm(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupSidebar;
