// src/components/product/ProductPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { amazonClasses } from "../constants/amazonClasses.js";
import AmazonSpinner from "../components/products/AmazonSpinner.jsx";
import ProductPageSkeleton from "../components/products/ProductPageSkeleton.jsx";
import ErrorPage from "../components/common/Error.jsx";

import { toast } from "sonner";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  Minus,
  Plus,
  Check,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";

import { addItemToCart } from "../redux/slices/cartSlice.js";
import {
  getProductById,
  createProductReview,
} from "../redux/slices/productSlice.js";
import { useCallback, useEffect, useState } from "react";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { product, loading, error, reviewLoading, reviewError } = useSelector(
    (state) => state.product,
  );

  const { isAuthenticated } = useSelector((state) => state.user);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [addingToCartId, setAddingToCartId] = useState(null);

  // Review form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (id) {
      const productDetailSection = document.getElementById(
        "product-detail-section",
      );
      if (productDetailSection) {
        productDetailSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
      dispatch(getProductById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    setQuantity(1);
    setSelectedImage(0);
  }, [product]);

  const handleQuantityChange = (type) => {
    if (type === "increase" && quantity < product?.stock) {
      setQuantity((prev) => prev + 1);
    }
    if (type === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = useCallback(async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product) return;

    setAddingToCartId(product._id);

    try {
      const resultAction = await dispatch(
        addItemToCart({ productId: product._id, quantity }),
      ).unwrap();

      toast.success(`${product.name} added to cart`, {
        description: `Quantity: 1`,
        action: {
          label: "View Cart",
          onClick: () => navigate("/cart"),
        },
      });
    } catch (error) {
      toast.error("Failed to add to cart", {
        description: error || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setAddingToCartId(null);
    }
  });


  const handleBuyNow = async () => {
    try {
      await dispatch(
        addItemToCart({ productId: product._id, quantity }),
      ).unwrap();

      toast.success(
        `${quantity} x ${product?.name} added — redirecting to checkout`,
      );
      navigate("/shipping");
    } catch (error) {
      toast.error("Failed to process buy now", {
        description: error || "An unexpected error occurred. Please try again.",
      });
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      toast.success(`${product?.name} added to wishlist`, {
        description: "You can view it in your wishlist",
        action: {
          label: "View Wishlist",
          onClick: () => navigate("/wishlist"),
        },
      });
    } else {
      toast.info(`${product?.name} removed from wishlist`);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product?.name,
      text: product?.description,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } catch (err) {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please enter a review comment");
      return;
    }

    try {
      const result = await dispatch(
        createProductReview({
          rating,
          comment,
          productId: product._id,
        }),
      ).unwrap();
      toast.success("Review submitted successfully!");
      setComment("");
      setRating(5);
      await dispatch(getProductById(product._id));
    } catch (error) {
      toast.error(reviewError || error || "Failed to submit review");
    }
  };

  const reviews = product?.reviews || [];

  const renderStars = (rating, size = "w-4 h-4") => {
    rating = Number(rating) || 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            className={`${size} fill-[#FFA41C] text-[#FFA41C]`}
          />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className={`${size} text-gray-300`} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={`${size} fill-[#FFA41C] text-[#FFA41C]`} />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className={`${size} text-gray-300`} />
        ))}
      </div>
    );
  };

  if (loading) {
    return <ProductPageSkeleton />;
  }

  if (error) {
    return (
      <ErrorPage
        error={error}
        resetError={() => getProductById(id)}
        showHomeButton={true}
        showRetryButton={true}
        showBackButton={true}
      />
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The product you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/")}
            className={`${amazonClasses.btnYellow} px-8 py-2.5`}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const discount = 15;
  const originalPrice = product.price;
  const discountedPrice = originalPrice * (1 - discount / 100);
  const isInStock = product.stock > 0;
  const isLowStock = product.stock <= 10;

  return (
    <>
      {/* <MetaData title={`${product.name} | ShopHub`} /> */}

      {/* Amazon-like Top Bar */}
      <div className="bg-[#232F3E] text-white py-2 px-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-200 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to results</span>
          </button>
        </div>
      </div>

      <div
        id="product-detail-section"
        className="min-h-screen bg-white py-6 px-4"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-5 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[500px] pr-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-14 h-14 rounded overflow-hidden border-2 transition-all ${selectedImage === idx ? "border-[#E77600] ring-1 ring-[#E77600]" : "border-gray-200 hover:border-[#E77600]"}`}
                  >
                    <img
                      src={img.url}
                      alt={`view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            {/* Main Image */}
            <div className="flex-1 rounded-lg overflow-hidden border border-gray-100">
              <img
                src={
                  product.images?.[selectedImage]?.url ||
                  product.images?.[0]?.url
                }
                alt={product.name}
                className="w-full h-auto object-cover aspect-square"
              />
            </div>
          </div>

          {/* Middle Column - Product Info */}
          <div className="lg:col-span-4 space-y-3 border-r-0 lg:border-r lg:pr-8 border-gray-200">
            <div className={amazonClasses.badgeSecondary}>
              {product.category}
            </div>
            <h1 className="text-xl md:text-2xl font-medium text-gray-900 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              {renderStars(product.ratings)}
              <span className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer">
                {product.ratings} ({product.numOfReviews || 0} ratings)
              </span>
            </div>

            <p className="text-sm text-gray-600">
              by{" "}
              <span className="text-[#007185] hover:underline cursor-pointer font-medium">
                {product.seller}
              </span>
            </p>

            <div className="py-2">
              {discount > 0 && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-red-600 font-medium text-lg">
                    -{discount}%
                  </span>
                  <span className="text-3xl font-medium text-gray-900">
                    ₹
                    {discountedPrice.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
              {discount > 0 && (
                <p className="text-sm text-gray-500">
                  M.R.P.:{" "}
                  <span className="line-through">
                    ₹
                    {originalPrice.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Inclusive of all taxes
              </p>
            </div>

            {/* Action Buttons (Mobile View) */}
            <div className="lg:hidden space-y-3 pt-4 pb-6 border-b border-gray-200">
              <button
                onClick={(e) => handleAddToCart(e, product)}
                disabled={!isInStock}
                className={`${amazonClasses.btnYellow} w-full py-2.5 text-base`}
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!isInStock}
                className={`${amazonClasses.btnOrange} w-full py-2.5 text-base`}
              >
                Buy Now
              </button>
            </div>

            <div className="pt-4">
              <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                About this item
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          {/* Right Column - Buy Box */}
          <div className="lg:col-span-3 space-y-4">
            <div className={`${amazonClasses.cardBase} p-4 rounded-lg`}>
              <p className="text-2xl font-medium text-gray-900 mb-2">
                ₹
                {discountedPrice.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>

              <div className="flex items-center gap-2 mb-4">
                {isInStock ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 font-medium text-sm">
                      In Stock
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-red-600 font-medium text-sm">
                      Out of Stock
                    </span>
                  </>
                )}
              </div>

              {isLowStock && isInStock && (
                <p className="text-sm text-red-600 font-medium mb-4">
                  Only {product.stock} left in stock (more on the way).
                </p>
              )}

              {/* Quantity Selector */}
              {isInStock && (
                <div className="flex items-center gap-2 mb-4">
                  <label className="text-sm font-medium text-gray-700">
                    Qty:
                  </label>
                  <div className="flex items-center rounded border border-gray-300 overflow-hidden">
                    <button
                      onClick={() => handleQuantityChange("decrease")}
                      disabled={quantity <= 1}
                      className={amazonClasses.qtyBtn}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className={amazonClasses.qtyDisplay}>{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange("increase")}
                      disabled={quantity >= product.stock}
                      className={amazonClasses.qtyBtn}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Desktop Buttons */}
              <div className="hidden lg:flex flex-col gap-3">
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  disabled={!isInStock}
                  className={`${amazonClasses.btnYellow} w-full py-2.5 text-base`}
                >
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!isInStock}
                  className={`${amazonClasses.btnOrange} w-full py-2.5 text-base`}
                >
                  Buy Now
                </button>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={handleWishlist}
                    className={`${amazonClasses.iconBtn} w-full py-2`}
                  >
                    <Heart
                      className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`}
                    />
                  </button>
                  <button
                    onClick={handleShare}
                    className={`${amazonClasses.iconBtn} w-full py-2`}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Truck className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-gray-900">
                      Free Delivery
                    </span>
                    <p className="text-gray-600 text-xs">
                      Enter your pincode for delivery availability
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <RotateCcw className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-gray-900">
                      7 Days Return Policy
                    </span>
                    <p className="text-gray-600 text-xs">
                      Easy returns and replacement
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-gray-900">
                      1 Year Warranty
                    </span>
                    <p className="text-gray-600 text-xs">
                      Manufacturer warranty included
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-gray-200">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === "description" ? "border-[#FFA41C] text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("specifications")}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === "specifications" ? "border-[#FFA41C] text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === "reviews" ? "border-[#FFA41C] text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              Reviews
            </button>
          </div>

          {activeTab === "description" && (
            <div className={`${amazonClasses.cardBase} p-6 rounded-lg`}>
              <h3 className="text-lg font-bold mb-3">Product Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {activeTab === "specifications" && (
            <div className={`${amazonClasses.cardBase} p-6 rounded-lg`}>
              <h3 className="text-lg font-bold mb-4">
                Technical Specifications
              </h3>
              <div className="space-y-2">
                <div className="flex py-2 border-b border-gray-100">
                  <span className="w-1/3 font-medium text-gray-900">
                    Category
                  </span>
                  <span className="w-2/3 text-gray-600">
                    {product.category}
                  </span>
                </div>
                <div className="flex py-2 border-b border-gray-100">
                  <span className="w-1/3 font-medium text-gray-900">
                    Seller
                  </span>
                  <span className="w-2/3 text-gray-600">{product.seller}</span>
                </div>
                <div className="flex py-2 border-b border-gray-100">
                  <span className="w-1/3 font-medium text-gray-900">Stock</span>
                  <span className="w-2/3 text-gray-600">
                    {product.stock} units
                  </span>
                </div>
                <div className="flex py-2 border-b border-gray-100">
                  <span className="w-1/3 font-medium text-gray-900">
                    Added on
                  </span>
                  <span className="w-2/3 text-gray-600">
                    {new Date(product.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-lg font-bold text-gray-900">
                  Customer Reviews
                </h3>

                {product.reviews && product.reviews.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {reviews.map((review, idx) => (
                      <div
                        key={review._id || idx}
                        className="py-4 first:pt-0 last:pb-0 flex gap-4"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden">
                          {review.user?.avatar?.url ? (
                            <img
                              src={review.user.avatar.url}
                              alt={review.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {(review.name || "A").charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-gray-900">
                              {review.name || "Anonymous"}
                            </h4>
                            {renderStars(review.rating, "w-3.5 h-3.5")}
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed mt-1">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm">
                      No reviews yet. Be the first to review this product!
                    </p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <div className={`${amazonClasses.cardBase} p-5 rounded-lg`}>
                  <h3 className="text-base font-bold text-gray-900 mb-2">
                    Write a Review
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Share your thoughts with other customers.
                  </p>

                  {isAuthenticated ? (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Overall Rating
                        </label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="p-0.5 focus:outline-none transition-colors"
                            >
                              <Star
                                className={`w-6 h-6 ${(hoverRating || rating) >= star ? "fill-[#FFA41C] text-[#FFA41C]" : "text-gray-300"}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label
                          htmlFor="comment"
                          className="text-xs font-bold text-gray-700 uppercase tracking-wider"
                        >
                          Review Comment
                        </label>
                        <textarea
                          id="comment"
                          rows="4"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className={amazonClasses.inputBase}
                          placeholder="What did you like or dislike?"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={reviewLoading}
                        className={`${amazonClasses.btnYellow} w-full justify-center gap-2 py-2.5`}
                      >
                        {reviewLoading && <AmazonSpinner className="h-4 w-4" />}
                        Submit Review
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-xs text-gray-500 mb-4">
                        You must be logged in to post a review.
                      </p>
                      <button
                        className={`${amazonClasses.btnSecondary} w-full py-2`}
                        onClick={() =>
                          navigate("/login", {
                            state: { from: window.location.pathname },
                          })
                        }
                      >
                        Sign In to Review
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default ProductPage;
