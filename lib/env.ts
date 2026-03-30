const requiredEnv = [] as const;

export function validateEnv() {
  const missing = requiredEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const error = `❌ Missing required environment variables: ${missing.join(', ')}`;
    console.error(error);
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ Proceeding with build despite missing env vars, but runtime features relying on absolute URLs might fail.');
    }

  }

  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_BASE_URL) {
    console.warn('⚠️ NEXT_PUBLIC_API_BASE_URL is not defined. Defaulting to same-origin relative paths.');
  }
}

if (typeof window === "undefined") {
  validateEnv();
}
