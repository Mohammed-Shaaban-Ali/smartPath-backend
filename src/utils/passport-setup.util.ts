import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PassportStatic } from "passport";
import User, { IUser } from "../models/User";
import { createUser } from "../services/authentication.service";
import {
  OAUTH_CALLBACK_URL,
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
} from "../constants";

export const configurePassport = (passport: PassportStatic) => {
  // GooglePassportConfig
  passport.use(
    new GoogleStrategy(
      {
        clientID: OAUTH_CLIENT_ID,
        clientSecret: OAUTH_CLIENT_SECRET,
        callbackURL: OAUTH_CALLBACK_URL,
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({
            $or: [{ googleId: profile.id }, { email: profile._json.email! }],
          });
          if (user) return done(null, user);

          const newUser = {
            googleId: profile._json.sub!,
            email: profile._json.email!,
            name: profile._json.name!,
            // avatar: profile._json.picture!,
          };
          const createdUser = await createUser(newUser);
          done(null, createdUser);
        } catch (error) {
          done(error as Error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, (user as IUser)._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};
