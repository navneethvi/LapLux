const passport = require("passport")
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

passport.use(new GoogleStrategy({
    clientID:     "692513015008-lsrc2ea0ps240vtt8l1hfgshikfaa7fk.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:3000/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    console.log('Google authentication callback reached.');
    console.log('Profile:', profile);
    return done(null,profile )
  }
));

passport.serializeUser(function(user,done){
  done(null,user)
})


passport.deserializeUser(function(user,done){
  done(null,user)
})