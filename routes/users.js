const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const users = require("../controllers/users");
const wrapAsync = require("../utils/wrapAsync");

router.route("/register").get(users.register).post(wrapAsync(users.create));

router
  .route("/login")
  .get(users.login)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.passportLogin
  );

router.get("/logout", users.logout);

module.exports = router;
