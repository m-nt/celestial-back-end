const express = require("express");
const multipart = require("multer");
const upload = multipart();
const { IsAuthenticated } = require("../config/Auth");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const User = require("../models/User");
const router = express.Router();

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
