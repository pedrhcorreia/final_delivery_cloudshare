import React, { useState } from 'react';
import { useCurrentDir } from '../../CurrentDirContext';

interface DirectoryNavigationBarProps {
  inputValue: string;
  handleSubmitValue: (value: string) => void;
  handleArrowButtonClick: () => void;
  handleSearchSubmit: (value: string) => void;
}

const DirectoryNavigationBar: React.FC<DirectoryNavigationBarProps> = ({ inputValue, handleSubmitValue, handleArrowButtonClick, handleSearchSubmit }) => {
  const { setCurrentDir } = useCurrentDir(); 
  const navBarStart = ':/';
  const [searchInput, setSearchInput] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleSubmitValue(event.target.value);
  };

  const handleInputKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (inputValue === navBarStart) {
        handleSubmitValue(navBarStart);
        setCurrentDir("");
      } else {
        let newValue = inputValue.replace(navBarStart, '');
        newValue = newValue.trim().replace(/\s+\/$/, '/');

        if (newValue.charAt(newValue.length - 1) !== '/') {
          newValue += '/';
        }
  
        handleSubmitValue(navBarStart + newValue);
      }
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setSearchInput(newValue);
    handleSearchSubmit(newValue);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    handleSearchSubmit('');
  };

  return (
    <div className="flex items-center justify-between w-full border border-black" style={{ height: '30px' }}>
      <div className="flex items-center">
        <button className="rounded-full p-1 mr-1" onClick={handleArrowButtonClick}>
          <img src='icons/back-arrow.png' alt="Back Arrow" className="w-6 h-6 mr-1" />
        </button>
        <img src='icons/folder-icon.png' alt="Folder Icon" className="w-6 h-6 mr-1" />
      </div>
      <input 
        type="text" 
        className="text-left text-black font-semibold border-none outline-none flex-grow" 
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleInputKeyPress}
      />
      <div className="flex items-center ml-2 relative">
        <img src='icons/magnifying-glass.png' alt="Search Icon" className="w-6 h-6 mr-1" />
        <input 
          type="text" 
          className="text-left text-black font-semibold border-none outline-none" 
          placeholder="Search"
          value={searchInput}
          onChange={handleSearchChange}
        />
        {searchInput && (
          <button onClick={handleClearSearch} className="absolute right-0 mr-2 text-red-500">
            X
          </button>
        )}
      </div>
    </div>
  );
};

export default DirectoryNavigationBar;
