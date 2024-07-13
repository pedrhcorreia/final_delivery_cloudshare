import React from 'react';
import FileCard from './FileCard';
import Spinner from '../Spinner';

interface FileGridProps {
  files: any[];
  selectedFile: any;
  hoveredFile: any;
  onFileClick: (file: any, fileSharing: any | null, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  handleDragStart: (file: any, event: React.DragEvent<HTMLDivElement>) => void;
  handleDragEnd: (file: any, event: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (file: any, event: React.DragEvent<HTMLDivElement>) => void;
  loading: boolean;
  canFilesBeDragged: boolean;
}

const FileGrid: React.FC<FileGridProps> = ({ files, selectedFile, hoveredFile, onFileClick, loading, handleDragEnd, handleDragOver, handleDragStart, canFilesBeDragged }) => {
  return (
    <div 
      className="border border-gray-600 bg-gray-200 p-2 rounded grid gap-2 overflow-y-auto"
      style={{ 
        maxHeight: 'calc(100vh - 250px)',
        minHeight: '700px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gridAutoFlow: 'row dense'
      }}
    >
      {loading ? (
        <div className="flex justify-center items-center w-full h-full" style={{  }}>
          <div style={{ }}>
            <Spinner />
          </div>
        </div>
      ) : (
        files.length > 0 ? (
          files.map((file, index) => (
            <div key={index} onClick={(event) => onFileClick(file, file.fileSharing, event)} style={{ maxWidth: '200px', maxHeight: '170px' }}>
              <FileCard
                objectKey={file.objectKey}
                size={file.size}
                isSelected={selectedFile === file}
                onClick={(event) => onFileClick(file, file.fileSharing, event)} 
                onDragStart={(event) => handleDragStart(file, event)}
                onDragEnd={(event) => handleDragEnd(file, event)}
                onDragOver={(event) => handleDragOver(file, event)}
                isHovered={hoveredFile === file}
                isDraggable={canFilesBeDragged}
              />
            </div>
          ))
        ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <p style={{ color: 'black' }}>Empty</p>
            </div>
        )
      )}
    </div>
  );
};

export default FileGrid;
