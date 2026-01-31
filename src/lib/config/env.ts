function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key];
  
  if (!value && required) {
    if (typeof window === 'undefined') {
      console.error(`Missing required environment variable: ${key}`);
    }
    return '';
  }
  
  return value || '';
}

export const env = {
  supabase: {
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  },
  app: {
    url: getEnvVar('NEXT_PUBLIC_APP_URL', false) || 'http://localhost:3000',
  },
} as const;

export function validateEnv(): { valid: boolean; missing: string[] } {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  return {
    valid: missing.length === 0,
    missing,
  };
}
