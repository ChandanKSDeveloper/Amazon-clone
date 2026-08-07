import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from 'fs';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            width: 150,                   // Set width to 150px
            crop: "scale",                // Scale crop mode
            resource_type: "auto"
        });

        if(!response){
            console.log("Error while uploading file")
        }
        console.log("File uploaded successfully on cloudinary: ", response.url);
        console.log("Uploaded to folder:", response.folder);
        console.log("Dimensions:", response.width, "x", response.height);
        
        return response;

    } catch (error) {
        console.error("Upload failed:", error.message);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
}

export { uploadOnCloudinary };