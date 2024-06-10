// const express = require("express");
// const router = express.Router();
// const wrapAsync=require("../utils/wrapAsync.js");
// const {ListingSchema,reviewSchema}=require("../schema.js");
// const ExpressError = require("../utils/ExpressError.js");
// const listing=require("../models/listing.js");
// const {isLoggedIn}=require("../middleware.js");


// const validateListing = (req, res, next) => {
//     // console.log(ListingSchema);
//     let {error} = ListingSchema.validate(req.body);
//     if (error) {
//         let errMsg=error.details.map((el)=>el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     }
//     else{
//         next();
//     }

// };

// // Index route
// router.get("/",wrapAsync(async (req,res)=>{
//     let alllistings=await listing.find({});
//     res.render("listings/index.ejs",{alllistings});
// }))


// // New Route
// router.get("/new",isLoggedIn,(req,res)=>{
//     res.render("listings/new.ejs")
// })



// // Show Route
// router.get("/:id",wrapAsync(async (req,res)=>{
//     let {id} = req.params;
//     const Listing = await listing.findById(id).populate("reviews");
//     if(!Listing){
//         req.flash("error","Listing you requested does not exist!");
//         res.redirect("/listings");
//     }
//     res.render("listings/show.ejs",{Listing});
// }))

// //  Create Route
// router.post("/",isLoggedIn,validateListing, wrapAsync(async (req, res, next) => {
//     // let {title, description, image, price,country,location }= req.body;
//     const savelisting = new listing(req.body.newlisting);
//     await savelisting.save();
//     req.flash("success","New Listing Created!");
//     res.redirect("/listings");
// }))

// // Edit route
// router.get("/:id/edit",isLoggedIn,wrapAsync(async (req,res)=>{
//     let {id} = req.params;
//     const Listing = await listing.findById(id);
//     if(!Listing){
//         req.flash("error","Listing you requested does not exist!");
//         res.redirect("/listings");
//     }
//     res.render("listings/edit.ejs",{Listing});
// }))

// // Update Route
// router.put("/:id",isLoggedIn,validateListing,wrapAsync(async (req,res)=>{
//     // if(!req.body.newlisting){
//     //     throw new ExpressError(400,"Send Valid data for listing");
//     // }
//     let {id}= req.params;
//     await listing.findByIdAndUpdate(id,{...req.body.newlisting});
//     req.flash("success","Listing Updated");
//     res.redirect(`/listings/${id}`);
// }))

// // delete Route
// router.delete("/:id",isLoggedIn,wrapAsync(async (req,res)=>{
//     let {id}=req.params;
//     let deleatedlisting = await listing.findByIdAndDelete(id);
//     console.log(deleatedlisting);
//     req.flash("success","Listing Deleted");
//     res.redirect("/listings");
// }))

// module.exports=router;



const express = require("express");
const router = express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const listing=require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");
const listingController=require("../controllers/listings.js");
const multer  = require('multer')
const {storage}=require("../cloudConfig.js")
const upload = multer({storage})




router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn,upload.single("newlisting[image]"), wrapAsync(listingController.createListing));


// New Route
router.get("/new",isLoggedIn,listingController.renderNewForm);


router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner,upload.single("newlisting[image]"), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));




// Edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditform));

// Index route
// router.get("/",wrapAsync(listingController.index));

// Show Route
// router.get("/:id", wrapAsync(listingController.showListing));

//  Create Route
// router.post("/",isLoggedIn,validateListing, wrapAsync(listingController.createListing));



// Update Route
// router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));

// delete Route
// router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));

module.exports=router;