module.exports = {
  ensureAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      res.send({ message: "You are logged in !", code: "ok" });
    }
    return next();
  },
  IsAuthenticated: (req, res, next) => {
    if (req.isAuthenticated() && req.user.role == "admin") {
      return next();
    }
    res.send({ message: "You are not alowed!", code: "nok" });
  },
};
