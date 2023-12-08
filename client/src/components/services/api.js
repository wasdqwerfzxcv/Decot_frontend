const API_URL = 'http://localhost:5000';

export const registerUser = async (username, email, password, role) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password, role }),
    });

    const data = await response.json();

    // Include the status in the returned object for both success and error cases
    return { ...data, status: response.status };
    
  } catch (error) {
    console.error('Failed to register user:', error);
    // Include a status code to indicate a client-side error
    return { error: 'Failed to register user', status: 0 };
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    // Include the status in the returned object for both success and error cases
    return { ...data, status: response.status };

  } catch (error) {
    console.error('Failed to login:', error);
    // Include a status code to indicate a client-side error
    return { error: 'Failed to login', status: 0 };
  }
};

export const createWorkspace = async (token, name, description, color) => {
  try {
    const response = await fetch(`${API_URL}/workspace/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description, color }),
    });

    const data = await response.json();
    return { ...data, status: response.status };

  } catch (error) {
    console.error('Failed to create workspace:', error);
    return { error: 'Failed to create workspace', status: 0 };
  }
};

export const getWorkspaces = async (token) => {
  try {
    const response = await fetch(`${API_URL}/workspace`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return { ...data, status: response.status };

  } catch (error) {
    console.error('Failed to retrieve workspaces:', error);
    return { error: 'Failed to retrieve workspaces', status: 0 };
  }
};

export const getWorkspaceById = async (token, workspaceId) => {
  try {
    const response = await fetch(`${API_URL}/workspace/${workspaceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return { ...data, status: response.status };

  } catch (error) {
    console.error('Failed to retrieve workspace:', error);
    return { error: 'Failed to retrieve workspace', status: 0 };
  }
};

export const joinWorkspace = async (token, joinToken) => {
  try {
    const response = await fetch(`${API_URL}/workspace/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ token: joinToken }),
    });
    const data = await response.json();
    return { ...data, status: response.status };

  } catch (error) {
    console.error('Failed to join workspace:', error);
    return { error: 'Failed to join workspace', status: 0 };
  }
};

export const updateWorkspace = async (token, workspaceId, updatedData) => {
  try {
    const response = await fetch(`${API_URL}/workspace/${workspaceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    const data = await response.json();
    return { ...data, status: response.status };

  } catch (error) {
    console.error('Failed to update workspace:', error);
    return { error: 'Failed to update workspace', status: 0 };
  }
};

export const deleteWorkspace = async (token, workspaceId) => {
  try {
    const response = await fetch(`${API_URL}/workspace/${workspaceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return { ...data, status: response.status };

  } catch (error) {
    console.error('Failed to delete workspace:', error);
    return { error: 'Failed to delete workspace', status: 0 };
  }
};

export const getWorkspaceMembers = async (token, workspaceId) => {
  try {
    const response = await fetch(`${API_URL}/workspace/${workspaceId}/members`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.headers.get('content-type')?.includes('application/json') && response.ok) {
      return response.json();
    } else {
      console.error('Unexpected response:', await response.text());
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const removeWorkspaceMember = async (token, workspaceId, userId) => {
  try {
    const response = await fetch(`${API_URL}/workspace/${workspaceId}/members/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Network response was not ok');
    }
    return { status: response.status, data };
  } catch (error) {
    console.error(error);
  }
};

export const addWorkspaceMember = async (token, workspaceId, boardId, userId) => {
  try {
    const response = await fetch(`${API_URL}/board/workspace/${workspaceId}/board/${boardId}/members/${userId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(response);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Network response was not ok');
    }
    return { status: response.status, data };
  } catch (error) {
    console.error(error);
  }
};

export const getBoardMembers = async (token, boardId, workspaceId) => {
  try {
    const response = await fetch(`${API_URL}/board/workspace/${workspaceId}/board/${boardId}/members`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("hello");
    if (response.headers.get('content-type')?.includes('application/json') && response.ok) {
      return response.json();
    } else {
      console.error('Unexpected response:', await response.text());
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getNotifications = async (token) => {
  try {
    const response = await fetch(`${API_URL}/notification`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Network response was not ok');
    }
    return { status: response.status, data };
    } catch (error) {
    console.error(error);
  }
};

export const removeAllNotifications = async (token) => {
  try {
    const response = await fetch(`${API_URL}/notification`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Network response was not ok');
    }
    return { status: response.status, data };
  } catch (error) {
    console.error(error);
  }
};

export const markAllNotificationsAsRead = async (token) => {
  try {
    const response = await fetch(`${API_URL}/notification/read`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Network response was not ok');
    }
    return { status: response.status, data };
  } catch (error) {
    console.error(error);
  }
};

export const markNotificationAsRead = async (token, notificationId) => {
  try {
    const response = await fetch(`${API_URL}/notification/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Network response was not ok');
    }
    return { status: response.status, data };
  } catch (error) {
    console.error(error);
  }
};

export const deleteNotification = async (token, notificationId) => {
  try {
    const response = await fetch(`${API_URL}/notification/${notificationId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Network response was not ok');
    }
    return { status: response.status, data };
  } catch (error) {
    console.error(error);
  }
};

export const leaveWorkspace = async (token, workspaceId) => {
  try {
    const response = await fetch(`${API_URL}/workspace/${workspaceId}/leave`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Network response was not ok');
    }
    return { status: response.status, data };
  } catch (error) {
    console.error(error);
  }
};
export const createBoard = async (token, boardTitle, dtTag, deadline, description, status, workspaceId) => {
  try {
    const response = await fetch(`${API_URL}/board/workspace/${workspaceId}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ boardTitle, dtTag, deadline, description, status }),
    });
    console.log("create board: " + JSON.stringify(response));
    
    const data = await response.json();
    return { ...data, status: response.status };

  } catch (error) {
    console.error('Failed to create board:', error);
    return { error: 'Failed to create board', status: 0 };
  }
};

export const getBoards = async (token, workspaceId) => {
  try {
    const response = await fetch(`${API_URL}/board/workspace/${workspaceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log(workspaceId);
    //console.log(token);
    console.log(response);
    const data = await response.json();
    return { ...data, status: response.status };
  } catch (error) {
    console.error('Failed to retrieve board:', error);
    return { error: 'Failed to retrieve board', status: 0 };
  }
};

export const getBoardById = async (token, boardId, workspaceId) => {
  try {
    const response = await fetch(`${API_URL}/board/workspace/${workspaceId}/board/${boardId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return { ...data, status: response.status };

  } catch (error) {
    console.error('Failed to retrieve board:', error);
    return { error: 'Failed to retrieve board', status: 0 };
  }
};

export const joinBoard = async (token) => {
  try {
    const response = await fetch(`${API_URL}/board/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });
    console.log("Wthell")
    const data = await response.json();
    return { ...data, status: response.status };

  } catch (error) {
    console.error('Failed to join board:', error);
    return { error: 'Failed to join board', status: 0 };
  }
};

export const updateBoard = async (token, boardId, updatedData, workspaceId) => {
  try {
    const response = await fetch(`${API_URL}/board/workspace/${workspaceId}/board/${boardId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    const data = await response.json();
    return { ...data, status: response.status };

  } catch (error) {
    console.error('Failed to update board:', error);
    return { error: 'Failed to update board', status: 0 };
  }
};

export const deleteBoard = async (token, boardId, workspaceId) => {
  try {
    const response = await fetch(`${API_URL}/board/workspace/${workspaceId}/board/${boardId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return { ...data, status: response.status };

  } catch (error) {
    console.error('Failed to delete board:', error);
    return { error: 'Failed to delete board', status: 0 };
  }
};

// export const uploadImage = async (token, boardId, userId) => {
//   try {
//     const response = await fetch(`${API_URL}/board/${boardId}/diagram/${boardId}`, {
//       method: 'ADD',
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     const data = await response.json();
//     if (!response.ok) {
//       throw new Error(data.message || 'Network response was not ok');
//     }
//     return { status: response.status, data };
//   } catch (error) {
//     console.error(error);
//   }
// };
export const createMessage = async (token, message, workspaceId) => {
  try {
    const response = await fetch(`${API_URL}/message/${workspaceId}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });
    console.log(workspaceId);
    const data = await response.json();
    return { data:data, status: response.status };

  } catch (error) {
    console.error('Fail to create message:', error);
    return { error: 'Fail to create message', status: 0 };
  }
};

export const getAllMessages = async (token, workspaceId) => {
  try {
    const response = await fetch(`${API_URL}/message/${workspaceId}/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log(workspaceId);
    const data = await response.json();
    return { ...data, status: response.status };
  } catch (error) {
    console.error('Failed to load messages:', error);
    return { error: 'Failed to load messages', status: 0 };
  }
};

export const deleteMessage = async (token, messageId, workspaceId) => {
  try {
    console.log(workspaceId)
    const response = await fetch(`${API_URL}/message/${workspaceId}/${messageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Network response was not ok');
    }
    return { ...data, status: response.status };
  } catch (error) {
    console.error('Failed to delete message:', error);
    return { error: 'Failed to delete message', status: 0 };
  }
};

export const authenticateWithGoogle = async () => {
  window.location.href = `${API_URL}/auth/google`;
};

export const updateUserRole = async (email, role) => {
  try {
      const response = await fetch(`${API_URL}/auth/updateRole`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              email,
              role
          })
      });
      return await response.json();
  } catch (error) {
      throw error;
  }
};

export const updateProfile = async (userId, username, expertise) => {
  try {
      const response = await fetch(`${API_URL}/auth/updateProfile`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              userId,
              username,
              expertise,
          })
      });
      return await response.json();
  } catch (error) {
      throw error;
  }
};

export const changePassword = async (userId, newPassword) => {
  try {
      const response = await fetch(`${API_URL}/auth/changePassword`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              userId,
              newPassword
          })
      });
      return await response.json();
  } catch (error) {
      throw error;
  }
};

export const verifyEnteredPassword = async (userId, enteredPassword) => {
  try {
      const response = await fetch(`${API_URL}/auth/verifyEnteredPassword`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              userId,
              enteredPassword,
          })
      });
      return await response.json();
  } catch (error) {
      throw error;
  }
};

export const deleteAccount = async (userId) => {
  try {
      const response = await fetch(`${API_URL}/auth/deleteAccount`, {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              userId
          })
      });
      return await response.json();
  } catch (error) {
      throw error;
  }
};

export const uploadProfilePic = async (userId, file) => {
  const formData = new FormData();
  formData.append('profilePic', file);

  try {
    const response = await fetch(`${API_URL}/auth/uploadProfilePic/${userId}`, {
      method: 'POST',
      body: formData // Pass formData directly
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getMenteeAnalysisData = async (workspaceId, token) => {
  try {
    const response = await fetch(`${API_URL}/workspace/${workspaceId}/menteeAnalysis`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Network response was not ok');
    }
    return { ...data, status: response.status };
  } catch (error) {
    console.error('Failed to fetch mentee analysis data:', error);
    return { error: 'Failed to fetch mentee analysis data', status: 0 };
  }
};
export const createCanvas = async (token, boardId, workspaceId, canvasName ) => {
  try {
    const response = await fetch(`${API_URL}/canvas/workspace/${workspaceId}/board/${boardId}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ canvasName }),
    });
    console.log(token);
    console.log("create canvas: " + JSON.stringify(response));
    
    const data = await response.json();
    return { ...data, status: response.status };

  } catch (error) {
    console.error('Failed to create canvas:', error);
    return { error: 'Failed to create canvas', status: 0 };
  }
};

export const getCanvases = async (token, boardId, workspaceId) => {
  try {
    const response = await fetch(`${API_URL}/canvas/workspace/${workspaceId}/board/${boardId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log(response);
    const data = await response.json();
    return { ...data, status: response.status };
  } catch (error) {
    console.error('Failed to retrieve canvas:', error);
    return { error: 'Failed to retrieve canvas', status: 0 };
  }
};

export const getCanvasById = async (token, boardId, canvasId, workspaceId) => {//open to Canvas.js
  try {
    const response = await fetch(`${API_URL}/canvas/workspace/${workspaceId}/board/${boardId}/canvas/${canvasId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return { ...data, status: response.status };

  } catch (error) {
    console.error('Failed to retrieve canvas:', error);
    return { error: 'Failed to retrieve canvas', status: 0 };
  }
};
export const updateCanvas = async (token, boardId, updatedData, canvasId, workspaceId) => {//for modify purpose
  try {
    const response = await fetch(`${API_URL}/canvas/workspace/${workspaceId}/board/${boardId}/canvas/${canvasId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    const data = await response.json();
    return { ...data, status: response.status };

  } catch (error) {
    console.error('Failed to update canvas:', error);
    return { error: 'Failed to update canvas', status: 0 };
  }
};

export const deleteCanvas = async (token, boardId, canvasId, workspaceId) => {
  try {
    const response = await fetch(`${API_URL}/canvas/workspace/${workspaceId}/board/${boardId}/canvas/${canvasId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return { ...data, status: response.status };

  } catch (error) {
    console.error('Failed to delete canvas:', error);
    return { error: 'Failed to delete canvas', status: 0 };
  }
};

export const getUsernameById = async (token, userId) => {
  try {
    const response = await fetch(`${API_URL}/auth/getUsername/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return { ...data, status: response.status };

  } catch (error) {
    console.error('Failed to retrieve username:', error);
    return { error: 'Failed to retrieve username', status: 0 };
  }
};

export const checkBoardMember = async (token, userId, boardId) => {
  try {
    const response = await fetch(`${API_URL}/board/${boardId}/members/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });
    const data = await response.json();
    return { ...data, status: response.status };

  } catch (error) {
    console.error('Failed to retrieve board member:', error);
    return { error: 'Failed to retrieve board member', status: 0 };
  }
};

export const saveCanvasData = async (token, boardId, canvasId, workspaceId, serializeDrawingDataXml)=>{
  try{
    const response = await fetch(`${API_URL}/canvas/workspace/${workspaceId}/board/${boardId}/canvas/${canvasId}/update`,{
      method: 'PUT',
      headers: {
        'Content-Type': 'text/xml',
        'Authorization': `Bearer ${token}`,
      },
      body: serializeDrawingDataXml,
    });
    return { status: response.status };

  } catch (error) {
    console.error('Failed to save canvas data:', error);
    return { error: 'Failed to save canvas data', status: 0 };
  }
};