import { User } from '@/types/user';

/**
 * Restart the tutorial for a user by setting their tutorial_completed status to false
 * @param user The current user
 * @returns A Promise that resolves to true if successful
 */
export async function restartTutorial(user: User): Promise<boolean> {
  try {
    if (!user || !user.id) {
      console.error('User ID is required to restart tutorial');
      return false;
    }
    
    // First, clean up any inline styles that might have been applied during the tutorial
    const foldersSection = document.querySelector('[data-testid="folders-section"]');
    if (foldersSection && foldersSection instanceof HTMLElement) {
      foldersSection.style.backgroundColor = '';
    }
    
    const response = await fetch(`/api/user/tutorial-status/${user.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hasCompletedTutorial: false,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to restart tutorial:', errorData);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error restarting tutorial:', error);
    return false;
  }
} 