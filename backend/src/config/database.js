import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDatabase = async () => {
  try {
    if (!process.env.MONGODB_URL || !process.env.DB_NAME) {
      throw new Error("MONGODB_URL or DB_NAME not found in .env file");
    }
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${process.env.DB_NAME}`,
    );
    console.log(
      `✅ MongoDB connected!! DB host ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.log("❌ MongoDB connection FAILED : ", error);
    process.exit(1);
  }
};

export default connectDatabase;
