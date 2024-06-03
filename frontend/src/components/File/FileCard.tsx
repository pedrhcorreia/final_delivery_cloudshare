import React from 'react';
import { getFileIcon, extractFolderName, getFileType } from '../../utils/fileUtils';
import { formatFileSize } from '../../utils/fileUtils';

interface FileCardProps {
  objectKey: string;
  size: number;
  onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void; 
  isSelected: boolean;
}

const FileCard: React.FC<FileCardProps> = ({ objectKey, size, onClick, isSelected }) => {
  const fileIcon = getFileIcon(objectKey);
  const formattedSize = formatFileSize(size);
  const fileName = extractFolderName(objectKey);
  const fileType = getFileType(objectKey);
  const isFolder = fileType === 'Folder';

  return (
    <div
      className={`bg-white p-2 rounded shadow-md m-1 flex flex-col items-center justify-between h-40 ${
        isSelected ? 'border-2 border-customOrange' : ''
      }`}
      onClick={onClick}
      style={{ position: 'relative', overflow: 'hidden', maxWidth: '200px' }} 
    >
      <img src={fileIcon} alt="File icon" className="w-16 h-16 mb-2" />
      <div className="text-center" style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}>
        <h3
          className="text-sm text-stone-950 font-semibold mb-1 cursor-pointer"
          title={fileName}
          style={{
            width: '100%',
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'normal',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word'
          }}
        >
          {fileName}
        </h3>
        {!isFolder && (
          <p className="text-gray-700 text-sm">{formattedSize}</p>
        )}
      </div>
    </div>
  );
};

export default FileCard;
