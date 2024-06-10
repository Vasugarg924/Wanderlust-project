if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose=require("mongoose");
const listing=require("./models/listing.js");
const path=require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {ListingSchema,reviewSchema}=require("./schema.js");


const dbUrl = process.env.ATLASDB_URL;

const review=require("./models/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingsRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js");
const userRouter = require("./routes/user.js");



main()
    .then(()=>{
    console.log("connected to DB");
})  
    .catch((err)=>{
        console.log(err);
    })
async function main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsmate);
app.use(express.static(path.join(__dirname,"/public")));


const store=MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
})

store.on("error",()=>{
    console.log("Error in Mongo Session Store",err);
})


const sessionOptions={
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxage: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

// app.get("/",(req,res)=>{
//     res.send("WanderLust Project in making ");
// });




app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(",");
        return next(new ExpressError(400, errMsg)); // Pass the error to the next middleware
    }
    next(); // Proceed to the next middleware if there are no errors
};
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    // console.log(success);
    next();
});

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "studentschool@gmail.com",
//         username: "delta-student@123",
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld2");
//     res.send(registeredUser);
// });


app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);

app.get("/",(req,res)=>{
    res.redirect("/listings");
})

// // Index route
// app.get("/listings",wrapAsync(async (req,res)=>{
//     let alllistings=await listing.find({});
//     res.render("listings/index.ejs",{alllistings});
// }))


// // New Route
// app.get("/listings/new",(req,res)=>{
//     res.render("listings/new.ejs")
// })



// // Show Route
// app.get("/listings/:id",wrapAsync(async (req,res)=>{
//     let {id} = req.params;
//     const Listing = await listing.findById(id).populate("reviews");
//     res.render("listings/show.ejs",{Listing});
// }))

// //  Create Route
// app.post("/listings",validateListing, wrapAsync(async (req, res, next) => {
//     // let {title, description, image, price,country,location }= req.body;
//     const savelisting = new listing(req.body.newlisting);
//     await savelisting.save();
//     res.redirect("/listings");
// }))
// // Edit route
// app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
//     let {id} = req.params;
//     const Listing = await listing.findById(id);
//     res.render("listings/edit.ejs",{Listing});
// }))

// // Update Route
// app.put("/listings/:id",validateListing,wrapAsync(async (req,res)=>{
//     // if(!req.body.newlisting){
//     //     throw new ExpressError(400,"Send Valid data for listing");
//     // }
//     let {id}= req.params;
//     await listing.findByIdAndUpdate(id,{...req.body.newlisting});
//     res.redirect(`/listings/${id}`);
// }))

// // delete Route
// app.delete("/listings/:id",wrapAsync(async (req,res)=>{
//     let {id}=req.params;
//     let deleatedlisting = await listing.findByIdAndDelete(id);
//     console.log(deleatedlisting);
//     res.redirect("/listings");
// }))

// // Reviews
// // Post Route
// app.post("/listings/:id/reviews",validateReview,wrapAsync(async(req,res)=>{
//     let Listing=await listing.findById(req.params.id);
//     let newreview = new review(req.body.review);
//     Listing.reviews.push(newreview);
//     await newreview.save();
//     await Listing.save();

//     res.redirect(`/listings/${Listing._id}`);
// }));

// // Delete Review Route
// app.delete("/listings/:id/reviews/:reviewid",wrapAsync(async(req,res)=>{
//     let {id,reviewid}=req.params;
//     await listing.findByIdAndUpdate(id,{$pull: {reviews: reviewid}});
//     await review.findByIdAndDelete(reviewid);
//     res.redirect(`/listings/${id}`);
// })
// );


// app.get("/testlisting", async (req, res) => {
//     let samplelisting = new listing({
//         title: "My New villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "india",
//     });
    
//     await samplelisting.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});

app.use((err,req,res,next)=>{
    let{statuscode=500,message="Something Went Wrong"}=err;
    res.status(statuscode).render("listings/error.ejs",{message,statuscode,err});
    // res.status(statuscode).send(message);
});

app.listen(8080,()=>{
    console.log("Server is listening to port 8080");
});