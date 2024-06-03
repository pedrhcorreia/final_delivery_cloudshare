import React from 'react';

interface Group {
  id: number;
  name: string;
}

interface Props {
  groups: Group[];
}

const GroupList: React.FC<Props> = ({ groups }) => {
  return (
    <div>
      {groups.length > 0 ? (
        <ul>
          {groups.map((group) => (
            <li key={group.id}>{group.name}</li>
          ))}
        </ul>
      ) : (
        <p>No groups found</p>
      )}<div className="my-4"></div>
    </div>
    
  );
};

export default GroupList;
