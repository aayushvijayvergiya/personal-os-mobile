function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing ${name}. Copy .env.example to .env and fill it in, then restart "expo start".`);
  }
  return value;
}

export const env = {
  supabaseUrl: required("EXPO_PUBLIC_SUPABASE_URL", process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: required("EXPO_PUBLIC_SUPABASE_ANON_KEY", process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
  allowSignup: process.env.EXPO_PUBLIC_ALLOW_SIGNUP === "true",
};
