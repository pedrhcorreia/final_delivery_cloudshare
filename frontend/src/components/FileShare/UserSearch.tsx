import React, { useState } from 'react';
import Spinner from '../../components/Spinner';
import { User } from '../../types/User'; 

interface UserSearchProps {
  loadingSearch: boolean;
  sortedResults: User[];
  checkedUsers: Set<User>;
  toggleCheck: (user: User) => void; 
  onSearch: (query: string) => void;
  searchInput: string;
  onClose: () => void; 
}

const UserSearch: React.FC<UserSearchProps> = ({
  loadingSearch,
  sortedResults,
  checkedUsers,
  toggleCheck,
  onSearch,
  searchInput,
  onClose, 
}) => {
  const [inputValue, setInputValue] = useState('');
  let combinedResults = [...Array.from(checkedUsers).filter(user => !sortedResults.some(searchUser => searchUser.id === user.id)), ...sortedResults];

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onSearch(inputValue.trim());
    combinedResults = [...Array.from(checkedUsers).filter(user => !sortedResults.some(searchUser => searchUser.id === user.id)), ...sortedResults];
  };

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold text-black">User Search</h2>
        <button onClick={onClose} className="p-1 bg-red-600 rounded-full">
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
      </div>

      <form onSubmit={handleSearchSubmit} className="flex items-center mb-2">
        <input
          type="text"
          value={inputValue}
          onChange={handleSearchInputChange}
          placeholder="Search users..."
          className="border border-gray-300 p-2 text-black rounded mr-2 flex-grow"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {loadingSearch ? <Spinner /> : 'Search'}
        </button>
      </form>

      <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto">
        {combinedResults.map((user, idx) => (
          <li key={idx} className="flex items-center text-black">
            <img src="/icons/avatar-icon.png" alt="User Icon" className="w-6 h-6 rounded-full mr-2" />
            <span className="flex-grow">{user.username}</span>
            <button
              className={`ml-auto w-6 h-6 flex items-center justify-center rounded border border-gray-400 ${checkedUsers.has(user) ? 'bg-green-500' : ''}`}
              onClick={() => toggleCheck(user)} 
            >
              {checkedUsers.has(user) && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M3.293 8.293a1 1 0 011.414-1.414L8 10.586l6.293-6.293a1 1 0 111.414 1.414l-7 7a1 1 0 01-1.414 0l-7-7a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </li>
        ))}

        {combinedResults.length === 0 && inputValue.length > 0 && (
          <p className="text-black mt-2">No users found</p>
        )}
      </ul>
    </div>
  );
};

export default UserSearch;
