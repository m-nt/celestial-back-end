const express = require("express");
const cors = require("cors");
const mongose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const app = express();
const PORT = process.env.PORT || 8080;
//MongoDB URL
const URL = require("./config.json").MongoURL;
const Options = require("./config.json").MongoOpt;
const cookieParser = require("cookie-parser");

//passport config
require("./config/passport")(passport);
//mongose connection
mongose
  .connect(URL, Options)
  .then(() => console.log(`mongoose conected to Data Base...`))
  .catch((err) => console.log(err));

//Body Parser
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: true }));

app.use(cors());
//Express session
app.use(
  session({
    secret: "secret",
    resave: false,
    store: MongoStore.create({ mongoUrl: URL, ttl: 30 * 24 * 60 * 60 }), // 30 days
    saveUninitialized: true,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);
//passport midware
//app.use(express.static("./Static"));
app.use(passport.initialize());
app.use(passport.session());

//Routes set up
//app.use("/users", require("./routes/user"));
app.use("/api", require("./routes/main"));
app.use("/auth", require("./routes/User"));

app.listen(PORT, console.log(`app listening on port:${PORT}`));
