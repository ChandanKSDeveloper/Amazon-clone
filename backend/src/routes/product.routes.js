import { Router } from "express";
import {
    newProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    createProductReview,
    getProductReviews,
    deleteProductReview
} from "../controllers/product.controller.js";

import {upload} from "../utils/upload.middleware.js" 
import {
    isAuthenticatedUser,
    authorizeRoles
} from "../middleware/auth.middleware.js";

const router = Router();

router.get("/products", getProducts);

router.post(
    "/admin/product/new",
    isAuthenticatedUser,
    authorizeRoles("admin"),
    upload.array("images", 4),
    newProduct
);

router
    .route("/product/:id")
    .get(getProductById);

router
    .route("/admin/product/:id")
    .put(isAuthenticatedUser, authorizeRoles("admin"),  upload.array("images", 4), updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);

router
    .route("/review")
    .put(isAuthenticatedUser, createProductReview)
    .delete(isAuthenticatedUser, deleteProductReview);

router.get("/reviews", getProductReviews);

export default router;