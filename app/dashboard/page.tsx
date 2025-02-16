'use client';

import { useEffect, useState, useRef } from 'react';
import UserInfo from './components/UserInfo';
import SearchBar from './components/SearchBar';
import UserDropdown from './components/UserDropdown';
import UserSettings from './components/UserSettings';
import Sidebar from './components/Sidebar';
import HelpCenterModal from './components/HelpCenterModal';
import { Folder, Workspace } from '@/types/workspace';
import { User } from '@/types/user';
import ConfirmChangePasswordModal from './components/ConfirmChangePasswordModal';

// Make sure that supabase is correctly imported and configured.
import { createClient } from '@/utils/supabase/client';
import CreateFolderModal from './components/CreateFolderModal';
import CreateSubfolderModal from './components/CreateSubfolderModal';
import EditFolderModal from './components/EditFolderModal';
import Canvas from './components/Canvas';
import UploadImageModal from './components/UploadImageModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import CreateFlowModal from './components/CreateFlowModal';
import { Workflow } from '@/types/workflow';
import { createWorkflow } from '../utils/createWorkflow';
import ConfirmDeleteFolderModal from './components/ConfirmDeleteFolderModal';
import { deleteWorkflow } from '../utils/deleteWorkflow';
import ConfirmDeleteFlowModal from './components/ConfirmDeleteFlowModal';
import EditFlowModal from './components/EditFlowModal';
import { updateWorkflow } from '@/app/utils/updateWorkflow';
import MoveWorkflowModal from './components/MoveWorkflowModal';

export default function Page() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [userSettingsVisible, setUserSettingsVisible] =
    useState<boolean>(false);
  const [helpCenterVisible, setHelpCenterVisible] = useState<boolean>(false);
  const [createFolderVisible, setCreateFolderVisible] =
    useState<boolean>(false);
  const [createSubfolderVisible, setCreateSubfolderVisible] =
    useState<boolean>(false);
  const [editFolderVisible, setEditFolderVisible] = useState<boolean>(false);
  const [uploadImageVisible, setUploadImageVisible] = useState<boolean>(false);
  const [deleteAccountVisible, setDeleteAccountVisible] =
    useState<boolean>(false);
  const [deleteFolderVisible, setDeleteFolderVisible] =
    useState<boolean>(false);
  const [createFlowVisible, setCreateFlowVisible] = useState<boolean>(false);
  const [deleteFlowVisible, setDeleteFlowVisible] = useState<boolean>(false);
  const [editFlowVisible, setEditFlowVisible] = useState<boolean>(false);
  const [moveFlowVisible, setMoveFlowVisible] = useState<boolean>(false);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(
    null
  );
  const [isDeleteAvatar, setIsDeleteAvatar] = useState<boolean>(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [passwordChanged, setPasswordChanged] = useState<boolean>(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(
    null
  );
  const [selectedFolder, setSelectedFolder] = useState<Folder | undefined>(
    undefined
  );
  const [sidebarSelectedFolder, setSidebarSelectedFolder] = useState<
    Folder | undefined
  >(undefined);
  const [folderParent, setFolderParent] = useState<Folder | null>(null);
  const [folderParentId, setFolderParentId] = useState<number | null>(null);
  const supabase = createClient();

  // States for password change
  const [newPassword, setNewPassword] = useState<string>(''); // if empty string, treat as not active

  // Ref used as a flag so that the active_workspace update is performed only once
  const activeWorkspaceUpdatedRef = useRef(false);

  // Fetch user data from your API
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/user');
      const data = await res.json();
      if (data) {
        setUser(data);
      }
    };
    fetchUser();
  }, []);

  // Fetch the signed URL if needed
  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (user && user.avatar_url && !user.avatar_signed_url) {
        console.log('getting avatar url : ' + user.avatar_url);
        user.avatar_signed_url = user.avatar_url;
      }
    };

    fetchSignedUrl();
  }, [user]);

  // Fetch workspaces specific to the user
  useEffect(() => {
    if (user) {
      const fetchWorkspaces = async (userId: string) => {
        const res = await fetch(`/api/workspaces/${userId}`);
        const data = await res.json();
        if (data.error) {
          console.error('Error fetching workspaces:', data.error);
        } else {
          setWorkspaces(data);
        }
      };

      fetchWorkspaces(user.id.toString());
    }
  }, [user]);

  // Effect to set activeWorkspace.
  useEffect(() => {
    if (user && workspaces.length > 0) {
      if (!user.active_workspace) {
        if (!activeWorkspaceUpdatedRef.current) {
          if (!activeWorkspace || activeWorkspace.id !== workspaces[0].id) {
            setActiveWorkspace(workspaces[0]);
          }
          activeWorkspaceUpdatedRef.current = true;
          const updateActiveWorkspace = async () => {
            const updateRes = await fetch('/api/user/update', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: user.id,
                active_workspace: workspaces[0].id,
              }),
            });
            if (updateRes.ok) {
              const updatedUser = await updateRes.json();
              if (updatedUser.active_workspace !== user.active_workspace) {
                setUser(updatedUser);
              }
            } else {
              console.error('Error updating user active_workspace');
            }
          };
          updateActiveWorkspace();
        }
      } else {
        const foundWorkspace = workspaces.find(
          (ws) => ws.id === user.active_workspace
        );
        if (foundWorkspace) {
          if (!activeWorkspace || activeWorkspace.id !== foundWorkspace.id) {
            setActiveWorkspace(foundWorkspace);
          }
        } else {
          if (!activeWorkspaceUpdatedRef.current) {
            if (!activeWorkspace || activeWorkspace.id !== workspaces[0].id) {
              setActiveWorkspace(workspaces[0]);
            }
            activeWorkspaceUpdatedRef.current = true;
            const updateActiveWorkspace = async () => {
              const updateRes = await fetch('/api/user/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: user.id,
                  active_workspace: workspaces[0].id,
                }),
              });
              if (updateRes.ok) {
                const updatedUser = await updateRes.json();
                if (updatedUser.active_workspace !== user.active_workspace) {
                  setUser(updatedUser);
                }
              } else {
                console.error('Error updating user active_workspace');
              }
            };
            updateActiveWorkspace();
          }
        }
      }
    }
  }, [user, workspaces]);

  const addWorkspace = async (workspaceName: string) => {
    if (!user) return;
    const response = await fetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: workspaceName,
        user_id: user.id,
      }),
    });
    // Refresh workspaces if needed.
  };

  const handleDuplicateWorkflow = async () => {
    if (!selectedWorkflow || !activeWorkspace) return;

    const baseName = selectedWorkflow.name;
    let duplicateName = baseName;
    let counter = 1;

    // Get all workflow names in the current workspace
    const existingNames = new Set(activeWorkspace.workflows.map((w) => w.name));

    // Ensure the name is unique by appending a counter if needed
    while (existingNames.has(duplicateName)) {
      duplicateName = `${baseName} (${counter})`;
      counter++;
    }

    await handleCreateWorkflow(duplicateName, selectedWorkflow.description);
  };

  const handleCreateWorkflow = async (name: string, description: string) => {
    if (!activeWorkspace) {
      console.error('No active workspace selected');
      return;
    }

    const newWorkflow = await createWorkflow(
      name,
      description,
      activeWorkspace.id,
      selectedFolder?.id || null,
      [] // team tags
    );

    if (newWorkflow) {
      // Update the list of workspaces
      setWorkspaces((prevWorkspaces) =>
        prevWorkspaces.map((workspace) =>
          workspace.id === newWorkflow.workspaceId
            ? {
                ...workspace,
                workflows: [...workspace.workflows, newWorkflow],
              }
            : workspace
        )
      );

      // Update the active workspace
      setActiveWorkspace((prev) =>
        prev
          ? {
              ...prev,
              workflows: [...prev.workflows, newWorkflow],
            }
          : prev
      );

      console.log('Workflow created successfully:', newWorkflow);
    }
  };

  async function handleEditWorkflow(
    workflowId: number,
    name: string,
    description: string,
    folder: Folder | null | undefined
  ): Promise<Workflow | null> {
    // Prepare the partial update data
    if (folder === null) console.log('putting folder to root');
    const updateData = {
      name, // Update the name
      description, // Update the description
      folder_id:
        folder === null ? 0 : folder !== undefined ? folder.id : undefined,
    };

    // Call the updateWorkflow function
    const updatedWorkflow = await updateWorkflow(workflowId, updateData);

    if (updatedWorkflow) {
      console.log('Workflow updated successfully:', updatedWorkflow);

      // Update the activeWorkspace state
      if (activeWorkspace) {
        const updatedWorkflows = activeWorkspace.workflows.map((workflow) =>
          workflow.id === updatedWorkflow.id ? updatedWorkflow : workflow
        );

        setActiveWorkspace({
          ...activeWorkspace,
          workflows: updatedWorkflows,
        });
      }
    } else {
      console.error('Failed to update workflow.');
    }

    return updatedWorkflow;
  }

  const handleDeleteWorkflow = async (workflowId: number) => {
    const wasDeleted = await deleteWorkflow(workflowId);

    if (wasDeleted && activeWorkspace) {
      // Update the state to remove the deleted workflow
      setActiveWorkspace({
        ...activeWorkspace,
        workflows: activeWorkspace.workflows.filter(
          (workflow) => workflow.id !== workflowId
        ),
      });

      console.log('Workflow deleted and state updated');
    } else {
      console.log('Failed to delete workflow');
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const onSelectFolderSidebar = (folder?: Folder) => {
    console.log('select folder : ' + folder?.name);
    setSidebarSelectedFolder(folder);
  };

  const onSelectFolderView = (folder?: Folder) => {
    setSelectedFolder(folder);
  };

  // Toggle the dropdown
  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  const openUserSettings = () => {
    setUserSettingsVisible(true);
    setDropdownVisible(false);
  };

  const closeUserSettings = () => {
    setFileToUpload(null);
    setUserSettingsVisible(false);
    setPasswordChanged(false);
  };

  // Open the modal for the Help Center
  const openHelpCenter = () => {
    setHelpCenterVisible(true);
    setDropdownVisible(false);
  };

  const openCreateFolder = (parentId?: number) => {
    if (parentId) {
      setFolderParentId(parentId);
    } else {
      setCreateFolderVisible(true);
      // setOnCreateFolderAction(() => fn);
    }
  };

  const openCreateSubFolder = (parentFolder: Folder) => {
    setCreateSubfolderVisible(true);
    // setOnCreateSubfolderAction(() => fn);
    setFolderParent(parentFolder);
  };

  const openEditFolder = (parentFolder: Folder) => {
    setEditFolderVisible(true);
    // setOnEditFolderAction(() => fn);
  };

  const openUploadImage = () => {
    setUploadImageVisible(true);
  };

  const openDeleteAccount = () => {
    setDeleteAccountVisible(true);
  };

  const closeDeleteAccount = () => {
    setDeleteAccountVisible(false);
  };

  const openCreateFlow = () => {
    setCreateFlowVisible(true);
  };

  const openDeleteFolder = () => {
    // setOnDeleteFolderAction(() => fn);
    setDeleteFolderVisible(true);
  };

  const openDeleteFlow = () => {
    setDeleteFlowVisible(true);
  };

  const openEditFlow = () => {
    setEditFlowVisible(true);
  };

  const openMoveFlow = () => {
    setMoveFlowVisible(true);
  };

  const closeMoveFlow = () => {
    setMoveFlowVisible(false);
  };

  const closeEditFlow = () => {
    setEditFlowVisible(false);
  };

  const closeDeleteFlow = () => {
    setSelectedWorkflow(null);
    setDeleteFlowVisible(false);
  };

  const closeDeleteFolder = () => {
    setDeleteFolderVisible(false);
  };

  const closeCreateFlow = () => {
    setCreateFlowVisible(false);
  };

  const closeUploadImage = () => {
    setUploadImageVisible(false);
  };

  const closeCreateSubfolder = () => {
    setFolderParent(null);
    setCreateSubfolderVisible(false);
  };

  const closeCreateFolder = () => {
    setCreateFolderVisible(false);
  };

  const closeEditFolder = () => {
    setFolderParent(null);
    setEditFolderVisible(false);
  };

  const closeHelpCenter = () => {
    setHelpCenterVisible(false);
  };

  const handleSelectWorkflow = (workflow: Workflow | null) => {
    if (workflow) console.log('select workflow: ' + workflow?.name);
    setSelectedWorkflow(workflow);
  };

  // Function to update the user in state
  const updateUser = (user: User) => {
    setUser(user);
  };

  const updateActiveWorkspace = async (workspace: Workspace) => {
    if (user) {
      const updateRes = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          active_workspace: workspace.id,
        }),
      });
      if (updateRes.ok) {
        const updatedUser = await updateRes.json();
        if (updatedUser.active_workspace !== user.active_workspace) {
          setUser(updatedUser);
          setActiveWorkspace(workspace);
        }
      } else {
        console.error('Error updating user active_workspace');
      }
    } else {
      console.log('no user to update');
    }
  };

  // Handle updating the password.
  const handleUpdatePassword = async () => {
    // Example using Supabase. Adjust as needed for your auth logic.
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      console.error(
        'Erreur lors de la mise à jour du mot de passe:',
        error.message
      );
      alert('Erreur lors de la mise à jour du mot de passe : ' + error.message);
      return;
    }

    setPasswordChanged(true);
    handleCancelPasswordChange();
  };

  // Resets the password change state.
  const handleCancelPasswordChange = () => {
    setNewPassword('');
  };

  const setDeleteAvatar = () => {
    setIsDeleteAvatar(true);
  };

  const unsetDeleteAvatar = () => {
    setIsDeleteAvatar(false);
  };

  // FOLDER MANAGEMENT
  // Handler to add a top-level folder (parent_id will be null)
  const handleAddFolder = async (
    name: string,
    icon_url?: string,
    emote?: string
  ) => {
    if (!activeWorkspace) return;

    try {
      const res = await fetch('/api/workspaces/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          workspace_id: activeWorkspace.id,
          team_tags: [],
          icon_url,
          emote,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add folder');
      }

      const newFolder: Folder = await res.json();

      setActiveWorkspace((prevWorkspace) =>
        prevWorkspace
          ? {
              ...prevWorkspace,
              folders: [...prevWorkspace.folders, newFolder],
            }
          : null
      );
    } catch (error) {
      console.error('Error adding folder:', error);
    }
  };

  // Handler to add a subfolder with a given parent folder id
  const handleAddSubfolder = async (
    name: string,
    parentId: number,
    icon_url?: string,
    emote?: string
  ) => {
    if (!activeWorkspace) return;

    try {
      const res = await fetch('/api/workspaces/subfolders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          workspace_id: activeWorkspace.id,
          parent_id: parentId,
          team_tags: [],
          icon_url,
          emote,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add subfolder');
      }

      const newSubfolder: Folder = await res.json();

      setActiveWorkspace((prevWorkspace) =>
        prevWorkspace
          ? {
              ...prevWorkspace,
              folders: [...prevWorkspace.folders, newSubfolder],
            }
          : null
      );

      setSidebarSelectedFolder(undefined);
    } catch (error) {
      console.error('Error adding subfolder:', error);
    }
  };

  //Handler to edit a specific folder
  const handleEditFolder = async (
    name: string,
    icon_url?: string | null,
    emote?: string | null
  ) => {
    if (!sidebarSelectedFolder || !activeWorkspace) return;

    try {
      const response = await fetch(
        `/api/workspaces/folders/${sidebarSelectedFolder.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, icon_url, emote }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update folder');
      }

      const updatedFolder: Folder = await response.json();

      setActiveWorkspace((prevWorkspace) =>
        prevWorkspace
          ? {
              ...prevWorkspace,
              folders: prevWorkspace.folders.map((folder) =>
                folder.id === sidebarSelectedFolder.id
                  ? { ...folder, ...updatedFolder }
                  : folder
              ),
            }
          : null
      );
      if (selectedFolder && selectedFolder.id === updatedFolder.id)
        setSelectedFolder(updatedFolder);
      setSidebarSelectedFolder(undefined);
    } catch (error) {
      console.error('Error updating folder:', error);
    }
  };

  //Handler to delete a specific folder
  const handleDeleteFolder = async () => {
    if (!selectedFolder || !activeWorkspace) return;

    try {
      const response = await fetch(
        `/api/workspaces/folders/${selectedFolder.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete folder');
      }

      const data = await response.json();
      console.log('Folder deleted successfully:', data);

      setActiveWorkspace((prevWorkspace) =>
        prevWorkspace
          ? {
              ...prevWorkspace,
              folders: prevWorkspace.folders.filter(
                (folder) => folder.id !== selectedFolder.id
              ),
            }
          : null
      );
      setSelectedFolder(undefined);
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  // FOLDER MANAGEMENT

  return (
    <>
      <div className="flex h-screen w-screen overflow-hidden">
        {/* Sidebar with header and list of workspaces */}
        {user && user.email && activeWorkspace && (
          <Sidebar
            workspaces={workspaces}
            userEmail={user.email}
            activeWorkspace={activeWorkspace}
            setActiveWorkspace={updateActiveWorkspace}
            onCreateFolder={openCreateFolder}
            onEditFolder={openEditFolder}
            onCreateSubfolder={openCreateSubFolder}
            onDeleteFolder={openDeleteFolder}
            onSelectFolder={onSelectFolderSidebar}
            onSelectFolderView={onSelectFolderView}
            onOpenUserSettings={openUserSettings}
            user={user}
            onOpenHelpCenter={openHelpCenter}
            selectedFolder={sidebarSelectedFolder}
          />
        )}

        <div className="flex flex-col flex-1">
          {/* Page header */}
          <header className="h-[73px] bg-white border-b border-gray-200 flex justify-between items-center px-4 relative">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
            />
            <div className="relative cursor-pointer" onClick={toggleDropdown}>
              <UserInfo user={user} />
              {dropdownVisible && (
                <div className="absolute top-full right-0 mt-2 z-10">
                  <UserDropdown
                    user={user}
                    onOpenUserSettings={openUserSettings}
                    onOpenHelpCenter={openHelpCenter}
                    onClose={() => setDropdownVisible(false)}
                  />
                </div>
              )}
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 w-full h-[100%] bg-gray-100">
            {activeWorkspace && (
              <Canvas
                workspace={activeWorkspace}
                selectedFolder={selectedFolder}
                searchTerm={searchTerm}
                onSelectWorkflow={handleSelectWorkflow}
                openCreateFlow={openCreateFlow}
                onDeleteWorkflow={openDeleteFlow}
                onEditWorkflow={openEditFlow}
                onDuplicateWorkflow={handleDuplicateWorkflow}
                onMoveWorkflow={openMoveFlow}
              />
            )}
          </main>
        </div>
      </div>

      {/* Modal for user settings */}
      {user && userSettingsVisible && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
          <UserSettings
            user={user}
            updateNewPassword={setNewPassword}
            passwordChanged={passwordChanged}
            openImageUpload={openUploadImage}
            openDeleteAccount={openDeleteAccount}
            onClose={closeUserSettings}
            onUserUpdate={updateUser}
            selectedFile={fileToUpload}
            isDeleteAvatar={isDeleteAvatar}
            onDeleteAvatar={setDeleteAvatar}
          />
        </div>
      )}

      {/* Password Change Modal: Displayed only if newPassword is not empty */}
      {newPassword !== '' && (
        <ConfirmChangePasswordModal
          onCancel={handleCancelPasswordChange}
          onChangePassword={handleUpdatePassword}
        />
      )}

      {createFolderVisible && (
        <CreateFolderModal
          onClose={closeCreateFolder}
          onCreate={handleAddFolder}
        ></CreateFolderModal>
      )}

      {createSubfolderVisible && folderParent && (
        <CreateSubfolderModal
          onClose={closeCreateSubfolder}
          onCreate={handleAddSubfolder}
          parentId={folderParent?.id}
          parent={folderParent}
        ></CreateSubfolderModal>
      )}

      {editFolderVisible && sidebarSelectedFolder && (
        <EditFolderModal
          onClose={closeEditFolder}
          onEdit={handleEditFolder}
          folder={sidebarSelectedFolder}
        ></EditFolderModal>
      )}

      {/* Modal for Help Center */}
      {helpCenterVisible && user && (
        <HelpCenterModal onClose={closeHelpCenter} user={user} />
      )}

      {uploadImageVisible && (
        <UploadImageModal
          onClose={closeUploadImage}
          onSave={(file: File) => {
            unsetDeleteAvatar();
            setFileToUpload(file);
          }}
        />
      )}

      {deleteAccountVisible && user && (
        <ConfirmDeleteModal user={user} onClose={closeDeleteAccount} />
      )}

      {createFlowVisible && (
        <CreateFlowModal
          onClose={closeCreateFlow}
          onCreateFlow={handleCreateWorkflow}
        />
      )}

      {deleteFolderVisible && (
        <ConfirmDeleteFolderModal
          onClose={closeDeleteFolder}
          onDelete={handleDeleteFolder}
        />
      )}

      {editFlowVisible && selectedWorkflow && (
        <EditFlowModal
          onClose={closeEditFlow}
          onConfirm={handleEditWorkflow}
          selectedWorkflow={selectedWorkflow}
        />
      )}

      {moveFlowVisible && selectedWorkflow && activeWorkspace && (
        <MoveWorkflowModal
          onClose={closeMoveFlow}
          onConfirm={async (folder) =>
            handleEditWorkflow(
              selectedWorkflow.id,
              selectedWorkflow.name,
              selectedWorkflow.description,
              folder
            )
          }
          selectedWorkflow={selectedWorkflow}
          activeWorkspace={activeWorkspace}
        />
      )}

      {deleteFlowVisible && selectedWorkflow && (
        <ConfirmDeleteFlowModal
          onClose={closeDeleteFlow}
          onDelete={handleDeleteWorkflow}
          selectedWorkflow={selectedWorkflow}
        />
      )}
    </>
  );
}
