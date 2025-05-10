"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAUTH_CALLBACK_URL = exports.OAUTH_CLIENT_SECRET = exports.OAUTH_CLIENT_ID = exports.EMAIL_PASS = exports.EMAIL_USER = exports.JWT_SECRET = exports.LOCAL_URL = exports.PROD_URL = exports.MONGO_URI = exports.PORT = exports.API_PREFIX = void 0;
// General
exports.API_PREFIX = "/api/v1";
exports.PORT = process.env.PORT;
exports.MONGO_URI = process.env.MONGO_URI;
exports.PROD_URL = "https://smart-path-seven.vercel.app/api/v1";
exports.LOCAL_URL = `http://localhost:2530${exports.API_PREFIX}`;
// Legacy Auth
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.EMAIL_USER = process.env.EMAIL_USER; // Email service username/address
exports.EMAIL_PASS = process.env.EMAIL_PASS; // Email service password/API key
// Google Auth
exports.OAUTH_CLIENT_ID = "1033820663264-atmsvjotbvtvokbjmhuou1vmjb0mbibb.apps.googleusercontent.com";
exports.OAUTH_CLIENT_SECRET = "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";
exports.OAUTH_CALLBACK_URL = `${exports.LOCAL_URL}/auth/google/callback`;
