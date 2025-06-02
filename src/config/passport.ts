import passport, { Profile } from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";

import dotenv from 'dotenv';
dotenv.config();

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj: any, done) => {
  done(null, obj);
});

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    callbackURL: process.env.GITHUB_CALLBACK_URL!
  },
  (accessToken: string, refreshToken: string, profile : Profile, done: (error: any, user?: Express.User | false | null) => void
) => {
    // Store accessToken in DB or session if needed
    return done(null, { profile, accessToken });
  }
));
