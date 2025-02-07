"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FACEBOOK_CALLBACK_URL = exports.FACEBOOK_CLIENT_SECRET = exports.FACEBOOK_CLIENT_ID = exports.OAUTH_CALLBACK_URL = exports.OAUTH_CLIENT_SECRET = exports.OAUTH_CLIENT_ID = exports.EMAIL_PASS = exports.EMAIL_USER = exports.JWT_SECRET = exports.LOCAL_URL = exports.PROD_URL = exports.MONGO_URI = exports.PORT = exports.API_PREFIX = void 0;
// General
exports.API_PREFIX = "/api/v1";
exports.PORT = process.env.PORT;
exports.MONGO_URI = process.env.MONGO_URI;
exports.PROD_URL = "https://langu-speak-api.vercel.app/api/v1";
exports.LOCAL_URL = `http://localhost:${exports.PORT}${exports.API_PREFIX}`;
// Legacy Auth
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.EMAIL_USER = process.env.EMAIL_USER; // Email service username/address
exports.EMAIL_PASS = process.env.EMAIL_PASS; // Email service password/API key
// Google Auth
exports.OAUTH_CLIENT_ID = "642778691418-jj703fipkip2cg8q57n692ql4m1r2bjf.apps.googleusercontent.com";
exports.OAUTH_CLIENT_SECRET = "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";
exports.OAUTH_CALLBACK_URL = `${exports.PROD_URL}/auth/google/callback`;
// Facebook Auth
exports.FACEBOOK_CLIENT_ID = "621315110384760";
exports.FACEBOOK_CLIENT_SECRET = "52b955161b73b46b6c35d9434da69492";
exports.FACEBOOK_CALLBACK_URL = `${exports.PROD_URL}/auth/facebook/callback`;
