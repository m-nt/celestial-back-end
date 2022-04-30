const mongoose = require("mongoose");

const WhitelistSchema = new mongoose.Schema({
  list: {
    type: Object,
    default: [],
  },
});

const Whitelist = mongoose.model("Whitelist", WhitelistSchema);

module.exports = Whitelist;
