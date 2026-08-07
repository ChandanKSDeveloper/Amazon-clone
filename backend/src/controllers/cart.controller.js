import asyncHandler from "../utils/asyncHandler.js";

import * as cartService from "../services/cart.service.js";

export const addToCart = asyncHandler(async (req, res, next) => {
  const cart = await cartService.addToCart(
    req.user._id,
    req.params.productId,
    req.body.quantity,
  );

  res.status(200).json({ success: true, cart });
});

export const removeFromCart = asyncHandler(async (req, res, next) => {
  const cart = await cartService.removeFromCart(
    req.user._id,
    req.params.productId,
  );

  res.status(200).json({ success: true, cart });
});


export const updateCartQuantity = asyncHandler(async (req, res, next) => {
  const cart = await cartService.updateCartQuantity(req.user._id, req.params.productId, req.body.quantity);
  res.status(200).json({ success: true, cart });
});

export const getCart = asyncHandler(async (req, res, next) => {
  const cartData = await cartService.getCart(req.user._id);

  console.log(cartData)
  console.log(req.user._id)
  res.status(200).json({ success: true, ...cartData });
});

export const clearCart = asyncHandler(async (req, res, next) => {
  const result = await cartService.clearCart(req.user._id);
  res.status(200).json({ success: true, ...result });
});

export const checkCartStock = asyncHandler(async (req, res, next) => {
  const stockData = await cartService.checkCartStock(req.user._id);
  res.status(200).json({ success: true, ...stockData });
});