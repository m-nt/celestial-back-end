const mongoose = require("mongoose");

const ExcludedSchema = new mongoose.Schema({
  excludeJson: {
    type: Object,
    default: {},
  },
});

const Excluded = mongoose.model("Excluded", ExcludedSchema);

module.exports = Excluded;
