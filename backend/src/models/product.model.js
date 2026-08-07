import { Schema, model } from "mongoose";

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please enter product name"],
        trim: true,
        lowercase: true,
        maxlength: [100, "Name cannot exceed 100 characters"],
        minlength: [1, "Name must be at least 1 characters"],
    },
    description: {
        type: String,
        required: [true, "Please enter product description"]
    },
    price: {
        type: Number,
        required: [true, "Please enter product price"],
        default: 0.0,
    },
    stock: {
        type: Number,
        required: [true, "Please enter product stock"],
        default: 0,
    },
    ratings: {
        type: Number,
        default: 0,
    },
    images: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
        }
    ],
    category: {
        type: String,
        required: [true, "Please select category for this product"],
        enum: [
            // Electronics & Tech
            "Electronics",
            "Mobile Phones",
            "Computers & Tablets",
            "Cameras",
            "Audio & Headphones",
            "Wearable Technology",
            "Video Games & Consoles",

            // Fashion & Apparel
            "Clothing",
            "Men's Fashion",
            "Women's Fashion",
            "Kids' Fashion",
            "Footwear",
            "Accessories",
            "Jewelry",

            // Home & Living
            "Home & Kitchen",
            "Furniture",
            "Home Decor",
            "Garden & Outdoor",
            "Tools & Hardware",

            // Beauty & Health
            "Beauty & Personal Care",
            "Skincare",
            "Makeup",
            "Hair Care",
            "Fragrance",
            "Health & Wellness",

            // Sports & Recreation
            "Sports & Fitness",
            "Exercise Equipment",
            "Outdoor Recreation",
            "Camping & Hiking",
            "Cycling",

            // Media & Entertainment
            "Books",
            "Movies & TV",
            "Music",
            "Stationery & Office Supplies",

            // Kids & Toys
            "Toys & Games",
            "Baby Products",
            "Educational Toys",

            // Specialized
            "Automotive",
            "Pet Supplies",
            "Groceries & Food",
            "Arts & Crafts",

            // Industrial & Business
            "Industrial Supplies",
            "Business & Industrial",

            // Fallback (use sparingly)
            "Other"
        ],
        // Optional: Add index for faster queries
        message: "Please select category for this product",
        index: true
    },
    seller: {
        type: String,
        required: [true, "Please enter seller name"],
        trim: true,
        lowercase: true,
        maxlength: [100, "Seller name cannot exceed 100 characters"],
        minlength: [2, "Seller name must be at least 2 characters"],
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },
    reviews: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            rating: {
                type: Number,
                required: true,
            },
            comment: {
                type: String,
                required: true,
            },
        }
    ],
    // seller ki details
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export default model("Product", productSchema);
