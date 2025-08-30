const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
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
  password: { type: String, required: true },
  addresses: { type: [String], default: [] },
  type: { type: String, default: "user" },

  // Cart: only store id, name, price, images
  cart: [
    {
      product: {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        images: [String],
      },
      quantity: { type: Number, required: true, default: 1 },
    },
  ],

  wishlist: [
    {
      product: {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        images: [String],
      },
    },
  ],
});

const User = mongoose.model("User", userSchema);
module.exports = { User };
