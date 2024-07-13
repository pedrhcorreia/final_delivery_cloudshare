const rootPath = "https://cloudshare-api.local";

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

export const searchUsers = async (prefix: string, accessToken: string) => {
  try {
    const response = await fetch(`${rootPath}/user/search?prefix=${encodeURIComponent(prefix)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No users found');
      } else {
        throw new Error('Failed to search users');
      }
    }

    console.log(`HTTP 200 OK: Found users with prefix: ${prefix}`);
    return await response.json();
  } catch (error) {
    console.error(`Error searching users with prefix ${prefix}:`, error);
    throw error;
  }
};

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

export const createGroup = async (userId: number, name: string, accessToken: string) => {
  try {
    const response = await fetch(`${rootPath}/user/${userId}/group`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error('Failed to create group');
    }
  } catch (error) {
    throw new Error('Failed to create group');
  }
};

export const deleteGroup = async (userId: number, groupId: number, accessToken: string) => {

  try {
    const response = await fetch(`${rootPath}/user/${userId}/group/${groupId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete group');
    }
  } catch (error) {
    throw new Error('Failed to delete group');
  }
};

export const removeMemberFromGroup = async (userId: number, groupId: number, memberId: number, accessToken: string) => {
  try {
    const response = await fetch(`${rootPath}/user/${userId}/group/${groupId}/member/${memberId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to remove member from group');
    }
  } catch (error) {
    throw new Error('Failed to remove member from group');
  }
};


export const fetchGroupMembers = async (userId: number, groupId: number, accessToken: string) => {
  try {
    const response = await fetch(`${rootPath}/user/${userId}/group/${groupId}/member`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch group members');
    }

    return await response.json();
  } catch (error) {
    throw new Error('Failed to fetch group members');
  }
};

export const addUserToGroup = async (groupOwnerId: number ,userId: number, groupId: number, accessToken: string) => {
  console.log(`${rootPath}/user/${groupOwnerId}/group/${groupId}    + ${userId}`);
  try {
    const response = await fetch(`${rootPath}/user/${groupOwnerId}/group/${groupId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to add user to group');
    }

    console.log(`HTTP 200 OK: User with ID: ${userId} added to group with ID: ${groupId}`);
    return response;
  } catch (error) {
    console.error('Error adding user to group:', error);
    throw error;
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
  
  export const shareFile = async (userId: number, recipientId: number, filename: string, recipientType : string, accessToken: string) => {
    const url = `${rootPath}/user/${userId}/fileshare`; 
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          recipientType: recipientType, 
          recipientId: recipientId,
          filename: filename,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to share file');
      }
      return response;
    } catch (error) {
      console.error('Error sharing file:', error);
      throw error;
    }
  };

  export const deleteFileShare = async (userId: number, fileShareId: number, accessToken: string) => {
    const url = `${rootPath}/user/${userId}/fileshare`;
  
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ fileShareId: fileShareId }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete file share');
      }
      return response;
    } catch (error) {
      console.error('Error deleting file share:', error);
      throw error;
    }
  };
  

  export const getFilesSharedByUser = async (userId: number, accessToken: string) => {
    try {
      const response = await fetch(`${rootPath}/user/${userId}/fileshare`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch shared files by user');
      }
  
      return response.json(); 
    } catch (error) {
      console.error('Error fetching shared files by user:', error);
      throw error; 
    }
  };
  export const getFilesSharedToUser = async (userId: number, accessToken: string) => {
    try {
      const response = await fetch(`${rootPath}/user/${userId}/fileshare/received`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch shared files to user');
      }
  
      return response.json(); 
    } catch (error) {
      console.error('Error fetching shared files to user:', error);
      throw error; 
    }
  };

  export const downloadFile = async (userId: number, accessToken: string, objectKey: string) => {
    const downloadUrl = `${rootPath}/user/${userId}/object/download?objectKey=${encodeURIComponent(objectKey)}`;
    console.log(downloadUrl);
    
    const response = await fetch(downloadUrl, {
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

  export const downloadFileStream = async (userId: number, accessToken: string, objectKey: string) => {
    const downloadUrl = `${rootPath}/user/${userId}/object/download/stream?objectKey=${encodeURIComponent(objectKey)}`;
    
    try {
        const response = await fetch(downloadUrl, {
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

        const contentDisposition = response.headers.get('Content-Disposition');
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition || '');
        const suggestedFileName = matches && matches.length > 1 ? matches[1] : objectKey;

        const reader = response.body!.getReader();
        const stream = new ReadableStream({
            start(controller) {
                function push() {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            controller.close();
                            return;
                        }
                        controller.enqueue(value);
                        push();
                    });
                }
                push();
            }
        });

        const newResponse = new Response(stream);
        const blob = await newResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = suggestedFileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error downloading file:', error);
    }
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
    await uploadFileEntirely(userId, accessToken, formData, onProgress);
  };

async function uploadFileEntirely(userId: number, accessToken: string, formData: FormData,  onProgress: (progress: number) => void){

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
}

export const initiateMultipartUpload= async(userId: number, filename: string, mimeType: string, accessToken: string) =>{
    const response = await fetch(`${rootPath}/user/${userId}/object/multipart/start?filename=${encodeURIComponent(filename)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to initiate multipart upload');
    }

    return response.json(); 
}
export const uploadPart = async (
  userId: number,
  accessToken: string,
  filename: string,
  uploadId: string,
  partNumber: number,
  filePart: any,
  abortController: AbortController  
) => {
  const formData = new FormData();
  formData.append('file', filePart);
  formData.append('filename', filename);
  formData.append('partNumber', partNumber.toString());
  formData.append('uploadId', uploadId);

  const response = await fetch(
    `${rootPath}/user/${userId}/object/multipart/upload`,
    {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal: abortController.signal, 
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to upload part ${partNumber}`);
  } else {
    const jsonResponse = await response.json();
    console.log(jsonResponse);

    return jsonResponse;
  }
};


export const completeMultipartUpload = async(userId: number, accessToken: string , filename: string, uploadId: string) => {
  const response = await fetch(`${rootPath}/user/${userId}/object/multipart/complete`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ filename, uploadId })
  });

  if (!response.ok) {
      throw new Error('Failed to complete multipart upload');
  }else{
    return response
  }
}


export const abortMultipartUpload= async(userId: number, filename:string , uploadId: string, accessToken: string) =>{
    const response = await fetch(`${rootPath}/user/${userId}/object/multipart/abort`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ filename, uploadId })
    });

    if (!response.ok) {
        throw new Error('Failed to abort multipart upload');
    }else{
      return response
    }
}
  export const createEmptyFolder = async (userId: number, folderName: string, accessToken: string) => {
    try {
      const response = await fetch(`${rootPath}/user/${userId}/object/folder?folderName=${encodeURIComponent(folderName+"/")}`, {
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
  export const renameFile = async (userId: number, accessToken: string, objectKey: string, newName: string) => {
    try {
      const response = await fetch(`${rootPath}/user/${userId}/object?objectKey=${encodeURIComponent(objectKey)}&newName=${encodeURIComponent(newName)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to rename file');
      }
  
      console.log('File renamed successfully');
      return response;
    } catch (error) {
      console.error('Failed to rename file:', error);
      throw error;
    }
  };
  
  export const renameGroup = async (userId: number, accessToken: string, groupId: number, newName: string) => {
    try {
      const response = await fetch(`${rootPath}/user/${userId}/group/${groupId}/name`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({name: newName})
      });
  
      if (!response.ok) {
        throw new Error('Failed to rename group');
      }
  
      console.log('Group renamed successfully');
      return response;
    } catch (error) {
      console.error('Failed to rename group:', error);
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
