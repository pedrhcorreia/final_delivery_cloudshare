import React from 'react';
import { getFileIcon, extractFolderName, getFileType } from '../../utils/fileUtils';
import { formatFileSize } from '../../utils/fileUtils';

interface FileCardProps {
  objectKey: string;
  size: number;
  onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void; 
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: ( event: React.DragEvent<HTMLDivElement>) => void;
  isSelected: boolean;
  isHovered: boolean;
  isDraggable: boolean;
}

const FileCard: React.FC<FileCardProps> = ({ objectKey, size, onClick, isSelected, isHovered, onDragEnd,onDragOver, onDragStart, isDraggable }) => {
  const fileIcon = getFileIcon(objectKey);
  const formattedSize = formatFileSize(size);
  const fileName = extractFolderName(objectKey);
  const fileType = getFileType(objectKey);
  const isFolder = fileType === 'Folder';
  return (
    <div
      className={`bg-white p-2 rounded shadow-md m-a1 flex flex-col items-center justify-between h-40 ${
        isSelected ? 'border-2 border-customOrange' : ''
      }
      ${isHovered ? 'border 2 border-green-500' : ''} 
      `}
      onClick={onClick}
      draggable={isDraggable}
      onDragStart={isDraggable? onDragStart: undefined}
      onDragOver={isDraggable? onDragOver: undefined}
      onDrop={isDraggable? onDragEnd : undefined}
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
