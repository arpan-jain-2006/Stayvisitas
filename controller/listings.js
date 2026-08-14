const Listing = require("../models/listing.js");
      //home page
// module.exports.index = async (req, res) => {
//     let allListing = await Listing.find({});
//     res.render("listings/index", { allListing });
// };

module.exports.index = async (req, res) => {
  const { q } = req.query;
  let allListings;

  if (q) {
    const exactMatch = await Listing.find({
      $or: [{ title: q }, { location: q }]
    });

    const partialMatches = await Listing.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } }
      ],
      title: { $ne: q },
      location: { $ne: q }
    });

    allListings = [...exactMatch, ...partialMatches];
  } else {
    allListings = await Listing.find({});
  }

  res.render("listings/index", { allListings, query: q || "" });
};

    //New Listing creation
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");  
}
    //form post route
module.exports.post = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  // Add this line 👇
  newListing.owner = req.user._id;
  newListing.image = {url,filename};
  await newListing.save();
  req.flash("success", "New listing created");
  res.redirect("/listing");
}
        //Edit our Listing
module.exports.editListing = async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing required dosen't Exist")
        return res.redirect("/listing")
    }
    res.render("listings/edit",{listing});
}
         // update our Listing
module.exports.updateListing = async(req,res)=>{
    let {id}= req.params;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file !=="undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url,filename};
    await listing.save();
    }
    req.flash("success"," Listing Updated");
    res.redirect(`/listing/${id}`)
}
        //Delete listing
module.exports.destroyListing = async(req,res)=>{
     let {id} = req.params;
     await Listing.findByIdAndDelete(id);
     req.flash("success","Listing Deleted");
     res.redirect("/listing")
}
        // show our listing 
module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id).populate("owner").populate({path: "reviews",
        populate:{path:"author"
        },
    });
    if(!listing){
        req.flash("error","Listing required dosen't Exist")
        return res.redirect("/listing")
    }
    console.log("Owner data:", listing.owner);
    console.log("Owner ID type:", typeof listing.owner._id);

    res.render("listings/show", { listing });
}
