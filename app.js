if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ExpressError = require("./utils/ExpressError.js");

// Models
const User = require("./models/user.js");
const Listing = require("./models/listing.js");

// Routes
const listingRoutes = require("./routes/listings.js");
const reviewRoutes = require("./routes/review.js");
const userRoutes = require("./routes/user.js");
const bookingRoutes = require("./routes/booking.js");

// -------------------- 🔗 MongoDB Connection --------------------
const dbUrl = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dbUrl);
}
main()
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.log("❌ DB Error:", err));

// -------------------- 🎨 View Engine Setup --------------------
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// -------------------- ⚙️ Global Middleware --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));


// -------------------- 🗄️ Session Store --------------------
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600
});

store.on("error", err => {
    console.log("❌ ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.use(session(sessionOptions));
app.use(flash());

// -------------------- 🔐 Passport Setup --------------------
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// -------------------- 🌟 Flash + Current User --------------------
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null; // always defined
    next();
});

// -------------------- 🧩 Route Mounting --------------------
app.use("/listing", listingRoutes);
app.use("/listing/:id/reviews", reviewRoutes);
app.use("/", userRoutes);
app.use("/", bookingRoutes);

// -------------------- 🛣️ Root Route --------------------
app.get("/", async (req, res) => {
    try {
        const allListings = await Listing.find({});
        res.render("listings/index", { allListings, query: null });
    } catch (err) {
        console.log(err);
        res.render("listings/error.ejs", { message: "Unable to load listings" });
    }
});



// -------------------- 🛠️ Demo User --------------------
app.get("/demouser", async (req, res) => {
    const fakeUser = new User({
        email: "bittu@gmail.com",
        username: "bittu"
    });
    const newUser = await User.register(fakeUser, "helloworld");
    res.send(newUser);
});

// -------------------- ❌ Error Handling --------------------
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    const { status = 500, message = "Something Went Wrong" } = err;
    res.status(status).render("listings/error.ejs", { message });
});

// -------------------- 🚀 Server Start --------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
