'use client';

import {
  useEffect,
  useState,
  useRef,
  Suspense,
  useCallback,
  useMemo,
} from 'react';
import UserInfo from './dashboard/components/UserInfo';
import SearchBar from './dashboard/components/SearchBar';
import UserDropdown from './dashboard/components/UserDropdown';
import UserSettings from './dashboard/components/UserSettings';
import Sidebar from './dashboard/components/Sidebar';
import HelpCenterModal from './dashboard/components/HelpCenterModal';
import { Folder, Workspace } from '@/types/workspace';
import { User } from '@/types/user';
import ConfirmChangePasswordModal from './dashboard/components/ConfirmChangePasswordModal';
import dynamic from 'next/dynamic';
import { cache } from 'react';
import { getIcons } from '@/app/utils/icons';
import { useTheme, useColors } from '@/app/theme/hooks';
import Modal from '@/app/components/Modal';
import ButtonNormal from '@/app/components/ButtonNormal';
import SettingsPage from '@/app/dashboard/components/SettingsPage';
import CreateFolderModal from './dashboard/components/CreateFolderModal';
import CreateSubfolderModal from './dashboard/components/CreateSubfolderModal';
import EditFolderModal from './dashboard/components/EditFolderModal';
import Canvas from './dashboard/components/Canvas';
import UploadImageModal from './dashboard/components/UploadImageModal';
import ConfirmDeleteModal from './dashboard/components/ConfirmDeleteModal';
import CreateFlowModal from './dashboard/components/CreateFlowModal';
import { Workflow, WorkflowStatus } from '@/types/workflow';
import { createWorkflow } from './utils/createWorkflow';
import ConfirmDeleteFolderModal from './dashboard/components/ConfirmDeleteFolderModal';
import { deleteWorkflow } from './utils/deleteWorkflow';
import ConfirmDeleteFlowModal from './dashboard/components/ConfirmDeleteFlowModal';
import EditFlowModal from './dashboard/components/EditFlowModal';
import { updateWorkflow } from '@/app/utils/updateWorkflow';
import MoveWorkflowModal from './dashboard/components/MoveWorkflowModal';
import InputField from '@/app/components/InputFields';
import IconModifier from './dashboard/components/IconModifier';
import { createClient } from '@/utils/supabase/client';
import TutorialOverlay from './dashboard/components/TutorialOverlay';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { debounce } from 'lodash';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { checkFolderName, checkWorkspaceName } from './utils/checkNames';

const HelpCenterModalDynamic = dynamic(
  () => import('./dashboard/components/HelpCenterModal'),
  {
    ssr: false,
  }
);

const UserSettingsDynamic = dynamic(
  () => import('./dashboard/components/UserSettings'),
  {
    ssr: false,
  }
);

export default function Page() {
  const { currentTheme } = useTheme();
  const colors = useColors();
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
  const [newPassword, setNewPassword] = useState<string>('');

  // Ref used as a flag so that the active_workspace update is performed only once
  const activeWorkspaceUpdatedRef = useRef(false);

  // Add this near the top of the component with other state declarations
  const [deleteHandler, setDeleteHandler] = useState<() => Promise<void>>(
    () => async () => {}
  );

  // Add or modify these state declarations
  const [editingFolder, setEditingFolder] = useState<Folder | undefined>();

  // Add this to the Canvas props
  const [currentView, setCurrentView] = useState<'grid' | 'table'>('grid');

  // Add new state near other states
  const [isSettingsView, setIsSettingsView] = useState(false);

  // Add new state near other states
  const [folderName, setFolderName] = useState('');
  const [iconUrl, setIconUrl] = useState<string | undefined>(undefined);
  const [emote, setEmote] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add this state near other state declarations
  const [showTutorial, setShowTutorial] = useState(false);

  // Add this state near other state declarations
  const [activeTab, setActiveTab] = useState<string>('Workspace');

  // Add near the top of the component
  const searchParams = useSearchParams();

  // Memoize the filtered workspaces based on search term
  const filteredWorkspaces = useMemo(() => {
    if (!activeWorkspace?.workflows) return [];
    return activeWorkspace.workflows.filter((workflow) =>
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeWorkspace?.workflows, searchTerm]);

  // Debounced search handler
  const debouncedSearchHandler = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  // Memoize handlers that are passed to child components
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSearchHandler(event.target.value);
    },
    [debouncedSearchHandler]
  );

  const onSelectFolderSidebar = useCallback((folder?: Folder) => {
    setSidebarSelectedFolder(folder);
  }, []);

  const onSelectFolderView = useCallback((folder?: Folder) => {
    setSelectedFolder(folder);
  }, []);

  // Optimize fetchWorkspaces with caching
  const fetchWorkspaces = useCallback(async () => {
    try {
      // const cacheKey = `workspaces-${user?.id}`;
      // const cachedData = sessionStorage.getItem(cacheKey);

      // if (cachedData) {
      //   const { data, timestamp } = JSON.parse(cachedData);
      //   const isCacheValid = Date.now() - timestamp < 5 * 60 * 1000; // 5 minutes cache

      //   if (isCacheValid) {
      //     setWorkspaces(data);
      //     return;
      //   }
      // }

      const response = await fetch(`/api/workspaces/${user?.id}`);
      const data = await response.json();

      if (!response.ok) {
        console.error('Error fetching workspaces:', data.error);
        return;
      }

      if (Array.isArray(data)) {
        setWorkspaces(data);
        // sessionStorage.setItem(
        //   cacheKey,
        //   JSON.stringify({
        //     data,
        //     timestamp: Date.now(),
        //   })
        // );
      } else {
        console.error('Unexpected data format:', data);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  }, [user?.id]);

  // Optimize user data fetching
  const fetchUser = useCallback(async () => {
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (!authUser || authError) {
        window.location.href = '/login';
        return;
      }

      const res = await fetch('/api/user');
      const data = await res.json();
      if (data) {
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      window.location.href = '/login';
    }
  }, []);

  // Update useEffect dependencies
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      fetchWorkspaces();
    }
  }, [user, fetchWorkspaces]);

  // Optimize workspace update handler
  const updateActiveWorkspace = useCallback(
    async (workspace: Workspace) => {
      if (!user) return;

      try {
        setActiveWorkspace(workspace);

        const updateRes = await fetch('/api/user/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user.id,
            active_workspace_id: workspace.id,
          }),
        });

        if (!updateRes.ok) {
          throw new Error('Failed to update active workspace');
        }

        const updatedUser = await updateRes.json();
        setUser(updatedUser);

        // Update cache
        // const cacheKey = `workspaces-${user.id}`;
        // const cachedData = sessionStorage.getItem(cacheKey);
        // if (cachedData) {
        //   const { data } = JSON.parse(cachedData);
        //   const updatedWorkspaces = data.map((ws: Workspace) =>
        //     ws.id === workspace.id ? workspace : ws
        //   );
        //   sessionStorage.setItem(
        //     cacheKey,
        //     JSON.stringify({
        //       data: updatedWorkspaces,
        //       timestamp: Date.now(),
        //     })
        //   );
        // }
      } catch (error) {
        console.error('Error updating active workspace:', error);
        toast.error('Failed to update workspace');
      }
    },
    [user]
  );

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

    await handleCreateWorkflow(
      duplicateName,
      selectedWorkflow.description,
      selectedWorkflow.icon
    );
  };

  const handleCreateWorkflow = async (
    name: string,
    description: string,
    icon: string | null
  ) => {
    if (!activeWorkspace) {
      console.error('No active workspace selected');
      return;
    }
    if (!user) {
      console.error('No user found');
      return;
    }
    try {
      const result = await createWorkflow({
        name,
        description,
        workspaceId: activeWorkspace.id,
        icon,
      });

      if (result.error) {
        toast.error(result.error.title, {
          description: result.error.description,
        });
        return;
      }

      if (result.workflow) {
        const workflow = result.workflow;
        // Update the list of workspaces
        setWorkspaces((prevWorkspaces) =>
          prevWorkspaces.map((workspace) =>
            workspace.id === workflow.workspaceId
              ? {
                  ...workspace,
                  workflows: [...workspace.workflows, workflow],
                }
              : workspace
          )
        );

        // Update the active workspace
        setActiveWorkspace((prev) =>
          prev
            ? {
                ...prev,
                workflows: [...prev.workflows, workflow],
              }
            : prev
        );

        toast.success('Workflow Created', {
          description: 'Your new workflow has been created successfully.',
        });
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  };

  const handleEditWorkflow = async (
    id: number,
    name: string,
    description: string,
    folder?: Folder | null,
    icon?: string | null
  ): Promise<{
    workflow: Workflow | null;
    error?: { title: string; description: string };
  }> => {
    try {
      const result = await updateWorkflow(id, {
        name,
        description,
        folder_id: folder?.id,
        icon: icon ?? undefined,
      });

      if (result.error) {
        return result;
      }

      if (result.workflow) {
        // Update the activeWorkspace state
        if (activeWorkspace) {
          const updatedWorkflows = activeWorkspace.workflows.map((workflow) =>
            workflow.id === result.workflow?.id ? result.workflow : workflow
          );

          setActiveWorkspace({
            ...activeWorkspace,
            workflows: updatedWorkflows,
          });
        }
      }

      return result;
    } catch (error) {
      console.error('Error updating workflow:', error);
      return {
        workflow: null,
        error: {
          title: 'Error Updating Workflow',
          description: 'An unexpected error occurred',
        },
      };
    }
  };

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

  // Toggle the dropdown
  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownVisible(!dropdownVisible);
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

  // Simple open handler
  const openHelpCenter = (): void => {
    setHelpCenterVisible(true);
  };

  // Simple close handler
  const closeHelpCenter = () => {
    setHelpCenterVisible(false);
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

  const openEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setEditFolderVisible(true);
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

  // Simple close handler
  const closeDeleteFolder = () => {
    setDeleteFolderVisible(false);
    setSelectedFolder(undefined);
  };

  // Simple delete handler
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

      setActiveWorkspace((prevWorkspace) =>
        prevWorkspace
          ? {
              ...prevWorkspace,
              folders: prevWorkspace.folders.filter(
                (f) => f.id !== selectedFolder.id
              ),
            }
          : null
      );
      closeDeleteFolder();
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  // Simple open handler
  const openDeleteFolder = async (folder: Folder): Promise<void> => {
    setSelectedFolder(folder);
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

  const closeEditFolder = () => {
    setFolderParent(null);
    setEditFolderVisible(false);
  };

  const handleSelectWorkflow = (workflow: Workflow | null) => {
    if (workflow) console.log('select workflow: ' + workflow?.name);
    setSelectedWorkflow(workflow);
  };

  // Function to update the user in state
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      console.log('Successfully logged out');
      window.location.href = '/login';
    }
  };

  // Add this useEffect to preload the component
  useEffect(() => {
    // Preload the HelpCenterModal component
    import('./dashboard/components/HelpCenterModal');
  }, []);

  useEffect(() => {
    // Preload images
    const imageUrls = [
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/x-close-icon.svg`,
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/support-icon.svg`,
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/certificate.svg`,
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/compass-icon.svg`,
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/slack.svg`,
    ];

    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  const onWorkspaceUpdate = async (updates: Partial<Workspace>): Promise<boolean> => {
    if (!activeWorkspace) return false;

    const nameError = checkWorkspaceName(updates.name || '');
    if (nameError) {
      toast.error(nameError.title + ' ' + nameError.description);
      return false;
    }
    try {
      const response = await fetch(`/api/workspace/${activeWorkspace.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update workspace');
      }

      const updatedWorkspace = await response.json();

      // Update both activeWorkspace and the workspace in the workspaces array
      setActiveWorkspace(updatedWorkspace);
      setWorkspaces((prevWorkspaces) =>
        prevWorkspaces.map((w) =>
          w.id === updatedWorkspace.id ? updatedWorkspace : w
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error updating workspace:', error);
      return false;
    }
  };

  const onWorkspaceDelete = async (workspaceId: number) => {
    try {
      const response = await fetch(`/api/workspace/${workspaceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete workspace');
      }

      // Remove the deleted workspace from the workspaces array
      setWorkspaces((prevWorkspaces) =>
        prevWorkspaces.filter((w) => w.id !== workspaceId)
      );

      // If the deleted workspace was the active one, set a new active workspace
      if (activeWorkspace && activeWorkspace.id === workspaceId) {
        // Find another workspace to set as active, or null if none exist
        const nextWorkspace =
          workspaces.find((w) => w.id !== workspaceId) || null;

        if (nextWorkspace) {
          // Update the user's active workspace in the database
          await updateActiveWorkspace(nextWorkspace);
        } else {
          // If no workspaces left, set active workspace to null
          setActiveWorkspace(null);

          // Update the user in the database
          if (user) {
            await fetch('/api/user/update', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: user.id,
                active_workspace_id: null,
              }),
            });
          }
        }
      }

      // Close the settings view
      setIsSettingsView(false);

      // Redirect to the dashboard or onboarding if no workspaces left
      if (workspaces.length <= 1) {
        // If this was the last workspace, redirect to onboarding
        window.location.href = '/onboarding/workspace-setup';
      }
    } catch (error) {
      console.error('Error deleting workspace:', error);
      throw error;
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;

    setIsSubmitting(true);
    try {
      if (iconUrl) await handleAddFolder(folderName, iconUrl);
      else if (emote) await handleAddFolder(folderName, undefined, emote);
      else await handleAddFolder(folderName);
      closeCreateFolder();
    } catch (error) {
      console.error('Error creating folder:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateIcon = (icon?: string, emote?: string) => {
    if (icon) {
      setIconUrl(icon);
      setEmote(undefined);
    } else if (emote) {
      setIconUrl(undefined);
      setEmote(emote);
    } else {
      setIconUrl(undefined);
      setEmote(undefined);
    }
  };

  const closeCreateFolder = () => {
    setCreateFolderVisible(false);
    setFolderName('');
    setIconUrl(undefined);
    setEmote(undefined);
  };

  // Add this near your other useEffect hooks
  useEffect(() => {
    // Only redirect if we have a workspace with a slug and we're on the dashboard page
    if (activeWorkspace?.slug && window.location.pathname === '/dashboard') {
      // Get current URL search params
      const currentSearchParams = new URLSearchParams(window.location.search);

      // Create new URL with workspace slug and preserve existing search params
      const newUrl = `/${activeWorkspace.slug}${currentSearchParams.toString() ? '?' + currentSearchParams.toString() : ''}`;

      console.log('newUrl: ' + newUrl);
      // Update URL to the workspace slug without refreshing the page
      window.history.replaceState({}, '', newUrl);
    }
  }, [activeWorkspace]);

  // Add this near the beginning of your component
  useEffect(() => {
    if (workspaces.length > 0) {
      // Get slug from URL if available
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      const slugFromUrl = pathSegments.length > 0 ? pathSegments[0] : null;

      if (slugFromUrl) {
        // Find workspace with matching slug
        const workspaceFromSlug = workspaces.find(
          (w) => w.slug === slugFromUrl
        );

        if (
          workspaceFromSlug &&
          (!activeWorkspace || activeWorkspace.id !== workspaceFromSlug.id)
        ) {
          // Set this workspace as active
          updateActiveWorkspace(workspaceFromSlug);
          return;
        }
      }

      // If no matching workspace found from URL or no slug in URL, and we have an active workspace
      // Redirect to the active workspace slug URL
      if (activeWorkspace?.slug && !slugFromUrl) {
        window.history.replaceState({}, '', `/${activeWorkspace.slug}`);
      }
    }
  }, [workspaces, activeWorkspace]);

  // Add this near your other useEffect hooks
  useEffect(() => {
    // Handle click events on workspace links
    const handleNavigation = (e: MouseEvent) => {
      // Check if the clicked element is a workspace link
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.pathname.split('/').filter(Boolean).length === 1) {
        // This looks like a workspace slug link
        const slug = link.pathname.split('/').filter(Boolean)[0];

        // Find the workspace with this slug
        const workspace = workspaces.find((w) => w.slug === slug);

        if (workspace) {
          // Prevent the default navigation
          e.preventDefault();

          // Update the active workspace directly
          updateActiveWorkspace(workspace);
        }
      }
    };

    // Add event listener
    document.addEventListener('click', handleNavigation);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleNavigation);
    };
  }, [workspaces, updateActiveWorkspace]);

  // Effect to check tutorial status
  useEffect(() => {
    const checkTutorialStatus = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/user/tutorial-status/${user.id}`);
        const data = await response.json();

        if (!data.hasCompletedTutorial) {
          setShowTutorial(true);
        }
      } catch (error) {
        console.error('Error checking tutorial status:', error);
      }
    };

    checkTutorialStatus();
  }, [user]);

  // Handler for tutorial completion
  const handleTutorialComplete = async () => {
    if (!user) return;

    try {
      await fetch(`/api/user/tutorial-status/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hasCompletedTutorial: true }),
      });

      setShowTutorial(false);
    } catch (error) {
      console.error('Error updating tutorial status:', error);
    }
  };

  // Check URL parameters for subscription events
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const checkoutStatus = url.searchParams.get('checkout');
      const action = url.searchParams.get('action');
      const error = url.searchParams.get('error');

      // Only show notifications if we have checkout status
      if (checkoutStatus) {
        // Success notifications
        if (checkoutStatus === 'success') {
          if (action === 'upgrade') {
            toast.success('Successfully Upgraded! 🚀', {
              description:
                'Your subscription has been upgraded to the Early Adopter plan. Enjoy all the premium features!',
              duration: 7000,
            });
          } else {
            toast.success('Subscription Activated', {
              description:
                'Your Early Adopter subscription has been successfully activated.',
              duration: 5000,
            });
          }
        }
        // Error notifications
        else if (checkoutStatus === 'failed') {
          const errorMessage =
            error ||
            'There was an issue processing your payment. Please try again or contact support.';
          toast.error('Checkout Failed', {
            description: errorMessage,
            duration: 10000, // Longer duration for error messages
          });
        }
        // Pending notifications
        else if (checkoutStatus === 'pending') {
          toast.info('Processing Your Subscription', {
            description:
              'Your payment was successful. We are setting up your subscription. This may take a few moments.',
            duration: 5000,
          });
        }

        // Clean up URL parameters after showing toast
        url.searchParams.delete('checkout');
        url.searchParams.delete('action');
        url.searchParams.delete('error');
        url.searchParams.delete('message');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, []); // Empty dependency array means this runs once on mount

  // Add after your state declarations
  useEffect(() => {
    const folderParam = searchParams.get('folder');
    if (folderParam) {
      const folderId = parseInt(folderParam);
      // Find the folder in the active workspace's folders
      const folder = activeWorkspace?.folders?.find((f) => f.id === folderId);
      if (folder) {
        setSelectedFolder(folder);
      }
    }
  }, [searchParams, activeWorkspace]); // Change dependency to activeWorkspace

  const handleStatusChange = async (
    workflow: Workflow,
    newStatus: WorkflowStatus
  ) => {
    try {
      await updateWorkflow(workflow.id, {
        ...workflow,
        status: newStatus,
      });

      // Update the workflow in the active workspace
      if (activeWorkspace) {
        const updatedWorkflows = activeWorkspace.workflows.map((w) =>
          w.id === workflow.id ? { ...w, status: newStatus } : w
        );
        setActiveWorkspace({
          ...activeWorkspace,
          workflows: updatedWorkflows,
        });
      }
    } catch (error) {
      console.error('Error updating workflow status:', error);
      toast.error('Failed to update workflow status', {
        description:
          'Please try again or contact support if the issue persists.',
      });
    }
  };

  // FOLDER MANAGEMENT
  // Handler to add a top-level folder (parent_id will be null)
  const handleAddFolder = async (
    name: string,
    icon_url?: string,
    emote?: string
  ) => {
    if (!activeWorkspace) return;

    const nameError = checkFolderName(name);
    if (nameError) {
      toast.error(nameError.title, {
        description: nameError.description,
      });
      return;
    }
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
    folderName: string,
    icon_url?: string | null,
    emote?: string | null
  ) => {
    if (!activeWorkspace || !editingFolder) return;

    const nameError = checkFolderName(folderName);
    if (nameError) {
      toast.error(nameError.title, {
        description: nameError.description,
      });
      return;
    }
    try {
      const response = await fetch(
        `/api/workspaces/folders/${editingFolder.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: folderName, icon_url, emote }),
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
              folders: prevWorkspace.folders.map((f) =>
                f.id === editingFolder.id ? { ...f, ...updatedFolder } : f
              ),
            }
          : null
      );

      // Update selected states if needed
      if (sidebarSelectedFolder?.id === updatedFolder.id) {
        setSidebarSelectedFolder(updatedFolder);
      }

      setEditingFolder(undefined);
    } catch (error) {
      console.error('Error updating folder:', error);
    }
  };

  const handleUserInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownVisible(!dropdownVisible);
  };

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Restore fetchSignedUrl effect
  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (user && user.avatar_url && !user.avatar_signed_url) {
        console.log('getting avatar url : ' + user.avatar_url);
        user.avatar_signed_url = user.avatar_url;
      }
    };

    fetchSignedUrl();
  }, [user]);

  // Restore workspace effect
  useEffect(() => {
    if (user && workspaces.length > 0) {
      if (!user.active_workspace_id) {
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
                active_workspace_id: workspaces[0].id,
              }),
            });
            if (updateRes.ok) {
              const updatedUser = await updateRes.json();
              if (
                updatedUser.active_workspace_id !== user.active_workspace_id
              ) {
                setUser(updatedUser);
              }
            } else {
              console.error('Error updating user active_workspace_id');
            }
          };
          updateActiveWorkspace();
        }
      } else {
        const foundWorkspace = workspaces.find(
          (ws) => ws.id === user.active_workspace_id
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
                  active_workspace_id: workspaces[0].id,
                }),
              });
              if (updateRes.ok) {
                const updatedUser = await updateRes.json();
                if (
                  updatedUser.active_workspace_id !== user.active_workspace_id
                ) {
                  setUser(updatedUser);
                }
              } else {
                console.error('Error updating user active_workspace_id');
              }
            };
            updateActiveWorkspace();
          }
        }
      }
      setIsLoading(false);
    }
  }, [user, workspaces]);

  // Restore password update handlers
  const handleUpdatePassword = async () => {
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

  const handleCancelPasswordChange = () => {
    setNewPassword('');
  };

  // Restore avatar handlers
  const setDeleteAvatar = () => {
    setIsDeleteAvatar(true);
  };

  const unsetDeleteAvatar = () => {
    setIsDeleteAvatar(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Suspense
        fallback={
          <div
            className="flex-1 flex items-center justify-center"
            style={{ backgroundColor: colors['bg-primary'] }}
          >
            <LoadingSpinner size="large" />
          </div>
        }
      >
        {isLoading ? (
          <div
            className="flex-1 flex items-center justify-center"
            style={{ backgroundColor: colors['bg-primary'] }}
          >
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <>
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
                selectedFolder={selectedFolder}
                onLogout={handleLogout}
                isSettingsView={isSettingsView}
                setIsSettingsView={setIsSettingsView}
                setWorkspaces={setWorkspaces}
                setActiveTab={setActiveTab}
              />
            )}

            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Page header */}
              <header
                style={{
                  backgroundColor: colors['bg-primary'],
                  borderColor: colors['border-secondary'],
                }}
                className="min-h-[73px] flex justify-between items-center px-4 relative border-b"
              >
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                />
                <div className="flex items-center gap-4">
                  <ButtonNormal
                    variant="primary"
                    size="small"
                    leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/white-plus.svg`}
                    onClick={openCreateFlow}
                    data-testid="new-flow-button"
                  >
                    New Flow
                  </ButtonNormal>
                  {/* Divider */}
                  <div
                    style={{ borderColor: colors['border-secondary'] }}
                    className="h-[25px] border-r justify-center items-center"
                  />
                  <div className="relative">
                    <div
                      className="relative cursor-pointer"
                      onClick={handleUserInfoClick}
                    >
                      <UserInfo user={user} isActive={dropdownVisible} />
                      {dropdownVisible && (
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setDropdownVisible(false)}
                        >
                          <div
                            className="absolute top-[68px] right-3.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <UserDropdown
                              user={user}
                              onOpenUserSettings={openUserSettings}
                              onOpenHelpCenter={openHelpCenter}
                              onClose={() => setDropdownVisible(false)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </header>

              {/* Main content */}
              <main
                style={{ backgroundColor: colors['bg-secondary'] }}
                className="flex-1 w-full h-[100%]"
              >
                {isSettingsView ? (
                  <div className="h-full">
                    <SettingsPage
                      user={user}
                      onClose={() => setIsSettingsView(false)}
                      workspace={activeWorkspace || undefined}
                      onWorkspaceUpdate={onWorkspaceUpdate}
                      onWorkspaceDelete={onWorkspaceDelete}
                      initialTab={activeTab}
                    />
                  </div>
                ) : (
                  activeWorkspace && (
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
                      currentView={currentView}
                      onViewChange={setCurrentView}
                      onStatusChange={handleStatusChange}
                    />
                  )
                )}
              </main>
            </div>
          </>
        )}
      </Suspense>

      {/* Modals */}
      {user && userSettingsVisible && (
        <div className="fixed inset-0 z-20 flex items-center justify-center">
          <UserSettingsDynamic
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
        <Modal
          onClose={closeCreateFolder}
          title="Create a folder"
          icon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon.svg`}
          actions={
            <>
              <ButtonNormal
                variant="secondary"
                size="small"
                onClick={closeCreateFolder}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </ButtonNormal>
              <ButtonNormal
                variant="primary"
                size="small"
                onClick={handleCreateFolder}
                disabled={!folderName.trim() || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Creating...' : 'Create'}
              </ButtonNormal>
            </>
          }
          showActionsSeparator={true}
        >
          <div className="flex flex-col gap-4">
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: colors['text-primary'] }}
              >
                Folder name{' '}
                <span style={{ color: colors['text-accent'] }}>*</span>
              </label>
              <div className="flex items-center gap-2">
                <IconModifier
                  initialIcon={iconUrl}
                  onUpdate={updateIcon}
                  emote={emote}
                />
                <InputField
                  type="default"
                  value={folderName}
                  onChange={setFolderName}
                  placeholder="Enter folder name"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {createSubfolderVisible && folderParent && (
        <CreateSubfolderModal
          onClose={closeCreateSubfolder}
          onCreate={handleAddSubfolder}
          parentId={folderParent?.id}
          parent={folderParent}
        ></CreateSubfolderModal>
      )}

      {editFolderVisible && editingFolder && (
        <EditFolderModal
          onClose={closeEditFolder}
          onEdit={handleEditFolder}
          folder={editingFolder}
        ></EditFolderModal>
      )}

      {/* Modal for Help Center */}
      {helpCenterVisible && user && (
        <Suspense
          fallback={
            <div className="fixed inset-0 flex items-center justify-center p-8 bg-[#0c111d] bg-opacity-40 z-50">
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <p>Loading...</p>
              </div>
            </div>
          }
        >
          <HelpCenterModalDynamic
            onClose={closeHelpCenter}
            user={user}
            setShowTutorial={setShowTutorial}
          />
        </Suspense>
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
              folder,
              selectedWorkflow.icon
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

      {/* Add the tutorial overlay */}
      {showTutorial && <TutorialOverlay onComplete={handleTutorialComplete} />}
    </div>
  );
}
