const { Storage } = require('@google-cloud/storage');

let storage = null; // Declare storage at the module level

const initializeStorage = () => {
  const serviceAccount = JSON.parse(
    process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT || '{}',
  );

  try {
    storage = new Storage(serviceAccount);
    console.log('Cloud storage initialized');
  } catch (e) {
    console.error('Failed to initialize cloud storage', e);
  }
};

const getCloudStorage = () => {
  if (!storage) {
    initializeStorage(); // Initialize only if storage is null
  }
  return storage;
};

module.exports = getCloudStorage;
