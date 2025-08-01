import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "../storage";
import type { User } from "@shared/schema";

export function setupGoogleAuth() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: "/api/auth/google/callback",
        scope: ["profile", "email"],
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

export const googleAuthRoutes = {
  login: "/api/auth/google",
  callback: "/api/auth/google/callback",
};