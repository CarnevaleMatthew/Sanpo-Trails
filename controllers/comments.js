const Trail = require("../models/trails");
const Comment = require("../models/comment");

module.exports.create = async (req, res) => {
    const { id } = req.params;
    const trail = await Trail.findById(id);
    const newComment = await new Comment(req.body.comment);
    newComment.author = req.user._id;
    trail.comments.push(newComment);
    await newComment.save()
    await trail.save();
    req.flash('success', 'Successfully Added a Comment!');
    res.redirect(`/trails/${id}`)
};

module.exports.delete = async (req, res) => {
    const { id, commentId } = req.params;
    await Trail.findByIdAndUpdate(id, { $pull: { comments: commentId } })
    await Comment.findByIdAndDelete(commentId);
    res.redirect(`/trails/${id}`)
};