export const fetchSignedUrl = async (path: string): Promise<string | null> => {
  try {
    const response = await fetch(`/api/get-signed-url?path=${path}`);
    const data = await response.json();
    if (response.ok && data.signedUrl) {
      return data.signedUrl;
    } else {
      console.error('Error fetching signed URL:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Error fetching signed URL:', error);
    return null;
  }
};
