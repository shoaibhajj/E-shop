/* eslint-disable new-cap */
const mongoose = require("mongoose");

// 1-Create Schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // bisnuss Requirement
      required: [true, "Category required"],
      unique: [true, "Category must be unique"],
      minlength: [3, "Too short category name"],
      maxlength: [32, "Too long category name"],
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
    const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imageUrl;
  }
};
// findOne ,findAll , update
categorySchema.post("init", (doc) => {
  // return image base url +  image name
  setImageUrl(doc);
});
// create
categorySchema.post("save", (doc) => {
  // return image base url +  image name
  setImageUrl(doc);
});
// 2-Create Model
const CategoryModel = new mongoose.model("Category", categorySchema);

module.exports = CategoryModel;
