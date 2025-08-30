const express = require("express");
const userRouter = express.Router();
const auth = require("../middlewares/auth");
const { Product } = require("../models/product");
const { User } = require("../models/user");
const Order = require("../models/order");

// Add to cart
userRouter.post("/api/add-to-cart", auth, async (req, res) => {
  try {
    const { id, quantity = 1 } = req.body;
    const product = await Product.findById(id);
    let user = await User.findById(req.user);

    if (!product) return res.status(404).json({ msg: "Product not found" });

    if (product.quantity < quantity) {
      return res.status(400).json({ msg: "Item out of stock" });
    }

    const productData = {
      _id: product._id,
      name: product.name,
      price: product.price,
      images: product.images,
    };

    let existing = user.cart.find((p) => p.product._id.equals(product._id));

    if (existing) {
      if (existing.quantity + quantity > product.quantity) {
        return res
          .status(400)
          .json({ msg: "Cannot add more than available stock" });
      }
      existing.quantity += quantity;
    } else {
      user.cart.push({ product: productData, quantity });
    }

    await user.save();
    res.json(user.cart);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete entire product from cart
userRouter.delete(
  "/api/remove-product-from-cart/:id",
  auth,
  async (req, res) => {
    try {
      const { id } = req.params;
      let user = await User.findById(req.user);

      user.cart = user.cart.filter((item) => !item.product._id.equals(id));

      await user.save();
      res.json(user.cart);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

// Remove single quantity from cart
userRouter.delete("/api/remove-from-cart/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    let user = await User.findById(req.user);

    user.cart = user.cart
      .map((item) => {
        if (item.product._id.equals(id)) {
          if (item.quantity > 1) {
            item.quantity -= 1;
            return item;
          }
          return null;
        }
        return item;
      })
      .filter(Boolean);

    await user.save();
    res.json(user.cart);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Save user address
userRouter.post("/api/save-user-address", auth, async (req, res) => {
  try {
    const { address } = req.body;
    let user = await User.findById(req.user);

    if (!user.addresses.includes(address)) {
      user.addresses.push(address);
    }

    await user.save();
    res.json({ addresses: user.addresses });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Place order
userRouter.post("/api/order", auth, async (req, res) => {
  try {
    const { cart, totalPrice, address } = req.body;
    let products = [];

    for (let i = 0; i < cart.length; i++) {
      let product = await Product.findById(cart[i].product._id);
      if (!product) return res.status(404).json({ msg: "Product not found" });

      if (product.quantity >= cart[i].quantity) {
        product.quantity -= cart[i].quantity;
        products.push({
          product: {
            _id: product._id,
            name: product.name,
            price: product.price,
            images: product.images,
          },
          quantity: cart[i].quantity,
        });
        await product.save();
      } else {
        return res.status(400).json({ msg: `${product.name} is out of stock` });
      }
    }

    let order = new Order({
      products,
      totalPrice,
      address,
      userId: req.user,
      orderedAt: Date.now(),
    });

    await order.save();

    let user = await User.findById(req.user);
    user.cart = [];
    await user.save();

    res.json({ order, cart: [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete user address
userRouter.post("/api/delete-user-address", auth, async (req, res) => {
  try {
    const { address } = req.body;
    let user = await User.findById(req.user);

    user.addresses = user.addresses.filter((a) => a !== address);
    await user.save();

    res.json({ addresses: user.addresses });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get user orders
userRouter.get("/api/orders/me", auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get single order
userRouter.get("/api/orders/:id", auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user });
    if (!order) return res.status(404).json({ msg: "Order not found" });
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Wishlist - get
userRouter.get("/api/wishlist", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    res.json(user.wishlist);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Wishlist - add
userRouter.post("/api/add-to-wishlist", auth, async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ msg: "Product not found" });

    let user = await User.findById(req.user);

    const exists = user.wishlist.some((item) =>
      item.product._id.equals(product._id)
    );

    if (!exists) {
      const productData = {
        _id: product._id,
        name: product.name,
        price: product.price,
        images: product.images,
      };
      user.wishlist.push({ product: productData });
      await user.save();
    }

    res.json(user.wishlist);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Wishlist - remove
userRouter.delete("/api/remove-from-wishlist/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    let user = await User.findById(req.user);

    user.wishlist = user.wishlist.filter(
      (item) => !item.product._id.equals(id)
    );

    await user.save();
    res.json(user.wishlist);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = userRouter;
