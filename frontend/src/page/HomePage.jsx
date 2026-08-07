import { useEffect, useCallback, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

// Redux Imports
import { getAllProducts } from "../redux/slices/productSlice";
import { addItemToCart } from "../redux/slices/cartSlice";

// Components
import ErrorPage from "../components/common/Error";
import Pagination from "../components/common/Pagination";
import PaginationInfo from "../components/PaginationInfo";

// --- Amazon Style Button Classes ---
const amazonAddToCartBtn = `
  w-full h-9 rounded-full text-sm font-medium 
  bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#E7B800] 
  text-[#0F1111] shadow-sm hover:shadow-md transition-all
`;
const amazonOutOfStockBtn = `
  w-full h-9 rounded-full text-sm font-medium 
  bg-gray-200 text-gray-500 cursor-not-allowed
`;

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [addingToCartId, setAddingToCartId] = useState(null);

  const {
    products,
    loading,
    error,
    currentPage,
    totalPages,
    productsCount,
    resultPerPage,
    count,
    isChangingPage,
  } = useSelector((state) => state.product);

  // Get page from URL or default to 1
  const pageFromUrl = parseInt(searchParams.get("page")) || 1;

  useEffect(() => {
    dispatch(getAllProducts({ page: pageFromUrl, limit: 10 }));
  }, [pageFromUrl, dispatch]);

  const handlePageChange = useCallback(
    (page) => {
      setSearchParams({ page: page.toString() });
      const productsSection = document.getElementById("products-section");
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [setSearchParams],
  );

  const handleAddToCart = useCallback(
    async (e, product) => {
      e.preventDefault(); // Prevent Link navigation
      e.stopPropagation();

      setAddingToCartId(product._id);

      try {
        const resultAction = await dispatch(
          addItemToCart({ productId: product._id, quantity: 1 }),
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
          description:
            error || "An unexpected error occurred. Please try again.",
        });
      } finally {
        setAddingToCartId(null);
      }
    },
    [navigate, dispatch],
  );

  const productsArray = Array.isArray(products) ? products : [];

  if (error) {
    // Dispatching the thunk again will automatically reset the error state in Redux
    return (
      <ErrorPage
        error={error}
        resetError={() => dispatch(getAllProducts({ page: 1, limit: 10 }))}
      />
    );
  }

  // Show skeleton only on initial load (not on page change)
  const showInitialLoading =
    loading && !isChangingPage && productsArray.length === 0;
  const showPageChangeLoading = loading && isChangingPage;

  return (
    <div className="max-w-[1500px] mx-auto px-4 py-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#232F3E] to-[#37475A] text-white rounded-lg p-8 md:p-12 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Welcome to ShopHub
        </h1>
        <p className="text-sm md:text-lg mb-5 text-gray-300">
          Discover amazing products at unbeatable prices.
        </p>
        <button
          className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-semibold px-6 py-2 rounded-full text-sm transition-colors"
          onClick={() => {
            document
              .getElementById("products-section")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Shop Now
        </button>
      </div>

      {/* Products Section */}
      <div id="products-section">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            Featured Products
          </h2>
          {!loading && productsCount > 0 && (
            <PaginationInfo
              currentPage={currentPage}
              resultPerPage={resultPerPage}
              productsCount={productsCount}
              count={count}
            />
          )}
        </div>

        {/* Page Change Loading Overlay */}
        {showPageChangeLoading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="bg-white rounded-lg p-4 flex items-center gap-3 shadow-xl">
              <Loader2 className="h-5 w-5 animate-spin text-[#FF9900]" />
              <span className="text-sm font-medium text-gray-800">
                Loading products...
              </span>
            </div>
          </div>
        )}

        {/* Initial Loading or Products Grid */}
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {productsArray.map((product) => (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow group border border-transparent hover:border-gray-200 overflow-hidden flex flex-col"
              >
                <div className="relative overflow-hidden p-4 bg-gray-50">
                  {product.images?.[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-44 object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-sm text-gray-400 rounded">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-3 mt-auto border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-[#C7511F] transition-colors min-h-[2.5rem]">
                    {product.name}
                  </h3>

                  <div className="mt-2 mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      Rs. {product.price?.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {product.stock > 0 ? (
                    <button
                      className={amazonAddToCartBtn}
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={addingToCartId === product._id}
                    >
                      {addingToCartId === product._id ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Adding...
                        </span>
                      ) : (
                        "Add to Cart"
                      )}
                    </button>
                  ) : (
                    <button className={amazonOutOfStockBtn} disabled>
                      Out of Stock
                    </button>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              showFirstLast={true}
              maxButtons={5}
            />
          )}
        </>
      </div>
    </div>
  );
}
