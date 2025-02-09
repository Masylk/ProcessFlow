const axios = require('axios');

const fetchFigmaData = async (fileKey, personalAccessToken) => {
  if (!fileKey || !personalAccessToken) {
    throw new Error('FILE_KEY or PERSONAL_ACCESS_TOKEN is missing');
  }

  try {
    const response = await axios.get(
      `https://api.figma.com/v1/files/${fileKey}`,
      {
        headers: {
          'X-Figma-Token': personalAccessToken,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching data from Figma: ${error.message}`);
  }
};

module.exports = { fetchFigmaData };
