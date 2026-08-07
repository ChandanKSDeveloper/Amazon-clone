import { Router } from "express";

import { isAuthenticatedUser } from "../middleware/auth.middleware.js";
import {addToCart, removeFromCart, updateCartQuantity, getCart, clearCart, checkCartStock} from "../controllers/cart.controller.js"
const router = Router();

router.route("/")
    .get(isAuthenticatedUser, getCart)
    .delete(isAuthenticatedUser, clearCart);

router.route("/stock")
  .get(isAuthenticatedUser, checkCartStock);

  router.route("/:productId")
  .post(isAuthenticatedUser, addToCart)
  .delete(isAuthenticatedUser, removeFromCart)
  .put(isAuthenticatedUser, updateCartQuantity);

export default router;