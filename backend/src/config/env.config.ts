export const validateEnvironment = () => {
  const requiredEnvVars = [
    'OPENAI_API_KEY',
    'DATABASE_URL',
    'JWT_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  console.log('All required environment variables are configured');
};

export const getOpenAIConfig = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  
  return {
    apiKey: process.env.OPENAI_API_KEY,
  };
}; 