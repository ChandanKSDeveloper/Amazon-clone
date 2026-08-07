import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import { deleteCachedData } from "../utils/redis.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import ApiFeatures from "../utils/ApiFeatures.js";

export const addToCart = async (userId, productId, quantity = 1) => {
  const product = await Product.findById(productId);

  if (!product) throw new ErrorHandler("Product not found", 404);

  if (product.stock < quantity) {
    throw new ErrorHandler(
      `Only ${product.stock} items available in stock`,
      400,
    );
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  const existingItemIndex = user.cart.findIndex(
    (item) => item.product.toString() === productId,
  );

  if (existingItemIndex !== -1) {
    const newQuantity = user.cart[existingItemIndex].quantity + quantity;
    if (newQuantity > product.stock) {
      throw new ErrorHandler(
        `Cannot add more than ${product.stock} items`,
        400,
      );
    }

    user.cart[existingItemIndex].quantity = newQuantity;
  } else {
    user.cart.push({
      product: productId,
      quantity: quantity,
    });
  }

  await user.save();

  await user.populate(`cart.product`, `name price images`);

  // Clear cache
  await deleteCachedData(`user:${userId}`);
  await deleteCachedData("cart:*");

  return user.cart;
};

export const removeFromCart = async (userId, productId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  const initialLengthOfCart = user.cart.length;
  user.cart = user.cart.filter((item) => item.product.toString() !== productId);

  if (user.cart.length === initialLengthOfCart) {
    throw new ErrorHandler("product not found", 404);
  }

  await user.save();
  await user.populate("cart.product", "name price images");
  await deleteCachedData(`user:${userId}`);
  return user.cart;
};

export const updateCartQuantity = async (userId, productId, quantity) => {
  if (quantity < 1) {
    throw new ErrorHandler("Quantity must be at least 1", 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  const cartItem = user.cart.find(
    (item) => item.product.toString() === productId,
  );

  if (!cartItem) {
    throw new ErrorHandler("Product not found in cart", 404);
  }

  // Check stock
  const product = await Product.findById(productId);
  if (!product) {
    throw new ErrorHandler("Product not found", 404);
  }

  if (product.stock < quantity) {
    throw new ErrorHandler(
      `Only ${product.stock} items available in stock`,
      400,
    );
  }

  cartItem.quantity = quantity;

  await user.save();
  await user.populate("cart.product", "name price images");
  await deleteCachedData(`user:${userId}`);

  return user.cart;
};

export const getCart = async (userId) => {
  const user = await User.findById(userId).populate({
    path: "cart.product",
    select: "name price images stock ratings",
  });

  if (!user) throw new ErrorHandler("User not found", 404);

  const cartItems = user.cart.map((item) => ({
    ...item.toObject(),
    subtotal: item.product.price * item.quantity,
  }));

  const totalPrice = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cart: cartItems,
    totalPrice,
    totalItems,
    cartCount: cartItems.length,
  };
};

export const clearCart = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ErrorHandler("User not found", 404);

  user.cart = [];
  await user.save();
  await deleteCachedData(`user:${userId}`);

  return { message: "Cart cleared successfully", cart: [] };
};

export const checkCartStock = async (userId) => {
  const user = await User.findById(userId).populate(
    "cart.product",
    "name stock price",
  );
  if (!user) throw new ErrorHandler("User not found", 404);

  const unavailableItems = [];
  const cartItems = user.cart.map((item) => {
    const product = item.product;
    if (product.stock < item.quantity) {
      unavailableItems.push({
        productId: product._id,
        name: product.name,
        requestedQuantity: item.quantity,
        availableStock: product.stock,
      });
    }
    return { ...item.toObject(), inStock: product.stock >= item.quantity };
  });

  return {
    cart: cartItems,
    unavailableItems,
    hasUnavailableItems: unavailableItems.length > 0,
  };
};
