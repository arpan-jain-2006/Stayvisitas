if(process.env.NODE_ENV != "production"){
require('dotenv').config();
}
console.log(process.env.CLOUD_API_SECRET)
const express = require("express")
const app = express();
const mongoose =   require("mongoose")
const path = require("path");
// const mongourl = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");
app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
const listing = require("./routes/listings.js");
const review = require("./routes/review.js");
const userRoute= require("./routes/user.js")
const session = require("express-session");
const MongoStore = require('connect-mongo');  
const flash = require("connect-flash")
const passport= require("passport");
const Localstrategy = require("passport-local");
const User = require("./models/user.js");
const ExpressError = require("./utils/ExpressError.js")

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600,
});

store.on("error", () =>{
    console.log("ERROR in MONGO SESSION STORE", err)
})

const sessionOptions = { 
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now()+7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    }
};
main()  
.then(()=>{
    console.log("connection with DB");
})
.catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(dbUrl);
}

// app.get("/",(req,res)=>{
//     res.send("hi i am root")
// })

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session())
passport.use(new Localstrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next)=>{
     res.locals.success = req.flash("success");
     res.locals.error = req.flash("error");
     res.locals.currUser = req.user;
     next();
})

app.get("/demouser",async(req,res)=>{
    const fakeuser = new User({
        email:"bittu@gmail.com",
        username:"bittu"
    });
    let newUser = await User.register(fakeuser,"helloworld")
    res.send(newUser);
})

app.use("/listing",listing);
app.use("/listing/:id/reviews",review)
app.use("/",userRoute)
app.use(session(sessionOptions));

app.get("/test",async (req,res)=>{
    let sample = new Listing({
        title:"My new villa",
        description:"by the beach",
        price:1200,
        location:"Calangute Goa",
        country: "India",
    })
     await sample.save();
     console.log("sample was saved")
     res.send("succesfull testing")


})
app.use((req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
})

app.use((err,req,res,next)=>{
    let{status= 404,message="Something Went Wrong"}= err;
    res.render("listings/error.ejs",{message});
    // res.status(status).send(message);
})

// app.use((req,res)=>{
//     res.send("Page Not found");
// })

app.listen(8080,()=>{
    console.log("server is running at port 8080")
});

