const mongoose = require("mongoose");
const ratingSchema = require("./rating");
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  ratings: {
    type: [ratingSchema],
    default: [], // 👈 ensures new product starts with no ratings
  },
});
const Product = mongoose.model("Product", productSchema);
module.exports = { Product, productSchema };
