import Product from "../models/product.model.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinaryUtils.js";

import { cacheData, getCachedData, deleteCachedData } from "../utils/redis.js";

export const createProduct = async (req) => {
  console.log(req.headers["content-type"]);
  console.log(req.body);
  console.log(req.files);

  const { body } = req;
  console.log("creating new product", body);
  let finalImages = [];

  // 1. Handle Uploaded Files (req.files is populated by Multer)
  if (req.files && req.files.length > 0) {
    console.log("req ki files : ", req.files);
    const validFiles = req.files.filter(
      (file) => file && file.path && file.originalname,
    );

    if (validFiles.length > 0) {
      const uploadedImages = await Promise.all(
        req.files.map(async (file) => {
          const result = await uploadOnCloudinary(file.path);

          console.log(result);
          return {
            public_id: result.public_id,
            url: result.secure_url,
          };
        }),
      );
      finalImages.push(...uploadedImages);
    }
  }

  console.log(finalImages);

  // 2. Handle Direct URLs (sent as a JSON string inside body.images)
  const imageUrls = JSON.parse(req.body.imageUrls || "[]");
  if (imageUrls) {
    // 2. Handle Direct URLs
    let urlArray = [];

    try {
      urlArray = JSON.parse(req.body.imageUrls || "[]");
    } catch (err) {
      console.error("Invalid imageUrls JSON:", err);
    }

    if (Array.isArray(urlArray) && urlArray.length > 0) {
      const urlImages = urlArray
        .filter((url) => typeof url === "string" && url.startsWith("http"))
        .map((url) => ({
          public_id: `external_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2)}`,
          url,
        }));

      finalImages.push(...urlImages);
    }
  }

  console.log(finalImages);

  req.body.user = req.user.id;
  req.body.images = finalImages;
  
  const product = await Product.create(body);
  await deleteCachedData("products:*");
  return product;
};

export const getProducts = async (query) => {
  const cacheKey = `products:${JSON.stringify(query)}`;

  // Check cache
  const cachedData = await getCachedData(cacheKey);

  if (cachedData) {
    console.log(`✅ Cache hit for: ${cacheKey}`);
    return cachedData;
  }

  console.log(`❌ Cache miss for: ${cacheKey}`);
  const resultPerPage = 10;

  const currentPage = Number(query.page) || 1;

  const productsCount = await Product.countDocuments();

  const apiFeatures = new ApiFeatures(Product.find(), query)
    .search()
    .filter()
    .pagination(resultPerPage);

  const products = await apiFeatures.query;

  const result = {
    products,

    filteredCount: products.length,

    productsCount,

    resultPerPage,

    totalPages: Math.ceil(productsCount / resultPerPage),

    currentPage,
  };

  // Store in cache (expires in 5 minutes)
  await cacheData(cacheKey, result, 300);

  return result;
};

export const getProductById = async (id) => {
  // check cache first
  const cacheKey = `product:${id}`;
  const cachedData = await getCachedData(cacheKey);
  if (cachedData) {
    console.log(`✅ Cache hit for: ${cacheKey}`);
    return cachedData;
  }
  console.log(`❌ Cache miss for: ${cacheKey}`);

  const product = await Product.findById(id).populate({
    path: "reviews.user",
    select: "avatar",
  });

  if (!product) throw new ErrorHandler("Product not found", 404);
  // Cache the product
  await cacheData(cacheKey, product, 600);

  return product;
};

export const updateProduct = async (id, req) => {
  const data  = req.body;
  // Prevent updating certain fields
  const restrictedFields = ["createdAt", "user"];
  restrictedFields.forEach((field) => {
    if (data[field]) {
      delete data[field];
    }
  });

  const product = await Product.findById(id);

  if (!product) throw new ErrorHandler("Product not found", 404);

  if (data.stock && data.stock < 0) {
    throw new ErrorHandler("Stock cannot be negative", 400);
  }

  let finalImages = [];

  // 1. Handle NEW Uploaded Files
  if (req.files && req.files.length > 0) {
    const uploadedImages = await Promise.all(
      req.files.map(async (file) => {
        const result = await uploadOnCloudinary(file.path);
        return {
          public_id: result.public_id,
          url: result.secure_url,
        };
      }),
    );
    finalImages.push(...uploadedImages);
  }

  // 2. Handle NEW Direct URLs
  if (data.images && typeof data.images === "string") {
    try {
      const urlArray = JSON.parse(data.images);
      if (Array.isArray(urlArray)) {
        const urlImages = urlArray
          .map((urlString) => {
            if (typeof urlString === "string" && urlString.startsWith("http")) {
              return {
                public_id: `external_url_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                url: urlString,
              };
            }
            return null;
          })
          .filter(Boolean);

        finalImages.push(...urlImages);
      }
    } catch (error) {
      console.error("Failed to parse images JSON string:", error);
    }
  }

  // Only overwrite images if new ones were provided
  if (finalImages.length > 0) {
    data.images = finalImages;
  } else {
    // If no new images provided, don't overwrite the existing ones
    delete data.images;
  }
  const updatedProduct = await Product.findByIdAndUpdate(
    id,

    data,

    {
      returnDocument: "after",

      runValidators: true,
    },
  );

  await deleteCachedData(`product:${id}`);
  await deleteCachedData("products:*");

  return updatedProduct;
};

export const deleteProduct = async (id) => {
  const product = await Product.findById(id);

  if (!product) throw new ErrorHandler("Product not found", 404);

  await product.deleteOne();

  // Clear related cache
  await deleteCachedData(`product:${id}`);
  await deleteCachedData("products:*");
};

export const createReview = async ({ productId, rating, comment, user }) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new ErrorHandler("Product not found", 404);
  }

  const existingReviewIndex = product.reviews.findIndex(
    (r) => r.user.toString() === user._id.toString(),
  );

  if (existingReviewIndex !== -1) {
    const existingReview = product.reviews[existingReviewIndex];
    const timeSinceLastReview =
      Date.now() - new Date(existingReview.createdAt).getTime();
    const hoursSinceLastReview = timeSinceLastReview / (1000 * 60 * 60);

    if (hoursSinceLastReview < 24) {
      throw new ErrorHandler(
        "You cannot review this product again within 24 hours of your previous review.",
        400,
      );
    } else {
      // If 24 hours HAVE passed, append the new review
      const newReview = {
        user: user._id,
        name: user.name,
        rating: Number(rating),
        comment,
      };
      product.reviews.push(newReview);
    }
  } else {
    // If it's their first time reviewing, append the review
    const newReview = {
      user: user._id,
      name: user.name,
      rating: Number(rating),
      comment,
    };
    product.reviews.push(newReview);
  }

  // Recalculate ratings and review count
  const totalRating = product.reviews.reduce(
    (sum, item) => sum + item.rating,
    0,
  );

  product.numOfReviews = product.reviews.length;
  product.rating =
    product.numOfReviews === 0 ? 0 : totalRating / product.numOfReviews;

  // Populate before saving to ensure the returned object has the user avatar
  await product.populate("reviews.user", "avatar");

  await product.save({ validateBeforeSave: false });

  // Clear cache
  await deleteCachedData(`product:${productId}`);
  await deleteCachedData("products:*");

  return product;
};
export const getReviews = async (productId) => {
  const cacheKey = `product:${productId}`;
  const cachedData = await getCachedData(cacheKey);
  if (cachedData) {
    console.log(`✅ Cache hit for: ${cacheKey}`);
    return cachedData.reviews;
  }
  const product = await Product.findById(productId);

  if (!product) {
    throw new ErrorHandler("Product not found", 404);
  }

  await cacheData(cacheKey, product.reviews, 300);

  return product.reviews;
};

export const deleteReview = async ({ productId, reviewId }) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new ErrorHandler("Product not found", 404);
  }

  const reviews = product.reviews.filter(
    (review) => review._id.toString() !== reviewId.toString(),
  );

  if (reviews.length === product.reviews.length) {
    throw new ErrorHandler("Review not found", 404);
  }

  const numOfReviews = reviews.length;

  const rating =
    numOfReviews === 0
      ? 0
      : reviews.reduce((acc, item) => acc + item.rating, 0) / numOfReviews;

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    {
      reviews,
      numOfReviews,
      rating,
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  // Clear related cache
  await deleteCachedData(`product:${productId}`);
  await deleteCachedData(`reviews:${productId}`);
  await deleteCachedData("products:*");

  return updatedProduct;
};
