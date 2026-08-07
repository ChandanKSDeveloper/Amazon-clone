import Product from "../models/product.model.js"
import dotenv from "dotenv"
import connectDB from "../config/database.js"
import productJson from "../data/products2.json" with { type: "json" };

dotenv.config()



const seedProducts = async () => {
    try {
        // await Product.deleteMany()
        // console.log("✅ All products deleted");

        await connectDB();

        await Product.insertMany(productJson)
        console.log("✅ Data inserted successfully");

        let res = Product.find();
        console.log("✅ Products in database:", await res.countDocuments());

        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding data:", error.message);
        process.exit(1);
    }
}

// export { seedProducts };
seedProducts()