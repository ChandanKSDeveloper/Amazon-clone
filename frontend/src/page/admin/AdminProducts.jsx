import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AdminSidebar from "../../components/AdminSidebar.jsx";
import Pagination from "../../components/common/Pagination.jsx"; // Adjust path if needed
import { toast } from "sonner";
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import {
  getAllProducts,
  deleteProduct,
} from "../../redux/slices/productSlice.js";

const amazonClasses = {
  btnYellow:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-[#FFD814] px-4 py-2 text-sm font-medium text-black shadow-sm transition-all hover:bg-[#F7CA00] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#F7CA00] disabled:cursor-not-allowed disabled:bg-gray-300",
  btnSecondary:
    "inline-flex items-center justify-center rounded-lg bg-white p-2 border border-gray-300 text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400",
  cardBase: "bg-white rounded-lg border border-gray-200 shadow-sm",
};

import AmazonSpinner from "../../components/products/AmazonSpinner.jsx";

export default function AdminProducts() {
  const dispatch = useDispatch();
  
  // 1. Initialize useSearchParams to read ?page=X from the URL
  const [searchParams, setSearchParams] = useSearchParams();
  const urlPage = parseInt(searchParams.get("page")) || 1;

  // 2. Pull pagination data from Redux
  const { 
    products, 
    loading, 
    error, 
    currentPage, 
    totalPages, 
    productsCount, 
    resultPerPage 
  } = useSelector((state) => state.product);

  // 3. Fetch products whenever the urlPage changes
  useEffect(() => {
    dispatch(getAllProducts({ page: urlPage, limit: 10 }));
  }, [dispatch, urlPage]);

  const handlePageChange = (page) => {
    setSearchParams({ page: page });
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      try {
        await dispatch(deleteProduct(id)).unwrap();
        toast.success(`Product "${name}" deleted successfully.`);
      } catch (err) {
        toast.error(err || "Failed to delete product.");
      }
    }
  };

  return (
    <>
      <div className="flex min-h-screen bg-[#EAEDED]">
        <AdminSidebar />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* Page Title & Add Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-gray-300 pb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#131921]">
                Manage Products
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                View, modify, or delete items from the store catalog.
              </p>
            </div>

            <Link to="/admin/product/new">
              <button
                className={`${amazonClasses.btnYellow} px-5 py-2.5 text-base`}
              >
                <Plus className="h-5 w-5" />
                <span>Create Product</span>
              </button>
            </Link>
          </div>

          {loading ? (
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <AmazonSpinner />
                <p className="text-sm text-gray-600">
                  Retrieving catalog items...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex gap-4 text-red-700">
              <AlertTriangle className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg">
                  Error Loading Products
                </h3>
                <p className="text-sm opacity-90 mt-1">{error}</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className={`${amazonClasses.cardBase} p-12 text-center`}>
              <p className="text-gray-600">
                No products found in the database. Click "Create Product" to add
                your first item.
              </p>
            </div>
          ) : (
            <div className={`${amazonClasses.cardBase} overflow-hidden`}>
              
              {/* Optional: Pagination Info Top */}
              {productsCount > 0 && (
                <div className="px-6 pt-4 text-sm text-gray-600">
                  Showing {(currentPage - 1) * resultPerPage + 1} to{" "}
                  {Math.min(currentPage * resultPerPage, productsCount)} of{" "}
                  {productsCount} products
                </div>
              )}

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider font-semibold">
                      <th className="py-4 px-6">Product Details</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Stock Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((product) => (
                      <tr
                        key={product._id}
                        className="text-gray-700 hover:bg-gray-50 transition"
                      >
                        {/* Title & Image */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-md bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200">
                              {product.images?.[0]?.url ? (
                                <img
                                  src={product.images[0].url}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-[10px] text-gray-400">
                                  No Image
                                </span>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-[#131921] line-clamp-1">
                                {product.name}
                              </h4>
                              <p className="text-xs text-gray-400 font-mono mt-0.5">
                                {product._id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-6">
                          <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-md text-gray-700 font-medium">
                            {product.category || "Uncategorized"}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-6 font-semibold text-[#131921]">
                          ₹{product.price?.toLocaleString("en-IN")}
                        </td>

                        {/* Stock */}
                        <td className="py-4 px-6">
                          {product.stock <= 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                              Out of Stock
                            </span>
                          ) : product.stock <= 5 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Low Stock ({product.stock})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                              In Stock ({product.stock})
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <Link to={`/admin/product/${product._id}`}>
                              <button
                                className={`${amazonClasses.btnSecondary} h-9 w-9 hover:bg-[#F0F8FF] hover:border-[#007185] hover:text-[#007185]`}
                                title="Edit Product"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </Link>

                            <button
                              onClick={() =>
                                handleDelete(product._id, product.name)
                              }
                              className={`${amazonClasses.btnSecondary} h-9 w-9 hover:bg-red-50 hover:border-red-300 hover:text-red-600`}
                              title="Delete Product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 4. Pagination Bottom */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}