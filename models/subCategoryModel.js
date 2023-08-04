const mongoose = require("mongoose");

const subCategorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      // trim it will make name without space after or befor  ex: "   hp" or "hp     " => "hp"
      trim: true,
      unique: [true, "SubCategory must be unique"],
      minlenght: [2, "Too short SubCategory name "],
      maxlengt: [32, "Too long SubCategory name "],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    // now we should make this subCategory to refier to main Category like hp should refier to computers category
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "SubCategory must be belong to parent category "],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubCategory", subCategorySchema);
