import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AdminSidebar from "../../components/AdminSidebar";
import { toast } from "sonner";
import { ArrowLeft, Save, Image as ImageIcon, Plus, X, Upload } from "lucide-react";

import {
  amazonClasses,
  amazonInput,
  amazonSelect,
  amazonPrimaryBtn,
} from "../../constants/amazonClasses";

import {
  getProductById,
  createProduct,
  updateProduct,
  setProduct,
} from "../../redux/slices/productSlice";
import AmazonSpinner from "../../components/products/AmazonSpinner";

const CATEGORIES = [
  "Electronics", "Mobile Phones", "Computers & Tablets", "Cameras", "Audio & Headphones",
  "Wearable Technology", "Video Games & Consoles", "Clothing", "Men's Fashion", "Women's Fashion",
  "Kids' Fashion", "Footwear", "Accessories", "Jewelry", "Home & Kitchen", "Furniture",
  "Home Decor", "Garden & Outdoor", "Tools & Hardware", "Beauty & Personal Care", "Skincare",
  "Makeup", "Hair Care", "Fragrance", "Health & Wellness", "Sports & Fitness", "Exercise Equipment",
  "Outdoor Recreation", "Camping & Hiking", "Cycling", "Books", "Movies & TV", "Music",
  "Stationery & Office Supplies", "Toys & Games", "Baby Products", "Educational Toys",
  "Automotive", "Pet Supplies", "Groceries & Food", "Arts & Crafts", "Industrial Supplies",
  "Business & Industrial", "Other",
];

const textAreaClasses = `
  flex min-h-[120px] w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-[#0F1111]
  placeholder:text-gray-500 focus:outline-none focus:border-[#E77600] focus:ring-1 focus:ring-[#E77600] 
  focus:shadow-[0_0_0_3px_rgba(228,168,49,0.3)] transition-all resize-none
`;

export default function NewProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditMode = Boolean(id);

  const { product, loading } = useSelector((state) => state.product);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "Electronics",
    stock: "1",
    seller: "",
    imageUrls: [""],
  });
  
  // State for actual file uploads
  const [imageFiles, setImageFiles] = useState([]);
  const [fetchingProduct, setFetchingProduct] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      async function loadProduct() {
        setFetchingProduct(true);
        try {
          const data = await dispatch(getProductById(id)).unwrap();
          if (data && data.product) {
            const prod = data.product;
            const existingUrls = prod.images?.map((img) => img.url) || [];
            setFormData({
              name: prod.name || "",
              price: prod.price?.toString() || "",
              description: prod.description || "",
              category: prod.category || "Electronics",
              stock: prod.stock?.toString() || "0",
              seller: prod.seller || "",
              imageUrls: existingUrls.length > 0 ? existingUrls.slice(0, 4) : [""],
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
        name: "", price: "", description: "", category: "Electronics", stock: "1", seller: "", imageUrls: [""],
      });
      setImageFiles([]);
    }
  }, [id, isEditMode, dispatch, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Limit total images (urls + files) to 4
    const availableSlots = 4 - imageFiles.length;
    setImageFiles((prev) => [...prev, ...files.slice(0, availableSlots)]);
    e.target.value = "";
  };

  const removeFile = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, price, description, category, stock, seller, imageUrls } = formData;

    if (!name.trim() || !price || !description.trim() || !seller.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const validUrls = imageUrls.filter((url) => url.trim() !== "");
    
    // Check if user provided either files or URLs
    if (validUrls.length === 0 && imageFiles.length === 0) {
      toast.error("Please provide at least one image (URL or File).");
      return;
    }

    // Build FormData for multipart upload (files + text)
    const payload = new FormData();
    payload.append("name", name);
    payload.append("price", Number(price));
    payload.append("description", description);
    payload.append("category", category);
    payload.append("stock", Number(stock));
    payload.append("seller", seller);
    
    // Append files
    imageFiles.forEach((file) => {
      payload.append("images", file); // Backend will look for req.files
    });

    // Append valid URLs as a JSON string so backend can parse it
    if (validUrls.length > 0) {
      payload.append("imageUrls", JSON.stringify(validUrls)); 
    }

    try {
      if (isEditMode) {
        await dispatch(updateProduct({ id, payload })).unwrap();
        toast.success("Product updated successfully!");
      } else {
        console.log(payload instanceof FormData);

for (const [key, value] of payload.entries()) {
    console.log(key, value);
}
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
          <div className="mb-6">
            <Link to="/admin/products" className="inline-flex items-center gap-2 text-sm text-[#007185] hover:text-[#C7511F] hover:underline transition">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Products</span>
            </Link>
          </div>

          <div className="mb-8 border-b border-gray-300 pb-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#131921]">
              {isEditMode ? "Modify Product details" : "Add New Catalog Item"}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {isEditMode ? "Update pricing, description, stock status, or cover images." : "Fill out the fields to publish a new product to the shopping platform."}
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
                
                {/* Form Fields (Name, Price, Stock, etc.) */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Product Name *</label>
                  <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required className={amazonInput} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label htmlFor="price" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Price (Rs.) *</label>
                    <input id="price" name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleChange} required className={amazonInput} />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="stock" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Initial Stock *</label>
                    <input id="stock" name="stock" type="number" min="0" value={formData.stock} onChange={handleChange} required className={amazonInput} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label htmlFor="category" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Product Category *</label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} className={amazonSelect}>
                      {CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="seller" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Seller / Brand *</label>
                    <input id="seller" name="seller" type="text" value={formData.seller} onChange={handleChange} required className={amazonInput} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="description" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Product Description *</label>
                  <textarea id="description" name="description" rows="5" value={formData.description} onChange={handleChange} required className={textAreaClasses} />
                </div>

                {/* File Upload Button */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Upload Images from Device (Max 4)</label>
                  <div className="flex items-center gap-4">
                    <label className={`${amazonPrimaryBtn} w-auto px-4 py-2 flex items-center gap-2 cursor-pointer`}>
                      <Upload className="h-4 w-4" />
                      <span>Choose Files</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                    </label>
                    {imageFiles.length > 0 && (
                      <span className="text-sm text-gray-600">{imageFiles.length} file(s) selected</span>
                    )}
                  </div>
                  
                  {/* Preview Uploaded Files */}
                  {imageFiles.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-2">
                      {imageFiles.map((file, idx) => (
                        <div key={idx} className="relative">
                          <img src={URL.createObjectURL(file)} alt={`File ${idx}`} className="h-20 w-20 object-cover rounded-md border" />
                          <button type="button" onClick={() => removeFile(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* OR Divider */}
                <div className="flex items-center gap-4">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-xs text-gray-400 uppercase">OR</span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                {/* Dynamic Image URLs */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Add Image Links / URLs * (Max 4)</label>

                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input type="url" value={url} onChange={(e) => handleImageChange(index, e.target.value)} placeholder={`Image URL ${index + 1}`} className={amazonInput} />
                      {formData.imageUrls.length > 1 && (
                        <button type="button" onClick={() => removeImageField(index)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition border border-gray-300" title="Remove Image">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  {formData.imageUrls.length < 4 && (
                    <button type="button" onClick={addImageField} className="inline-flex items-center gap-1.5 text-sm text-[#007185] hover:text-[#C7511F] hover:underline font-medium pt-1">
                      <Plus className="h-4 w-4" /> Add another URL
                    </button>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-gray-200 flex justify-end">
                  <button type="submit" disabled={loading} className={`${amazonPrimaryBtn} w-auto px-6 py-2.5 flex items-center justify-center gap-2`}>
                    {loading ? <AmazonSpinner /> : <Save className="h-5 w-5" />}
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