import React, { useState } from 'react';

const GroupCollapse: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`flex flex-col ${collapsed ? 'h-12' : 'h-full'} transition-height`} style={{ marginLeft: '5px', marginTop: '80px' }}>
      <div className="border border-black bg-white rounded-md hover:bg-customBlue p-2 cursor-pointer flex items-center" onClick={toggleCollapse}>
        <span className="mr-auto">Groups</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform transform ${collapsed ? '' : 'rotate-180'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a1 1 0 0 1-.707-.293l-8-8a1 1 0 0 1 1.414-1.414L10 15.586l6.293-6.293a1 1 0 0 1 1.414 1.414l-7.999 8A1 1 0 0 1 10 18z"
          />
        </svg>
      </div>
      <div className={`border border-black bg-white p-4 rounded-md ${collapsed ? 'hidden' : ''}`}>
        <p>Not implemented</p>
        <p>(Like the rest of this column)</p>
      </div>
    </div>
  );
};

export default GroupCollapse;
