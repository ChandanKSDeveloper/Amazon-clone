import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AdminSidebar from "../../components/AdminSidebar";
import { toast } from "sonner";
import { ArrowLeft, Save, Image as ImageIcon, Plus, X } from "lucide-react";

import { amazonClasses, amazonInput, amazonSelect, amazonPrimaryBtn } from "../../constants/amazonClasses";
import AmazonSpinner from "../../components/products/AmazonSpinner";
import { getProductById, createProduct, updateProduct, setProduct } from "../../redux/slices/productSlice";

const CATEGORIES = [
  "Electronics", "Mobile Phones", "Computers & Tablets", "Cameras", "Audio & Headphones",
  "Wearable Technology", "Video Games & Consoles", "Clothing", "Men's Fashion", "Women's Fashion",
  "Kids' Fashion", "Footwear", "Accessories", "Jewelry", "Home & Kitchen", "Furniture",
  "Home Decor", "Garden & Outdoor", "Tools & Hardware", "Beauty & Personal Care", "Skincare",
  "Makeup", "Hair Care", "Fragrance", "Health & Wellness", "Sports & Fitness", "Exercise Equipment",
  "Outdoor Recreation", "Camping & Hiking", "Cycling", "Books", "Movies & TV", "Music",
  "Stationery & Office Supplies", "Toys & Games", "Baby Products", "Educational Toys", "Automotive",
  "Pet Supplies", "Groceries & Food", "Arts & Crafts", "Industrial Supplies", "Business & Industrial", "Other"
];

const textAreaClasses = `
  flex min-h-[120px] w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-[#0F1111]
  placeholder:text-gray-500 focus:outline-none focus:border-[#E77600] focus:ring-1 focus:ring-[#E77600] 
  focus:shadow-[0_0_0_3px_rgba(228,168,49,0.3)] transition-all resize-none
`;

export default function UpdateProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditMode = Boolean(id);

  // Read product state AND user state from Redux
  const { product, loading } = useSelector((state) => state.product);
  const { user: currentUser } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "Electronics",
    stock: "1",
    seller: "",
    imageUrls: [""] // Start with one empty URL field
  });

  const [fetchingProduct, setFetchingProduct] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      async function loadProduct() {
        setFetchingProduct(true);
        try {
          const data = await dispatch(getProductById(id)).unwrap();
          if (data && data.product) {
            const prod = data.product;
            // Map existing images to our array of strings
            const existingUrls = prod.image?.map(img => img.url) || [];
            setFormData({
              name: prod.name || "",
              price: prod.price?.toString() || "",
              description: prod.description || "",
              category: prod.category || "Electronics",
              stock: prod.stock?.toString() || "0",
              seller: prod.seller || "",
              imageUrls: existingUrls.length > 0 ? existingUrls.slice(0, 4) : [""]
            });
          }
        } catch (err) {
          toast.error("Failed to retrieve product details.");
          navigate("/admin/products");
        } finally {
          setFetchingProduct(false);
        }
      }
      loadProduct();
    } else {
      dispatch(setProduct(null));
      setFormData({
        name: "", price: "", description: "", category: "Electronics",
        stock: "1", seller: "", imageUrls: [""]
      });
    }
  }, [id, isEditMode, dispatch, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle adding/removing image URL fields
  const handleImageChange = (index, value) => {
    const newImageUrls = [...formData.imageUrls];
    newImageUrls[index] = value;
    setFormData((prev) => ({ ...prev, imageUrls: newImageUrls }));
  };

  const addImageField = () => {
    if (formData.imageUrls.length < 4) {
      setFormData((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ""] }));
    }
  };

  const removeImageField = (index) => {
    const newImageUrls = formData.imageUrls.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, imageUrls: newImageUrls.length > 0 ? newImageUrls : [""] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, price, description, category, stock, seller, imageUrls } = formData;

    if (!name.trim() || !price || !description.trim() || !seller.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Filter out empty URLs and format them for the backend
    const validImages = imageUrls.filter(url => url.trim() !== "");
    if (validImages.length === 0) {
      toast.error("Please provide at least one valid image URL.");
      return;
    }

    const payload = {
      name,
      price: Number(price),
      description,
      category,
      stock: Number(stock),
      seller,
      images: validImages.map((url, idx) => ({
        public_id: isEditMode && product?.image?.[idx]?.public_id 
          ? product.image[idx].public_id 
          : `prod_${Date.now()}_${idx}`,
        url: url.trim()
      }))
    };

   
    try {
      if (isEditMode) {
        await dispatch(updateProduct({ id, payload })).unwrap();
        toast.success("Product updated successfully!");
      } else {
        await dispatch(createProduct(payload)).unwrap();
        toast.success("Product created successfully!");
      }
      navigate("/admin/products");
    } catch (err) {
      toast.error(err || "An error occurred while saving the product.");
    }
  };

  return (
    <>
      <div className="flex min-h-screen bg-[#EAEDED]">
        <AdminSidebar />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* Back button */}
          <div className="mb-6">
            <Link 
              to="/admin/products" 
              className="inline-flex items-center gap-2 text-sm text-[#007185] hover:text-[#C7511F] hover:underline transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Products</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8 border-b border-gray-300 pb-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#131921]">
              {isEditMode ? "Modify Product details" : "Add New Catalog Item"}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {isEditMode 
                ? "Update pricing, description, stock status, or cover images."
                : "Fill out the fields to publish a new product to the shopping platform."
              }
            </p>
          </div>

          {fetchingProduct ? (
            <div className="min-h-[40vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <AmazonSpinner className="h-10 w-10 text-[#FF9900]" />
                <p className="text-sm text-gray-600">Fetching item configuration...</p>
              </div>
            </div>
          ) : (
            <div className={`max-w-3xl ${amazonClasses.cardBase} p-6 md:p-8`}>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Product Name */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Product Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Wireless Noise Cancelling Headphones"
                    required
                    className={amazonInput}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price */}
                  <div className="space-y-1.5">
                    <label htmlFor="price" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Price (Rs.) *
                    </label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="e.g. 4999"
                      required
                      className={amazonInput}
                    />
                  </div>

                  {/* Stock */}
                  <div className="space-y-1.5">
                    <label htmlFor="stock" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Initial Stock *
                    </label>
                    <input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="e.g. 50"
                      required
                      className={amazonInput}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Dropdown */}
                  <div className="space-y-1.5">
                    <label htmlFor="category" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Product Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={amazonSelect}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Seller */}
                  <div className="space-y-1.5">
                    <label htmlFor="seller" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Seller / Brand *
                    </label>
                    <input
                      id="seller"
                      name="seller"
                      type="text"
                      value={formData.seller}
                      onChange={handleChange}
                      placeholder="e.g. Sony Audio Systems"
                      required
                      className={amazonInput}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label htmlFor="description" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Product Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="5"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter detailed description of features, specifications, box contents, etc."
                    required
                    className={textAreaClasses}
                  />
                </div>

                {/* Dynamic Image URLs */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Image Links / URLs * (Max 4)
                  </label>
                  
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        placeholder={`Image URL ${index + 1}`}
                        className={amazonInput}
                      />
                      
                      {/* Remove Button (only show if more than 1 field exists) */}
                      {formData.imageUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition border border-gray-300"
                          title="Remove Image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add More Button */}
                  {formData.imageUrls.length < 4 && (
                    <button
                      type="button"
                      onClick={addImageField}
                      className="inline-flex items-center gap-1.5 text-sm text-[#007185] hover:text-[#C7511F] hover:underline font-medium pt-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add another image
                    </button>
                  )}
                </div>

                {/* Image Previews */}
                {formData.imageUrls.some(url => url.trim() !== "") && (
                  <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-3">
                      <ImageIcon className="h-4 w-4" /> Live Image Previews
                    </span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.imageUrls.filter(url => url.trim() !== "").map((url, index) => (
                        <img 
                          key={index} 
                          src={url} 
                          alt={`Preview ${index + 1}`} 
                          className="h-24 w-full object-contain rounded-md shadow-sm bg-white p-1"
                          onError={(e) => {
                            e.target.style.opacity = '0.2';
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-4 border-t border-gray-200 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className={`${amazonPrimaryBtn} w-auto px-6 py-2.5 flex items-center justify-center gap-2`}
                  >
                    {loading ? (
                      <AmazonSpinner />
                    ) : (
                      <Save className="h-5 w-5" />
                    )}
                    <span>{isEditMode ? "Update Product" : "Publish Product"}</span>
                  </button>
                </div>

              </form>
            </div>
          )}
        </main>
      </div>
    </>
  );
}