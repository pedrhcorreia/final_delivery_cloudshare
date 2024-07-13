import React from 'react';
import Spinner from '../Spinner';

interface GroupMemberListProps {
  members: any[];
  loadingMembers: boolean;
  userIdToRemove: number | null;
  onRemoveMember?: (memberId: number) => void;
}

const GroupMemberList: React.FC<GroupMemberListProps> = ({ members, loadingMembers, userIdToRemove, onRemoveMember }) => {
  return (
    <ul className="mt-2 space-y-1">
      {loadingMembers ? (
        <li className="text-gray-400 pl-4 flex items-center">
          <Spinner />
        </li>
      ) : members.length > 0 ? (
        members.map((member, idx) => (
          <li key={idx} className="text-gray-200 pl-4 flex items-center">
            <img src="/icons/avatar-icon.png" alt="User Icon" className="w-6 h-6 rounded-full mr-2" />
            <span>{member.username}</span>
            {onRemoveMember && (
                <React.Fragment>
                    {member.id === userIdToRemove ? (
                    <Spinner />
                    ) : (
                    <button className="ml-auto text-red-500" onClick={() => onRemoveMember(member.id)}>
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    )}
                </React.Fragment>
            )}

          </li>
        ))
      ) : (
        <li className="text-gray-400 pl-4">Empty</li>
      )}
    </ul>
  );
};

export default GroupMemberList;
