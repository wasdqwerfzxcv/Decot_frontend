import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { getWorkspaceById } from '../services/api';
import CustomModal from '../common/CustomModal';

const MentorWorkspaceContent = () => {
  const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { token } = useAuthContext();

  useEffect(() => {
    const fetchWorkspace = async () => {
      const response = await getWorkspaceById(token, workspaceId);
      if (response.workspace) {
        setWorkspace(response.workspace);
      } else {
        console.error(response.error);
      }
    };
    fetchWorkspace();
  }, [workspaceId, token]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(workspace.joinToken);
      alert('Code copied successfully!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (!workspace) return <div>Loading...</div>;

  return (
    <div className="p-6 flex">
      {/* Sidebar for managing workspace */}
      <div className="w-1/4 bg-gray-100 p-4">
        <h3 className="text-lg font-semibold mb-2">Manage Workspace</h3>
        {/* Invite button that opens modal */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Invite Members
        </button>

        {/* The Modal */}
        <CustomModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Invite Members"
          message="Share this code with the members you want to invite:"
        >
          <div className="flex items-center">
            <span className="mr-4">{workspace.joinToken}</span>
            <button
              onClick={handleCopyCode}
              className="px-4 py-2 bg-green-500 text-white rounded-md"
            >
              Copy Code
            </button>
          </div>
        </CustomModal>
      </div>

      {/* Main content container */}
      <div className="w-3/4 p-6">
        <h2 className="text-2xl font-semibold mb-4">{workspace.name}</h2>
        <p className="text-gray-600 mb-4">{workspace.description}</p>
        {/* Add content such as boards here */}
      </div>
    </div>
  );
};

export default MentorWorkspaceContent;