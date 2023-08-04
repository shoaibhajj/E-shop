const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlenght: [3, "Too short product title"],
      maxlength: [100, "Too long product title"],
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      minlenght: [20, "Too short Product description"],
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      trim: true,
      // in max price that means the product is not more than 20 dollars
      max: [2000000, "Too long product price"],
    },
    ratingsAverage: {
      type: Number,
      min: [1, "Rating must be above  or equal to 1.0"],
      max: [5, "Rating must be above or equal to 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    priceAfterDiscount: {
      type: Number,
    },
    imageCover: {
      type: String,
      requires: [true, "Product Image Cover is required"],
    },
    colors: [String],
    images: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      required: [true, "Product must be belongs to category"],
      ref: "Category",
    },
    // Product mype belongs to one or more Subcategories so we make an array of subcategories
    subcategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "SubCategory",
      },
    ],
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: "Brand",
    },
  },
  {
    timestamps: true,
    // to enable virtual populate
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

productSchema.pre(/^find/, function (next) {
  this.populate({ path: "category", select: "name -_id" });
  next();
});

const setImageUrl = (doc) => {
  if (doc.imageCover) {
    const imageCoverUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`;
    doc.imageCover = imageCoverUrl;
  }
  if (doc.images) {
    const imagesList = [];
    doc.images.forEach((image) => {
      const imageUrl = `${process.env.BASE_URL}/products/${image}`;

      imagesList.push(imageUrl);
    });
    doc.images = imagesList;
  }
};

// findOne ,findAll , update
productSchema.post("init", (doc) => {
  // return image base url +  image name
  setImageUrl(doc);
});
// create
productSchema.post("save", (doc) => {
  // return image base url +  image name
  setImageUrl(doc);
});

module.exports = mongoose.model("Product", productSchema);
