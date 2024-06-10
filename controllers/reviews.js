const listing=require("../models/listing")
const Review = require("../models/review");

module.exports.createReview=async(req,res)=>{
    // console.log(req.params.id);
    let Listing=await listing.findById(req.params.id);
    let newreview = new Review(req.body.review);
    newreview.author = req.user._id;
    console.log(newreview);
    Listing.reviews.push(newreview);
    await newreview.save();
    await Listing.save();
    req.flash("success","New Review Created!");
    res.redirect(`/listings/${Listing._id}`);
};

module.exports.destroReview=async(req,res)=>{
    let {id,reviewid}=req.params;
    await listing.findByIdAndUpdate(id,{$pull: {reviews: reviewid}});
    await Review.findByIdAndDelete(reviewid);
    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
};

