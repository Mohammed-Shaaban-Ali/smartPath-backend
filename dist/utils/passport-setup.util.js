"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurePassport = void 0;
const passport_google_oauth20_1 = require("passport-google-oauth20");
const User_1 = __importDefault(require("../models/User"));
const authentication_service_1 = require("../services/authentication.service");
const constants_1 = require("../constants");
const configurePassport = (passport) => {
    // GooglePassportConfig
    passport.use(new passport_google_oauth20_1.Strategy({
        clientID: constants_1.OAUTH_CLIENT_ID,
        clientSecret: constants_1.OAUTH_CLIENT_SECRET,
        callbackURL: constants_1.OAUTH_CALLBACK_URL,
        scope: ["profile", "email"],
    }, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let user = yield User_1.default.findOne({
                $or: [{ googleId: profile.id }, { email: profile._json.email }],
            });
            if (user)
                return done(null, user);
            const newUser = {
                googleId: profile._json.sub,
                email: profile._json.email,
                name: profile._json.name,
                // avatar: profile._json.picture!,
            };
            const createdUser = yield (0, authentication_service_1.createUser)(newUser);
            done(null, createdUser);
        }
        catch (error) {
            done(error);
        }
    })));
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });
    passport.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield User_1.default.findById(id);
            done(null, user);
        }
        catch (error) {
            done(error);
        }
    }));
};
exports.configurePassport = configurePassport;
