export function getFileType(fileName: string) {
    const extension = fileName.split('.').pop();
    switch (extension) {
        case 'pdf':
            return 'PDF Document';
        case 'jpg':
        case 'jpeg':
        case 'png':
            return 'Image';
        case 'mp3':
        case 'wav':
            return 'Audio';
        case 'mp4':
        case 'avi':
        case 'mkv':
            return 'Video';
        case 'txt':
            return 'Text File';
        case 'doc':
        case 'docx':
            return 'Word Document';
        case 'xls':
        case 'xlsx':
            return 'Excel Spreadsheet';
        case 'ppt':
        case 'pptx':
            return 'PowerPoint Presentation';
        case 'zip':
            return 'ZIP Archive';
        case 'rar':
            return 'RAR Archive';
        case 'gif':
            return 'GIF Image';
        case 'svg':
            return 'SVG Image';
        case 'html':
        case 'htm':
            return 'HTML Document';
        case 'css':
            return 'CSS Stylesheet';
        case 'js':
            return 'JavaScript File';
        case 'json':
            return 'JSON File';
        default:
            return 'Folder';
    }
};

 
export function getFileIcon(filename: string) {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'jpg':
        case 'jpeg':
        case 'png':
            return '/icons/png-icon.png';
        case 'gif':
            return '/icons/image-icon.png';
        case 'pdf':
            return '/icons/pdf-icon.png';
        case 'doc':
        case 'docx':
            return '/icons/doc-icon.png';
        case 'xls':
        case 'xlsx':
            return '/icons/xls-icon.png';
        case 'ppt':
        case 'pptx':
            return '/icons/ppt-icon.png';
        case 'zip':
            return '/icons/zip-icon.png';
        case 'rar':
            return '/icons/rar-icon.png';
        case 'txt':
            return '/icons/txt-icon.png';
        case 'html':
        case 'htm':
            return '/icons/html-icon.png';
        case 'css':
            return '/icons/css-icon.png';
        case 'svg':
            return '/icons/svg-icon.png';
        case 'js':
            return '/icons/js-icon.png';
        case 'json':
            return '/icons/json-icon.png';
        default:
            return '/icons/folder-icon.png';
    }
};

export const formatFileSize = (size: number): string => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KiB`;
    } else if (size < 1024 * 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
  };

export const extractFolderName = (filePath: string): string => {

    const cleanedPath = filePath.replace(/\/+$/, '');
 
    const parts = cleanedPath.split('/');
    
    if (parts.length >= 1) {
      return parts[parts.length - 1];
    }

    return parts[0];
  };


