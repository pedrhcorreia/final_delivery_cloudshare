import React from 'react';
import Spinner from '../Spinner';

interface GroupAddMemberFormProps {
  searchInput: string;
  loadingSearch: boolean;
  searchResults: any[];
  onSearchInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onAddUserToGroup: (userId: number) => void;
  members: any[];
  onClose: () => void;
}

const GroupAddMemberForm: React.FC<GroupAddMemberFormProps> = ({
  searchInput,
  loadingSearch,
  searchResults,
  onSearchInputChange,
  onSearchSubmit,
  onAddUserToGroup,
  members,
  onClose,
}) => {
  return (
    <div className="bg-white p-4 rounded shadow-md mt-4 relative">
      <button className="absolute top-2 right-2 p-1 bg-red-600 rounded-full z-10" onClick={onClose}>
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

      <div className="mt-2 mb-2">
        <form onSubmit={onSearchSubmit} className="flex items-center">
          <input
            type="text"
            value={searchInput}
            onChange={onSearchInputChange}
            placeholder="Search users..."
            className="border border-gray-300 p-2 text-black rounded-l-md flex-grow max-w-full md:max-w-md"
            style={{ maxWidth: 'calc(100% - 5rem)' }} 
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded-r-md" style={{ minWidth: '3rem' }}>
            {loadingSearch ? <Spinner /> : 'Search'}
          </button>
        </form>
      </div>

      <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto">
        {searchResults.map((user, idx) => (
          <li key={idx} className="flex items-center text-black">
            <span className="flex-grow">{user.username}</span>
            {members.some(member => member.id === user.id) ? (
              <img
                src="/icons/present-arrow.png"
                alt="User present arrow"
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <button
                className="bg-green-500 text-white py-1 px-3 rounded-md"
                onClick={() => onAddUserToGroup(user.id)}
              >
                Add
              </button>
            )}
          </li>
        ))}
      </ul>

      {searchResults.length === 0 && searchInput.length > 0 && (
        <p className="text-gray-400 mt-2">No users found</p>
      )}
    </div>
  );
};

export default GroupAddMemberForm;
