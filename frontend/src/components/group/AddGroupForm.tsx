import React, { useState } from 'react';

interface AddGroupFormProps {
  onSubmit: (groupName: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

const AddGroupForm: React.FC<AddGroupFormProps> = ({ onSubmit, isVisible, onClose }) => {
  const [groupName, setGroupName] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(groupName);
    setGroupName('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value);
  };

  if (!isVisible) return null;

  return (
    <div className="mt-4 ">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="text"
          value={groupName}
          onChange={handleChange}
          placeholder="Enter group name"
          className="border text-black border-gray-300 p-2 rounded"
          required
        />
        <div className="flex justify-end">
          <button type="submit" className="bg-blue-500 text-black p-2 rounded">
            Create Group
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 text-gray-700 p-2 rounded ml-2"
          >
            Close
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddGroupForm;
