import dotenv from 'dotenv';
dotenv.config();

/**
 * Validated environment configuration.
 * Throws at startup if required variables are missing.
 */
const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
};

export const config = {
  port: parseInt(process.env.PORT || '8080', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ai_interview_db',
  jwtSecret: getRequiredEnv('JWT_SECRET'),
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};
