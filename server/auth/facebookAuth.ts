import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { storage } from "../storage";

export function setupFacebookAuth() {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID!,
        clientSecret: process.env.FACEBOOK_APP_SECRET!,
        callbackURL: "/api/auth/facebook/callback",
        profileFields: ["id", "displayName", "photos", "email", "name"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const existingUser = await storage.getUserByEmail(profile.emails?.[0]?.value || "");
          
          if (existingUser) {
            return done(null, existingUser);
          }

          // Create new user
          const newUser = await storage.upsertUser({
            id: profile.id,
            email: profile.emails?.[0]?.value || null,
            firstName: profile.name?.givenName || null,
            lastName: profile.name?.familyName || null,
            profileImageUrl: profile.photos?.[0]?.value || null,
            username: profile.displayName || profile.emails?.[0]?.value?.split("@")[0] || `user_${profile.id}`,
          });

          return done(null, newUser);
        } catch (error) {
          return done(error, undefined);
        }
      }
    )
  );
}

export const facebookAuthRoutes = {
  login: "/api/auth/facebook",
  callback: "/api/auth/facebook/callback",
};