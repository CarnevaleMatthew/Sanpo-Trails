const express = require("express");
const router = express.Router({ mergeParams: true });
const comments = require("../controllers/comments");

const { commentSchema } = require("../schemas.js");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");

const {
  validateComment,
  isLoggedIn,
  isCommentAuthor,
} = require("../middleware");

const Trail = require("../models/trails");
const Comment = require("../models/comment");

router.post("/", isLoggedIn, validateComment, wrapAsync(comments.create));

router.delete(
  "/:commentId",
  isCommentAuthor,
  isLoggedIn,
  wrapAsync(comments.delete)
);

module.exports = router;
