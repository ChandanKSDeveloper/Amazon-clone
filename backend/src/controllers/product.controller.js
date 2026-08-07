import asyncHandler from "../utils/asyncHandler.js";
import * as productService from "../services/product.service.js";

export const newProduct = asyncHandler(async (req, res, next) => {
  const product = await productService.createProduct(req);
  res.status(201).json({
    success: true,
    product,
  });
});

export const getProducts = asyncHandler(async (req, res, next) => {
  const data = await productService.getProducts(req.query);

  res.status(200).json({
    success: true,
    ...data,
  });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);

  res.status(200).json({
    success: true,
    product,
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req);

  res.status(200).json({
    success: true,
    product,
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

// product.controller.js
// next in param
export const createProductReview = asyncHandler(async (req, res, next) => {
    const { productId, rating, comment } = req.body;
    
    // Validate input
    if (!productId || !rating) {
        throw new ErrorHandler("Product ID and rating are required", 400);
    }
    
    if (rating < 1 || rating > 5) {
        throw new ErrorHandler("Rating must be between 1 and 5", 400);
    }
    
    const product = await productService.createReview({
        productId,
        rating,
        comment: comment || '',
        user: req.user
    });
    
    res.status(200).json({
        success: true,
        message: "Review added successfully",
        product
    });
});

export const getProductReviews = asyncHandler(async (req, res) => {

    const productId = req.query.id;
    if (!productId) {
        throw new ErrorHandler("Product ID is required", 400);
    }
  const reviews = await productService.getReviews(productId);

  res.status(200).json({
    success: true,
    count: reviews.length,
    reviews,
  });
});

export const deleteProductReview = asyncHandler(async (req, res) => {
  const product = await productService.deleteReview(req.query);

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
    reviews: product.reviews,
    rating: product.rating,
    numberOfReviews: product.numberOfReviews,
  });
});
