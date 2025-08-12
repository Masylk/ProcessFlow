import type { NextApiRequest, NextApiResponse } from 'next';

const FEATURES_VOTE_SECRET_KEY = process.env.FEATURES_VOTE_SECRET_KEY || '';

interface GenerateTokenRequestBody {
  email: string;
  id: string;
  name?: string;
  avatarUrl?: string;
}

interface GenerateTokenResponse {
  token?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateTokenResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vérification des paramètres
    const { email, id, name, avatarUrl } = req.body as GenerateTokenRequestBody;

    if (!email || !id) {
      return res.status(400).json({ error: 'Missing required fields: email or id' });
    }

    // Préparer la requête pour l'API externe
    const response = await fetch('https://features.vote/api/public/user-token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiSecretKey: FEATURES_VOTE_SECRET_KEY,
        slug: 'processflow', // Remplace par ton slug spécifique
        user_data: {
          user_email: email,
          app_user_id: id,
          user_name: name,
          img_url: avatarUrl,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error from features.vote API:', errorText);
      throw new Error(`Failed to generate token: ${errorText}`);
    }

    // Récupération du token depuis la réponse de l'API
    const data = await response.json();
    const { token } = data;

    if (!token) {
      throw new Error('No token received from features.vote API');
    }

    // Retourner le token au frontend
    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error in /api/generate-token:', error);
    return res.status(500).json({ error: 'Failed to generate token' });
  }
}
