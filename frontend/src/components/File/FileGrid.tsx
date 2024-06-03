import React from 'react';
import FileCard from './FileCard';
import Spinner from '../Spinner';

interface FileGridProps {
  files: any[];
  selectedFile: any;
  onFileClick: (file: any, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  loading: boolean;
}

const FileGrid: React.FC<FileGridProps> = ({ files, selectedFile, onFileClick, loading }) => {
  return (
    <div 
      className="border border-gray-600 bg-gray-200 p-4 rounded grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto" 
      style={{ 
        maxHeight: 'calc(100vh - 250px)',
        minHeight: '700px'
      }}
    >
      {loading ? (
        <div className="flex justify-center items-center w-full h-full" style={{ textAlign: 'center' }}>
          <div style={{ marginLeft: '1100px' }}>
            <Spinner />
          </div>
        </div>
      ) : (
        files.length > 0 ? (
          files.map((file, index) => (
            <div key={index} onClick={(event) => onFileClick(file, event)} style={{ maxWidth: '200px', maxHeight: '100px' }}>
              <FileCard
                objectKey={file.objectKey}
                size={file.size}
                isSelected={selectedFile === file}
                onClick={(event) => onFileClick(file, event)} 
              />
            </div>
          ))
        ) : (

          <p style={{ color: 'black', marginTop: '300px', marginLeft:'700px' }}>Empty</p>


        )
      )}
    </div>
  );
};

export default FileGrid;
