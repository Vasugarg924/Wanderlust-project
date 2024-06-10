const listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({accessToken: mapToken});

module.exports.index=async (req,res)=>{
    let alllistings=await listing.find({});
    res.render("listings/index.ejs",{alllistings});
};

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs")
};


// module.exports.showListing =async (req, res) => {
//     let { id } = req.params;
//     const Listing = await listing.findById(id)
//         .populate({
//             path: "reviews",
//             populate: {
//                 path: "author"
//             },
//         }).populate("owner");
//     if (!listing) {
//         req.flash("error", "Listing you requested for does not exist!");
//         res.redirect("/listings");
//     }
//     console.log(listing);
//     res.render("listings/show.ejs", { Listing });
// };

module.exports.showListing=async (req, res) => {
    let { id } = req.params;
    const Listing = await listing.findById(id).populate({path: "reviews",populate:{path:"author"}}).populate("owner");
    if(!Listing){
        req.flash("error","lisiting you requested for does not exist");
        res.redirect("/listings");
    }
    console.log(Listing);
    res.render("listings/show.ejs", { Listing })
};

module.exports.createListing=async (req, res, next) => {
    let response= await geocodingClient.forwardGeocode({
        query: req.body.newlisting.location,
        limit: 1,
      })
        .send();
        
    let url=req.file.path;
    let filename=req.file.filename;
    // let {title, description, image, price,country,location }= req.body;
    const savelisting = new listing(req.body.newlisting);
    savelisting.owner=req.user._id;
    savelisting.image={url,filename};

    savelisting.geometry=response.body.features[0].geometry;

    let savedListing=await savelisting.save();
    console.log(savedListing);
    res.redirect("/listings");
};

module.exports.renderEditform=async (req,res)=>{
    let {id} = req.params;
    const Listing = await listing.findById(id);
    if(!Listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    let originalimage=Listing.image.url;
    originalimage=originalimage.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{Listing,originalimage});
};



module.exports.updateListing = async (req, res) => {
    // if(!req.body.newlisting){
    //     throw new ExpressError(400,"Send Valid data for listing");
    // }
    
    let { id } = req.params;
    let updatelisting = await listing.findByIdAndUpdate(id, { ...req.body.newlisting });
    
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        updatelisting.image = { url, filename };
        await updatelisting.save();
    }
    
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};




module.exports.destroyListing = async (req,res)=>{
    let {id}=req.params;
    let deleatedlisting = await listing.findByIdAndDelete(id);
    console.log(deleatedlisting);
    res.redirect("/listings");
};