import React from 'react';

interface AddGroupButtonProps {
  onClick: () => void;
}

const AddGroupButton: React.FC<AddGroupButtonProps> = ({ onClick }) => {
    return (
      <button onClick={onClick} className="bg-blue-500 text-white p-2 rounded mt-6 float-right">
        Add Group
      </button>
    );
  };
  
  export default AddGroupButton;
  