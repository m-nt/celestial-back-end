const LocalStrategy = require("passport-local").Strategy;
const CookieStrategy = require("passport-cookie").Strategy;
const bcrypt = require("bcryptjs");

const User = require("../models/User");

module.exports = (passport) => {
  passport.use(
    new LocalStrategy({ usernameField: "Username", passwordField: "Password" }, (Username, Password, done) => {
      User.findOne({ Username: Username })
        .then((user) => {
          if (!user) {
            return done(null, false, { message: "Username or Password is not correct !" });
          }
          bcrypt.compare(Password, user.Password, (err, IsMatch) => {
            if (err) throw err;
            if (IsMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Username or Password is not correct !" });
            }
          });
        })
        .catch((err) => console.log(err));
    })
  );
  passport.use(
    new CookieStrategy(
      {
        cookieName: "connect.sid",
        signed: true,
        passReqToCallback: true,
      },
      function (req, token, done) {
        User.findOne({ token: token }, function (err, user) {
          if (err) {
            console.log(err);
            return done(err);
          }
          if (!user) {
            return done(null, false);
          }
          return done(null, user);
        });
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
