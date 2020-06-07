# Login Authentication

This is a small project to learn how to set up a basic login interface. I may revisit this to try out Oauth. Currently, signing up will push the username/password onto a database stored on MongoDB atlas. You can login afterwards in which case a unique cookie will be asigned to the client's browser. Passwords are hashed onto the database. Note that inputs are not validated/sanitized and is vulnerable to attacks; this was simply a proof of concept to learn passport/bcryptjs/donenv.
