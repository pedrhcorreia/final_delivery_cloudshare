import React, { useState } from 'react';

interface AddGroupFormProps {
  onSubmit: (groupName: string) => void;
}

const AddGroupForm: React.FC<AddGroupFormProps> = ({ onSubmit }) => {
  const [groupName, setGroupName] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(groupName);
    setGroupName('');
    setShowForm(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${showForm ? '' : 'hidden'}`}>
      <div className="absolute bg-white p-4 rounded shadow-lg w-80">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            value={groupName}
            onChange={handleChange}
            placeholder="Enter group name"
            className="border border-gray-300 p-2 rounded"
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded"
            >
              Create Group
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-200 text-gray-700 p-2 rounded ml-2"
            >
              Close
            </button>
          </div>
        </form>
      </div>
      <div
        className={`fixed inset-0 bg-gray-800 opacity-50 ${showForm ? '' : 'hidden'}`}
        onClick={() => setShowForm(false)}
      ></div>
    </div>
  );
};

export default AddGroupForm;
