import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Profile } from 'passport-github2';
import dotenvFlow from 'dotenv-flow';

// Loads .env, .env.development or .env.production automatically based on NODE_ENV
dotenvFlow.config();

interface SerializedUser {
  id: string;
  username: string;
  accessToken: string;
}

// Store only necessary fields in session
passport.serializeUser((user: Express.User, done) => {
    done(null, user as any); // or cast to a custom type
  });
  
  passport.deserializeUser((obj: any, done) => {
    done(null, obj as Express.User);
  });

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!
    },
    (
      accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: (error: any, user?: Express.User | false | null) => void
    ) => {
      // Construct a minimal user object for session and downstream use
      const user: SerializedUser = {
        id: profile.id,
        username: profile.username || profile.displayName || 'unknown',
        accessToken
      };

      return done(null, user);
    }
  )
);

export default passport;
