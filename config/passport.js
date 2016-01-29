var passport      = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User          = require('../models/User');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use('local-login',
  new LocalStrategy({
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : true
    },
    function(req, email, password, done) {
      User.findOne({ 'email' :  email }, function(err, user) {
        if (err) return done(err);

        if (!user){
            req.flash("email", req.body.email);
            return done(null, false, req.flash('loginError', 'No user found.'));
        }
        if (!user.authenticate(password)){
            req.flash("email", req.body.email);
            return done(null, false, req.flash('loginError', 'Password does not Match.'));
        }
        return done(null, user);
      });
    }
  )
);

module.exports = passport;
