/**
 * Utility functions for roadmap authentication
 */

/**
 * Generates an authenticated link to the roadmap for email purposes
 * @param userId The user's ID
 * @param email The user's email
 * @param firstName The user's first name
 * @param lastName The user's last name
 * @param avatarUrl Optional avatar URL
 * @returns The authenticated roadmap URL
 */
export async function generateRoadmapLinkForEmail(
  userId: number,
  email: string,
  firstName: string,
  lastName: string,
  avatarUrl?: string
): Promise<string> {
  try {
    // Prepare user data for the token generation
    const userData = {
      user_email: email,
      app_user_id: userId.toString(),
      user_name: `${firstName} ${lastName}`,
      img_url: avatarUrl,
    };

    // Call the features.vote API to generate a token
    const response = await fetch(
      'https://features.vote/api/public/user-token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiSecretKey: process.env.NEXT_PUBLIC_FEATURES_VOTE_API_KEY,
          slug: 'processflow',
          user_data: userData,
        }),
      }
    );

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    // Construct the roadmap URL with the token
    const roadmapUrl = `https://processflow.features.vote/roadmap?token=${data.token}`;
    return roadmapUrl;
  } catch (error) {
    console.error('Error generating roadmap link for email:', error);
    // Return the non-authenticated URL as fallback
    return 'https://processflow.features.vote/roadmap';
  }
} 