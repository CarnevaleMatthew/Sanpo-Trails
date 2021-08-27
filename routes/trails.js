const express = require("express");
const router = express.Router();
const trails = require("../controllers/trails");

const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isAuthor, validateTrail, validateComment } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const ExpressError = require("../utils/ExpressError");
const Trail = require("../models/trails");

router
  .route("/")
  .get(wrapAsync(trails.index))
  .post(isLoggedIn, upload.array('image'), validateTrail, wrapAsync(trails.create));


router.get("/new", isLoggedIn, trails.new);

router
  .route("/:id")
  .get(wrapAsync(trails.show))
  .put(isLoggedIn, isAuthor, upload.array('image'), validateTrail, wrapAsync(trails.update))
  .delete(isLoggedIn, isAuthor, wrapAsync(trails.delete));

router.get("/:id/edit", isLoggedIn, isAuthor, wrapAsync(trails.edit));

module.exports = router;
