import React from 'react';

interface FileUploadButtonProps {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({ onUpload }) => {
  return (
    <div className="flex justify-end mb-4">
      <label className="bg-gray-300 hover:bg-customBlue text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
        <input
          id="file_input"
          type="file"
          className="hidden"
          onChange={onUpload}
          multiple={true}
        />
        <svg className="fill-current w-4 h-4 mr-2 transform rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
        </svg>
        <span>Upload File</span>
      </label>
    </div>
  );
};

export default FileUploadButton;
