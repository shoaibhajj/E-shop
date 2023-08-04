/* eslint-disable new-cap */
const mongoose = require("mongoose");

// 1-Create Schema
const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // bisnuss Requirement
      required: [true, "Brand required"],
      unique: [true, "Brand must be unique"],
      minlength: [3, "Too short Brand name"],
      maxlength: [32, "Too long Brand name"],
    },
    // slug to convert A and B => shopping.com/a-and-b (After install package slugify)
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  }, // mongoose opition  {timesstamp} =>that will create two fields in Document {Created at  , Updated at }
  // that will be useful when I need to get what is leatest (modern) Categories or products
  { timestamps: true }
);

const setImageUrl = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
    doc.image = imageUrl;
  }
};
// findOne ,findAll , update
brandSchema.post("init", (doc) => {
  // return image base url +  image name
  setImageUrl(doc);
});
// create
brandSchema.post("save", (doc) => {
  // return image base url +  image name
  setImageUrl(doc);
});
// 2-Create Model
const BrandModel = new mongoose.model("Brand", brandSchema);

module.exports = BrandModel;
