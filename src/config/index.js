const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 3000,
  //gcpKeyPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  geminiApiKey: process.env.GEMINI_API_KEY,
  //gcpProjectId: process.env.GCP_PROJECT_ID,
  gcpProjectLocation: process.env.GCP_PROJECT_LOCATION,
};