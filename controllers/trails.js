const Trail = require("../models/trails");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.mapbox_token;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const {cloudinary} = require('../cloudinary');

module.exports.index = async (req, res) => {
    const trails = await Trail.find({});
    res.render("trails/index", { trails });
};

module.exports.new = (req, res) => {
    res.render("trails/new");
};

module.exports.create = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.trail.location,
        limit: 1
    }).send()
    const newTrail = new Trail(req.body.trail);
    newTrail.geometry = geoData.body.features[0].geometry;
    newTrail.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    newTrail.author = req.user._id;
    await newTrail.save();
    req.flash('success', 'Successfully blazed a new trail!');
    res.redirect("/trails");
};

module.exports.show = async (req, res) => {
    const { id } = req.params;
    const foundTrail = await Trail.findById(id).populate({
        path: 'comments',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!foundTrail) {
        req.flash('error', 'This trail cannot be found. Either it has been deleted or has yet to be blazed.')
        return res.redirect('/trails');
    }
    res.render("trails/show", { foundTrail });
};

module.exports.edit = async (req, res) => {
    const { id } = req.params;
    const foundTrail = await Trail.findById(id);
    if (!foundTrail) {
        req.flash('error', 'This trail cannot be found.');
        return res.redirect('/trails');
    }
    res.render("trails/edit", { foundTrail });
};

module.exports.update = async (req, res) => {
    const { id } = req.params;
    const updatedTrail = await Trail.findByIdAndUpdate(id, { ...req.body.trail });
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    updatedTrail.images.push(...imgs);
    await updatedTrail.save();
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await updatedTrail.updateOne({$pull: {images: {filename: {$in : req.body.deleteImages}}}})
    }
    req.flash('success', 'Successfully Updated Trail');
    res.redirect(`/trails/${id}`);
};

module.exports.delete = async (req, res) => {
    const { id } = req.params;
    const updateTrail = await Trail.findById(id);
    await Trail.findByIdAndDelete(id);
    req.flash('success', 'You have deleted the trail.')
    res.redirect("/trails");
};