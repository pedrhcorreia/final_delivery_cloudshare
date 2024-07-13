import React from 'react';
import { useNavigate } from 'react-router-dom';
import { eraseCookie, getCookie } from '../utils/cookies';

interface NavigationBarProps {
  onGroupsToggle: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ onGroupsToggle }) => {
  const navigate = useNavigate();
  const username = getCookie('username');

  const handleLogout = () => {
    eraseCookie('accessToken');
    eraseCookie('userId');
    eraseCookie('username');
    navigate('/auth');
  };

  return (
    <nav className="bg-gray-800 text-white px-6 py-4">
      <div className="flex justify-between items-center relative">
        <div className="flex items-center space-x-3 ml-50">
          <img src="/icons/user-icon.png" alt="User Icon" className="w-10 h-10" />
          <div className="text-xl text-white">{username}</div>
        </div>
        <div className="absolute left-1/4 transform -translate-x-1/4 flex items-center">
        <img src="/icons/group-icon.png" alt="Group Icon" className="w-10 h-10 rounded-full mr-2" />
        <button
          onClick={onGroupsToggle}
          className="text-sm text-gray-300 hover:text-white focus:outline-none flex items-center"
        >
          <div className="text-xl text-white">Groups</div>
        </button>
      </div>

        <div className="absolute left-1/2 transform -translate-x-1/2">
          <img src="/icons/logo.png" alt="Logo" className="w-24 h-24" />
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-black font-bold py-3 px-3 rounded inline-flex items-center"
        >
          <img src="/icons/logout.svg" alt="Logout" className="w-8 h-8 mr-2" />
        </button>
      </div>
    </nav>
  );
};

export default NavigationBar;
