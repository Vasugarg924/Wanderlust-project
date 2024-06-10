const listing=require("./models/listing");
const Review=require("./models/review");
const {listingSchema, reviewSchema}=require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
};
module.exports.isOwner=async (req,res,next)=>{
    let {id}= req.params;
    let Listing = await listing.findById(id);
    if(!Listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of this Listing");
        return res.redirect(`/listings/${id}`);
    }
    // await listing.findByIdAndUpdate(id,{...req.body.newlisting});
    // res.redirect(`/listings/${id}`);
    next();
};

module.exports.validateListing = (req, res, next) => {
    // console.log(listingSchema);
    console.log(req.body);
    let {error} = listingSchema.validate(req.body);
    if (error) {
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else{
        next();
    }

};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(",");
        return next(new ExpressError(400, errMsg)); // Pass the error to the next middleware
    }
    next(); // Proceed to the next middleware if there are no errors
};


module.exports.isReviewAuthor = async (req,res,next)=>{
    let { id,reviewid } = req.params;
    let review = await Review.findById(reviewid);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","you are not the author of this review")
        return res.redirect(`/listings/${id}`);
    }
    next();
}