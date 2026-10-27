import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackUrl: process.env.GITHUB_CALLBACK_URL || 'https://git-pulse-mern-end-term-project.onrender.com/api/auth/github/callback',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};

export default config;
