import React from 'react';
import { useCurrentDir } from '../../CurrentDirContext';

interface DirectoryNavigationBarProps {
  inputValue: string;
  handleSubmitValue: (value: string) => void;
}

const DirectoryNavigationBar: React.FC<DirectoryNavigationBarProps> = ({ inputValue, handleSubmitValue }) => {
  const {  setCurrentDir } = useCurrentDir(); 
  const navBarStart = ':/';

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
        setCurrentDir(newValue);
      }
    }
  };

  const handleArrowButtonClick = () => {
    let newValue = inputValue.slice(0, -1); 
    for (let i = newValue.length - 1; i >= 0; i--) {
      if (newValue[i] === '/') {
        newValue = newValue.slice(0, i + 1);
        break;
      }
    }
    newValue = newValue.endsWith('/') ? newValue : newValue + '/';  
    handleSubmitValue(newValue);
    setCurrentDir(newValue.slice(2)); 
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
        className="text-left text-black font-semibold  border-none outline-none flex-grow" 
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleInputKeyPress}
      />
    </div>
  );
};

export default DirectoryNavigationBar;
