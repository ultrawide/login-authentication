// app.js

const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")
const Schema = mongoose.Schema;

const mongoDb = "mongodb+srv://ultrawide:dummy123@passport-cluster-i6uda.azure.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const User = mongoose.model(
    "User",
    new Schema({
        username: { type: String, required: true },
        password: { type: String, required: true}
    })
);

const app = express();
app.set("views", __dirname);
app.set("view engine", "ejs");

app.use(session({ secret: "cats", resave: false, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

// Allow access to current user in middleware
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

app.get("/", (req, res) => {
    res.render("index", { user: req.user });
});
app.get("/log-out", (req, res) => {
    req.logout();
    res.redirect("/");
});
app.get("/sign-up", (req, res) => res.render("sign-up-form"));

// todo: sanitize and validate inputs
app.post("/sign-up", (req, res, next) => {
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) {
            return next(err);
        }
        // otherwise, store hashedPassword in DB
        const user = new User({
            username: req.body.username,
            password: hashedPassword
        }).save(err => {
            if (err) {
                return next(err);
            }
            res.redirect("/");
        });
      });
});

// This middleware performs numerous functions behind the scenes. 
// Among other things, it looks at the request body for parameters named 
// username and password then runs the LocalStrategy function that we defined 
// earlier to sece if the username and password are in the database. It 
// then creates a session cookie which gets stored in the user’s browser, 
// and that we can access in all future requests to see whether or not that
// user is logged it. It can also redirect you to different routes based on 
// whether the login is a success or a failure. 
app.post(
    "/log-in",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/"
    })
);

// setting up the LocalStrategy
passport.use(
    new LocalStrategy((username, password, done) => {
        User.findOne({ username: username }, (err, user) => {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, { msg: "Incorrect username" });
            }
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                  // passwords match! log user in
                  return done(null, user)
                } else {
                  // passwords do not match!
                  return done(null, false, {msg: "Incorrect password"})
                }
              })
        });
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser(function(id, done) {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});