const { trailsSchema, commentSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Trail = require('./models/trails');
const Comment = require("./models/comment");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must register or login to blaze a new trail.');
        return res.redirect('/login');
    }
    next();
};

module.exports.validateTrail = (req, res, next) => {
    const { error } = trailsSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
};

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const trail = await Trail.findById(id).populate('author');
        if (!trail.author.equals(req.user)) {
        req.flash('error', 'You do not have permission')
        res.redirect(`/trails/${id}`);
    }
    next()
};

module.exports.isCommentAuthor = async (req, res, next) => {
    const { id, commentId } = req.params;
    const comment = await Comment.findById(commentId).populate('author');
        if (!comment.author.equals(req.user)) {
        req.flash('error', 'You do not have permission')
        res.redirect(`/trails/${id}`);
    }
    next()
};

module.exports.validateComment = (req, res, next) => {
    const { error } = commentSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
};