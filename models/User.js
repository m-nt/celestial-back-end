const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  Username: {
    type: String,
    required: true,
  },
  Password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    default: "user",
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
