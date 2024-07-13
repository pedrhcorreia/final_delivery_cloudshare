export function getFileType(fileName: string) {
    if (fileName.endsWith('/')) {
        return 'Folder';
    }

    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) {
        return 'File'; 
    }
    const extension = fileName.slice(lastDotIndex + 1).toLowerCase();
    switch (extension) {
        case 'pdf':
            return 'PDF Document';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'svg':
        case 'webp':
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
            return 'Unknown Type';
    }
}

export function formatLastModified(isoDate: string) {
    const date = new Date(isoDate);
    return date.toLocaleString(); 
  };
export function getFileIcon(filename: string) {
    
    if (filename.endsWith('/')) {
        return '/icons/folder-icon.png'; 
    }
    
 
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) {
        return '/icons/default-icon.png'; 
    }
    
    const extension = filename.slice(lastDotIndex + 1).toLowerCase();
    switch (extension) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return `/icons/png-icon.png`;
        case 'svg':
            return `/icons/svg-icon.png`;
        case 'webp':
            return `/icons/webp-icon.png`;
        case 'pdf':
            return `/icons/pdf-icon.png`;
        case 'doc':
        case 'docx':
            return `/icons/doc-icon.png`;
        case 'xls':
        case 'xlsx':
            return `/icons/xls-icon.png`;
        case 'ppt':
        case 'pptx':
            return `/icons/ppt-icon.png`;
        case 'zip':
            return `/icons/zip-icon.png`;
        case 'rar':
            return `/icons/rar-icon.png`;
        case 'txt':
            return `/icons/txt-icon.png`;
        case 'html':
        case 'htm':
            return `/icons/html-icon.png`;
        case 'css':
            return `/icons/css-icon.png`;
        case 'js':
            return `/icons/js-icon.png`;
        case 'json':
            return `/icons/json-icon.png`;
        default:
            return `/icons/default-icon.png`;
    }
}



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

  export const getCleanFileName = (file: string): string => {
    if (file.endsWith('/')) {
      file = file.slice(0, -1);
    }
    const segments = file.split('/');
    return segments[segments.length - 1];
  };

  export const filterMissingFolder = (file:any , files: any, remaining: string ,i : number): boolean =>{
     const remainSplit = remaining.split('/');
    let x =0 ;
    if(getFileType(file.objectKey)==="Folder"){
        x = file.objectKey.length - remainSplit[remainSplit.length-2].length -1
    }else{
        x = file.objectKey.length - remainSplit[remainSplit.length-1].length 
    }
    if(!files.some((f: any) => f.objectKey ===  file.objectKey.substring(0,x))){
        return true;
    }
    return false;

  }
  
  


