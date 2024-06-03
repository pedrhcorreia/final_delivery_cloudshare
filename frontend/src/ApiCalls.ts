const rootPath = "/api";

async function handleResponse(response: Response) {
    const jsonData = await response.json();
    if (!response.ok) {
        throw new Error(jsonData.Error || 'Something went wrong');
    }
    return jsonData;
}





export async function RegisterUser(username: string, password: string) {
    return fetchAuthentication("/auth/signup", username, password);
}



export const getUserGroups = async (userId: number, accessToken: string) => {
  const response = await fetch(`${rootPath}/user/${userId}/group`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user files');
  }

  return response.json();
};

export const createGroup = async (userId: number, groupName: string, accessToken: string) => {
  try {
    console.log(`${rootPath}/user/${userId}/group`);
    const response = await fetch(`${rootPath}/user/${userId}/group`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ groupName }),
    });

    if (!response.ok) {
      console.log(response)
      throw new Error('Failed to create group');
    }
  } catch (error) {
    throw new Error('Failed to create group');
  }
};

export const fetchUserFiles = async (userId: number, accessToken: string) => {
    const response = await fetch(`${rootPath}/user/${userId}/object`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch user files');
    }
  
    return response.json();
  };
  


  export const downloadFile = async (userId: number, accessToken: string, objectKey: string) => {
    const response = await fetch(`${rootPath}/user/${userId}/object?objectKey=${encodeURIComponent(objectKey)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  
    if (!response.ok) {
      let errorMessage = 'Failed to download file';
      if (response.status === 404) {
        errorMessage = 'File not found';
      } else if (response.status === 403) {
        errorMessage = 'You are not authorized to access this file';
      }
      throw new Error(errorMessage);
    }
    const blob = await response.blob();
  
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = objectKey; 
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  export const uploadFile = async (
    userId: number,
    accessToken: string,
    file: File,
    onProgress: (progress: number) => void
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name);
    formData.append('mimetype', file.type);
  
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${rootPath}/user/${userId}/object`);
  
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
  
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgress(percentComplete);
        }
      };
  
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Failed to upload file ${xhr.status}`));
        }
      };
  
      xhr.onerror = () => reject(new Error('Failed to upload file'));
  
      xhr.send(formData);
    });
  };

  export const createEmptyFolder = async (userId: number, folderName: string, accessToken: string) => {
    try {
      const response = await fetch(`${rootPath}/user/${userId}/object/folder?folderName=${encodeURIComponent(folderName)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to create folder');
      }
  
      return response;
    } catch (error) {
      console.error('Failed to create folder:', error);
      throw error;
    }
  };
  
  
  export const deleteFile = async (userId: number, accessToken: string, objectKey: string) => {
    try {
      console.log(`${rootPath}/user/${userId}/object?objectKey=${encodeURIComponent(objectKey)}`);
      const response = await fetch(`${rootPath}/user/${userId}/object?objectKey=${encodeURIComponent(objectKey)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
  
      console.log('File deleted successfully');
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  };


export async function LoginUser(username: string, password: string) {
    return fetchAuthentication("/auth/login", username, password);
}

async function fetchAuthentication(type: string, username: string, password: string) {
    try {
        console.log(`${rootPath}${type}`);
        const response = await fetch(`${rootPath}${type}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        return handleResponse(response);
    } catch (error) {
        console.error(`Fetch ${type} failed:`, error);
        throw error;
    }
}
