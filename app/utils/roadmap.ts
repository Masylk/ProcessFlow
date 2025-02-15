import { generateRoadmapToken } from '@/app/services/roadmapAuth';

export async function redirectToRoadmap(user: any) {
  try {
    const token = await generateRoadmapToken(user);
    if (token) {
      const roadmapUrl = `https://processflow.features.vote/roadmap?token=${token}`;
      window.open(roadmapUrl, '_blank');
    } else {
      window.open('https://processflow.features.vote/roadmap', '_blank');
    }
  } catch (error) {
    console.error('Erreur de redirection roadmap:', error);
    window.open('https://processflow.features.vote/roadmap', '_blank');
  }
}