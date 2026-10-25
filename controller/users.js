const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");

module.exports.getSignup = async(req,res)=>{
    res.render("users/signup.ejs");
}

module.exports.postSignup = async(req,res,next)=>{
    try{
    let {username,email,password}= req.body;
    const newUser = new User({username,email});
    const registeredUser = await User.register(newUser,password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
        if(err) {
            return next(err);
        }
        req.flash("success","Congratulation, Welcome to WanderLust");
        res.redirect("/listing")
    });
    } catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}

module.exports.getLogin = (req,res)=>{
    res.render("users/login.ejs")
}

module.exports.postLogin = async (req, res) => {
  req.flash("success", "Welcome Back to Wanderlust");
  const redirectUrl = req.session.redirectUrl || "/listing";
  delete req.session.redirectUrl;
  res.redirect(redirectUrl);
};

module.exports.logout = (req,res,next)=>{
    req.logout((err) =>{
        if(err){
            return next(err);
        }
        req.flash("success","You are logged Out");
        res.redirect("/listing");
    })
}

module.exports.getProfile = async (req, res) => {
    const user = req.user;
    const listings = await Listing.find({ owner: user._id });
    const bookings = await Booking.find({ user: user._id })
        .populate("listing")
        .sort({ createdAt: -1 });

    res.render("users/profile.ejs", { user, listings, bookings });
};