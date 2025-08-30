const mongoose = require("mongoose");
const { productSchema } = require("./product"); // Importing product schema for cart items

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: {
      validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: "Please enter a valid email address",
    },
  },
  password: {
    type: String,
    required: true,
  },
  addresses: {
    // ✅ changed from single 'address' to list
    type: [String],
    default: [],
  },
  type: {
    type: String,
    default: "user",
  },
  cart: [
    {
      product: productSchema,
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  wishlist: [
    {
      product: productSchema,
    },
  ],
});

const User = mongoose.model("User", userSchema);
module.exports = { User };
