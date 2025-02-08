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
import { createWorkflow } from './utils/createWorkflow';

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
  const [creatFlowVisible, setCreateFlowVisible] = useState<boolean>(false);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(
    null
  );
  const [isDeleteAvatar, setIsDeleteAvatar] = useState<boolean>(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [passwordChanged, setPasswordChanged] = useState<boolean>(false);
  const [onCreateFolderAction, setOnCreateFolderAction] = useState<
    ((name: string, icon_url?: string, emote?: string) => Promise<void>) | null
  >(null);
  const [onEditFolderAction, setOnEditFolderAction] = useState<
    ((name: string, icon_url?: string, emote?: string) => Promise<void>) | null
  >(null);
  const [onCreateSubfolderAction, setOnCreateSubfolderAction] = useState<
    | ((
        name: string,
        parentId: number,
        icon_url?: string,
        emote?: string
      ) => Promise<void>)
    | null
  >(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | undefined>(
    undefined
  );
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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const onSelectFolder = (folder?: Folder) => {
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

  const openCreateFolder = (
    fn: (name: string) => Promise<void>,
    parentId?: number
  ) => {
    if (parentId) {
      setFolderParentId(parentId);
    } else {
      setCreateFolderVisible(true);
      setOnCreateFolderAction(() => fn);
    }
  };

  const openCreateSubFolder = (
    fn: (name: string, parentId: number) => Promise<void>,
    parentFolder: Folder
  ) => {
    setCreateSubfolderVisible(true);
    setOnCreateSubfolderAction(() => fn);
    setFolderParent(parentFolder);
  };

  const openEditFolder = (
    fn: (name: string) => Promise<void>,
    parentFolder: Folder
  ) => {
    setEditFolderVisible(true);
    setOnEditFolderAction(() => fn);
    setFolderParent(parentFolder);
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

  const closeCreateFlow = () => {
    setCreateFlowVisible(false);
  };

  const closeUploadImage = () => {
    setUploadImageVisible(false);
  };

  const closeCreateSubfolder = () => {
    setOnCreateSubfolderAction(null);
    setFolderParent(null);
    setCreateSubfolderVisible(false);
  };

  const closeCreateFolder = () => {
    setOnCreateFolderAction(null);
    setCreateFolderVisible(false);
  };

  const closeEditFolder = () => {
    setOnEditFolderAction(null);
    setFolderParent(null);
    setEditFolderVisible(false);
  };

  const closeHelpCenter = () => {
    setHelpCenterVisible(false);
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

  return (
    <>
      <div className="flex h-screen w-screen">
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
            onSelectFolder={onSelectFolder}
            onOpenUserSettings={openUserSettings}
            user={user}
            onOpenHelpCenter={openHelpCenter}
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
                <div className="absolute top-full right-0 mt-2">
                  <UserDropdown
                    user={user}
                    onOpenUserSettings={openUserSettings}
                    onOpenHelpCenter={openHelpCenter}
                  />
                </div>
              )}
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 w-full h-h-full bg-gray-100">
            {activeWorkspace && (
              <Canvas
                workspace={activeWorkspace}
                selectedFolder={selectedFolder}
                openCreateFlow={openCreateFlow}
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

      {createFolderVisible && onCreateFolderAction && (
        <CreateFolderModal
          onClose={closeCreateFolder}
          onCreate={onCreateFolderAction}
        ></CreateFolderModal>
      )}

      {createSubfolderVisible && onCreateSubfolderAction && folderParent && (
        <CreateSubfolderModal
          onClose={closeCreateSubfolder}
          onCreate={onCreateSubfolderAction}
          parentId={folderParent?.id}
          parent={folderParent}
        ></CreateSubfolderModal>
      )}

      {editFolderVisible && onEditFolderAction && folderParent && (
        <EditFolderModal
          onClose={closeEditFolder}
          onEdit={onEditFolderAction}
          folder={folderParent}
        ></EditFolderModal>
      )}

      {/* Modal for Help Center */}
      {helpCenterVisible && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <HelpCenterModal onClose={closeHelpCenter} user={user} />
        </div>
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

      {creatFlowVisible && (
        <CreateFlowModal
          onClose={closeCreateFlow}
          onCreateFlow={handleCreateWorkflow}
        />
      )}
    </>
  );
}
