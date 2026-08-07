import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Search as SearchIcon,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Loader2,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";

import { amazonInput } from "../constants/amazonClasses.js";

import { getAllProducts } from "../redux/slices/productSlice";

import ErrorPage from "../components/common/Error";
import Pagination from "../components/common/Pagination";
import PaginationInfo from "../components/PaginationInfo";

const categories = [
  "Electronics",
  "Mobile Phones",
  "Computers & Tablets",
  "Cameras",
  "Audio & Headphones",
  "Wearable Technology",
  "Video Games & Consoles",
  "Clothing",
  "Men's Fashion",
  "Women's Fashion",
  "Kids' Fashion",
  "Footwear",
  "Accessories",
  "Jewelry",
  "Home & Kitchen",
  "Furniture",
  "Home Decor",
  "Garden & Outdoor",
  "Tools & Hardware",
  "Beauty & Personal Care",
  "Skincare",
  "Makeup",
  "Hair Care",
  "Fragrance",
  "Health & Wellness",
  "Sports & Fitness",
  "Exercise Equipment",
  "Outdoor Recreation",
  "Camping & Hiking",
  "Cycling",
  "Books",
  "Movies & TV",
  "Music",
  "Stationery & Office Supplies",
  "Toys & Games",
  "Baby Products",
  "Educational Toys",
  "Automotive",
  "Pet Supplies",
  "Groceries & Food",
  "Arts & Crafts",
  "Industrial Supplies",
  "Business & Industrial",
  "Other",
];

const FilterSidebar = ({
  isCategoryOpen,
  setIsCategoryOpen,
  categories,
  appliedFilters,
  handleFilterChange,
  priceInput,
  setPriceInput,
  applyPriceFilter,
  clearFilters,
  hasActiveFilters}
) => (
  <div className="bg-white border border-gray-200 rounded-sm p-4">
    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
      <h3 className="font-bold text-[#0F1111]">Filters</h3>
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="text-xs text-[#007185] hover:text-[#C7511F] hover:underline"
        >
          Clear all
        </button>
      )}
    </div>

    {/* CATEGORY SECTION (Amazon Collapsible Style) */}
    <div className="border-b border-gray-200 py-3">
      <button
        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
        className="flex justify-between items-center w-full text-sm font-bold text-[#0F1111]"
      >
        Category
        {isCategoryOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {isCategoryOpen && (
        <ul className="mt-2 space-y-1 max-h-60 overflow-y-auto pl-1">
          <li>
            <button
              onClick={() => handleFilterChange("category", "")}
              className={`text-sm ${!appliedFilters.category ? "font-bold text-[#C7511F]" : "text-[#0F1111]"} hover:text-[#C7511F]`}
            >
              All Categories
            </button>
          </li>
          {categories.map((c) => (
            <li key={c}>
              <button
                onClick={() => handleFilterChange("category", c)}
                className={`text-sm ${appliedFilters.category === c ? "font-bold text-[#C7511F]" : "text-[#0F1111]"} hover:text-[#C7511F]`}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>

    {/* PRICE SECTION */}
    <div className="py-3">
      <h4 className="text-sm font-bold text-[#0F1111] mb-2">Price</h4>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Min"
          value={priceInput.min}
          onChange={(e) =>
            setPriceInput((prev) => ({ ...prev, min: e.target.value }))
          }
          className={`${amazonInput} w-full h-8 text-xs ocus:outline-none focus:ring-1 focus:ring-[#FF9900] focus:border-[#FF9900]`}
        />
        <span className="text-gray-400">-</span>
        <input
          type="number"
          placeholder="Max"
          value={priceInput.max}
          onChange={(e) =>
            setPriceInput((prev) => ({ ...prev, max: e.target.value }))
          }
          className={`${amazonInput} w-full h-8 text-xs ocus:outline-none focus:ring-1 focus:ring-[#FF9900] focus:border-[#FF9900]`}
        />
      </div>
      <button
        onClick={applyPriceFilter}
        className="w-full mt-2 h-8 bg-[#E3E6E6] hover:bg-[#D5D9D9] rounded-sm text-xs font-medium text-[#0F1111] transition-colors"
      >
        Go
      </button>
    </div>
  </div>
);

const SearchPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get("q") || "";

  const page = parseInt(searchParams.get("page")) || 1;

  const {
    products,
    loading,
    error,
    currentPage,
    totalPages,
    productsCount,
    resultPerPage,
  } = useSelector((state) => state.product);

  const [searchTerm, setSearchTerm] = useState(query);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isRatingOpen, setIsRatingOpen] = useState(true);

  const [appliedFilters, setAppliedFilters] = useState({
    category: "",
    price: { gte: "", lte: "" },
  });
  const [priceInput, setPriceInput] = useState({ min: "", max: "" });

  useEffect(() => {
    if (!query) return;

    const params = {
      keyword: query,
      page,
      limit: 16, // Search pages usually show more items per page
    };

    if (appliedFilters.category) params.category = appliedFilters.category;
    if (appliedFilters.price.gte)
      params["price[gte]"] = appliedFilters.price.gte;
    if (appliedFilters.price.lte)
      params["price[lte]"] = appliedFilters.price.lte;

    dispatch(getAllProducts(params));
  }, [query, page, appliedFilters, dispatch]);

  const handleFilterChange = (key, value) => {
    setAppliedFilters((prev) => ({ ...prev, [key]: value }));
    setSearchParams({ q: query, page: "1" });
  };

  const applyPriceFilter = () => {
    if (!priceInput.min && !priceInput.max) {
      toast.error("Enter min or max price");
      return;
    }
    setAppliedFilters((prev) => ({
      ...prev,
      price: { gte: priceInput.min, lte: priceInput.max },
    }));
    setSearchParams({ q: query, page: "1" });
  };

  const clearFilters = () => {
    setAppliedFilters({
      category: "",
      price: { gte: "", lte: "" },
      rating: "",
    });
    setPriceInput({ min: "", max: "" });
  };

  const hasActiveFilters =
    appliedFilters.category ||
    appliedFilters.price.gte ||
    appliedFilters.price.lte;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      toast.error("Enter search term");
      return;
    }
    navigate(`/search?q=${encodeURIComponent(searchTerm)}&page=1`);
  };

  const handlePageChange = (p) => {
    setSearchParams({ q: query, page: p.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const productsArray = Array.isArray(products) ? products : [];

  if (error) return <ErrorPage error={{ message: error }} />;
  const startResult =
    productsCount === 0 ? 0 : (currentPage - 1) * resultPerPage + 1;
  const endResult = Math.min(currentPage * resultPerPage, productsCount);

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="max-w-[1500px] mx-auto px-4 py-6">
          {/* TOP SEARCH BAR (Amazon Style) */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-3xl">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className={`${amazonInput} flex-1 rounded-l-md rounded-r-none border-r-0`}
            />
            <button
              type="submit"
              className="h-10 px-4 rounded-r-md border border-l-0 border-gray-300 bg-[#FEBD69] hover:bg-[#F3A847] text-[#0F1111]"
            >
              <SearchIcon className="h-5 w-5" />
            </button>
          </form>

          {/* MOBILE FILTER BUTTON */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setShowMobileFilters((prev) => !prev)}
              className="h-10 px-4 border border-gray-300 rounded-sm bg-[#E3E6E6] hover:bg-[#D5D9D9] text-sm font-medium text-[#0F1111] inline-flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
          </div>

          <div className="flex gap-6 relative">
            {/* DESKTOP SIDEBAR */}
            <div className={`${
                showMobileFilters ? "block" : "hidden"
              } lg:block absolute z-20 top-0 left-0 h-full bg-white shadow-lg lg:shadow-none lg:relative w-56 shrink-0 p-4 lg:p-0`}
            >

                {/* Close button for mobile */}
            <div className="flex justify-end lg:hidden mb-2">
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="h-5 w-5 text-gray-500 hover:text-[#0F1111]" />
                </button>
              </div>

              <FilterSidebar
                isCategoryOpen={isCategoryOpen}
                setIsCategoryOpen={setIsCategoryOpen}
                categories={categories}
                appliedFilters={appliedFilters}
                handleFilterChange={handleFilterChange}
                priceInput={priceInput}
                setPriceInput={setPriceInput}
                applyPriceFilter={applyPriceFilter}
                clearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 min-w-0">
              {/* RESULTS HEADER */}
              {!loading && productsCount > 0 && (
                <div className="mb-6 text-sm text-gray-600">
                  <span className="font-bold text-[#0F1111]">
                    {startResult}-{endResult}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-[#0F1111]">
                    {productsCount}
                  </span>{" "}
                  results for "
                  <span className="font-bold text-[#0F1111]">{query}</span>"
                </div>
              )}

              {loading ? (
                /* CLEAN LOADING STATE */
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <Loader2 className="h-10 w-10 animate-spin text-[#FF9900] mb-4" />
                  <p className="text-sm">Fetching results...</p>
                </div>
              ) : productsArray.length === 0 ? (
                <div className="text-center py-20 border border-gray-200 rounded-sm bg-gray-50">
                  <p className="text-gray-800 text-lg font-medium mb-2">
                    No results found
                  </p>
                  <p className="text-gray-500 text-sm">
                    Try checking your spelling or use more general terms.
                  </p>
                </div>
              ) : (
                <>
                  {/* PRODUCT GRID */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {productsArray.map((p) => (
                      <Link
                        key={p._id}
                        to={`/product/${p._id}`}
                        className="border border-transparent hover:border-gray-200 rounded-sm overflow-hidden group flex flex-col"
                      >
                        <div className="bg-gray-50 p-4 h-48 flex items-center justify-center overflow-hidden">
                          <img
                            src={p.images?.[0]?.url}
                            alt={p.name}
                            className="max-h-full w-auto object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <div className="p-3 mt-auto">
                          <h3 className="text-sm text-[#0F1111] line-clamp-2 group-hover:text-[#C7511F] transition-colors leading-tight min-h-[2.5rem]">
                            {p.name}
                          </h3>
                          <p className="text-base font-bold text-[#0F1111] mt-1">
                            ₹{p.price?.toLocaleString("en-IN")}
                          </p>
                          {p.rating > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-[#DE7921] text-sm">
                                {"★".repeat(Math.floor(p.rating))}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({p.numOfReviews || 0})
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* PAGINATION */}
                  {totalPages > 1 && (
                    <div className="mt-10 pb-8">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        showFirstLast={true}
                        maxButtons={Math.min(5, totalPages)}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchPage;
