const express = require("express");
const multipart = require("multer");
const upload = multipart();
const { IsAuthenticated } = require("../config/Auth");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const User = require("../models/User");
const router = express.Router();

router.post("/register", upload.single("Avatar"), (req, res) => {
  const { Username, Password, CPassword, DeviceInfo } = req.body;
  deviceInfo = DeviceInfo ? DeviceInfo : "";
  avatar = req.file ? req.file.buffer : Buffer.alloc(0);
  if (!Username || !Password || !CPassword) {
    return res.send({ message: "please fill in all the required fields !", code: "nok" });
  }
  if (Password != CPassword) {
    return res.send({ message: "Passwords doesn't match !", code: "nok" });
  }
  if (Password.length < 6) {
    return res.send({ message: "Password must be greater than 6 character !", code: "nok" });
  }

  User.findOne({ Username: Username })
    .then((user) => {
      if (user) {
        res.send({ message: "This Username is taken, try another one!", code: "nok" });
      } else {
        const NewUser = new User({
          Username,
          Password,
        });
        bcrypt
          .genSalt(15)
          .then((salt) => {
            bcrypt
              .hash(NewUser.Password, salt)
              .then((hash) => {
                NewUser.Password = hash;
                NewUser.save()
                  .then((_user) => {
                    res.send({ message: "register successfully done", code: "ok", user: _user });
                  })
                  .catch((err) => console.log(err));
              })
              .catch((err) => console.log(err));
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => {
      res.send({ message: err.message, code: "nok" });
    });
});
router.post("/loggin", upload.none(), passport.authenticate("local"), (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "connect.sid=" + req.cookies["connect.sid"] })
    .then((user) => {
      res.send({ message: "You are logged in", code: "ok" });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
