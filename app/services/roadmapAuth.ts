import { supabasePublicClient } from '@/lib/supabasePublicClient';
import { User } from '@/types/user';

export async function generateRoadmapToken(user: User) {
  try {
    console.log('Generating token for user:', user);
    const userData = {
      user_email: user.email,
      app_user_id: user.auth_id,
      user_name: `${user.first_name} ${user.last_name}`,
      img_url: user.avatar_signed_url || user.avatar_url,
    };

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
    return data.token;
  } catch (error) {
    console.error('Erreur lors de la génération du token roadmap:', error);
    return null;
  }
}
