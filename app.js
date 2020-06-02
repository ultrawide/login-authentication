// app.js

const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
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

app.get("/", (req, res) => res.render("index"));
app.get("/sign-up", (req, res) => res.render("sign-up-form"));

// todo: sanitize and validate inputs
app.post("/sign-up", (req, res, next) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    }).save(err => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

// todo: sanitize inputs
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
            if (user.password !== password) {
                return done(null, false, { msg: "Incorrect password" });
            }
            return done(null, user);
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

app.listen(3000, () => console.log("app listening on port 3000!"));