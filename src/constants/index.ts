// General
export const API_PREFIX = "/api/v1";
export const PORT = process.env.PORT as string;
export const MONGO_URI = process.env.MONGO_URI as string;
// export const PROD_URL = "https://langu-speak-api.vercel.app/api/v1";
export const LOCAL_URL = `http://localhost:2530${API_PREFIX}`;

// Legacy Auth
export const JWT_SECRET = process.env.JWT_SECRET as string;
export const EMAIL_USER = process.env.EMAIL_USER as string; // Email service username/address
export const EMAIL_PASS = process.env.EMAIL_PASS as string; // Email service password/API key

// Google Auth
export const OAUTH_CLIENT_ID =
  "1033820663264-atmsvjotbvtvokbjmhuou1vmjb0mbibb.apps.googleusercontent.com";
export const OAUTH_CLIENT_SECRET = "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";
export const OAUTH_CALLBACK_URL = `${LOCAL_URL}/auth/google/callback`;
