export const validateEnvironment = () => {
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

  const optionalEnvVars = [
    'ANTHROPIC_API_KEY', // required for the chatbot to answer
    'ANTHROPIC_MODEL',
    'ANTHROPIC_EFFORT',
    'ANTHROPIC_MAX_TOKENS',
  ];

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`,
    );
  }

  console.log('All required environment variables are configured');

  optionalEnvVars.forEach((varName) => {
    if (process.env[varName]) {
      console.log(`✅ ${varName} is configured`);
    } else {
      console.log(`⚠️  ${varName} is not configured (using defaults)`);
    }
  });

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn(
      '⚠️  ANTHROPIC_API_KEY missing — the chatbot will return a configuration error until it is set.',
    );
  }
};

/** Claude (Anthropic) configuration, all overridable from .env */
export const getAnthropicConfig = () => ({
  apiKey: process.env.ANTHROPIC_API_KEY,
  // Change ANTHROPIC_MODEL in .env to switch models.
  model: process.env.ANTHROPIC_MODEL || 'claude-opus-4-8',
  // Reasoning depth: low | medium | high | xhigh | max
  effort: process.env.ANTHROPIC_EFFORT || 'high',
  maxTokens: Number(process.env.ANTHROPIC_MAX_TOKENS ?? 4096),
});
