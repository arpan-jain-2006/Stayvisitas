const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const{ saveRedirectUrl, isLoggedIn }= require("../middleware.js");
const userController = require("../controller/users.js");

router.route("/signup")
.get(userController.getSignup)
.post(wrapAsync(userController.postSignup))

router.route("/login")
.get(userController.getLogin)
.post(saveRedirectUrl,passport.authenticate("local",{
    failureRedirect:"/login",
    failureFlash: true,
}),userController.postLogin 
);

router.get("/logout",userController.logout);

router.get("/profile", isLoggedIn, wrapAsync(userController.getProfile));

module.exports = router;