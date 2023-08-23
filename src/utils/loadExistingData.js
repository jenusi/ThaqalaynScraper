const fs = require('fs').promises;

const loadExistingData = async (filePath) => {
  if (!filePath) {
    console.error('No file path provided.');
    return {};
  }

  try {
    const rawData = await fs.readFile(filePath, 'utf8');

    if (!rawData.trim()) return {};

    try {
      return JSON.parse(rawData);
    } catch (parseError) {
      console.error(`An error occurred while parsing JSON data in ${filePath}:`, parseError);
      return {};
    }
  } catch (readError) {
    if (readError.code === 'ENOENT') {
      console.error(`File not found at ${filePath}`);
    } else {
      console.error(`An error occurred while reading ${filePath}:`, readError);
    }
    return {};
  }
};

module.exports = loadExistingData;