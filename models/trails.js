const mongoose = require("mongoose");
const Comment = require("./comment");
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
    url: String, 
    filename: String
});

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200/');
});

const opts = { toJSON: {virtuals: true}}

const TrailSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
          type: String,
          enum: ['Point'], 
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    difficulty: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: "Comment",
        },
    ],
}, opts);

TrailSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href="/trails/${this._id}">${this.title}</a></strong>`
});

TrailSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await Comment.deleteMany({
            _id: {
                $in: doc.comments,
            },
        });
    }
});






module.exports = mongoose.model("Trail", TrailSchema);
