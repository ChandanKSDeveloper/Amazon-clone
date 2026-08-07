import express from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    getUserProfile,
    updatePassword,
    updateProfile
} from "../controllers/auth.controller.js";

import {upload} from "../utils/upload.middleware.js";

import { isAuthenticatedUser } from "../middleware/auth.middleware.js";

const router = express.Router();
 
// Register a user
router.post("/register", upload.single("avatar"), registerUser);

// Login user
router.post("/login", loginUser);

// Logout user
router.get("/logout", logoutUser);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.put("/password/reset/:token", resetPassword);

// Get user profile
router.get("/me", isAuthenticatedUser, getUserProfile);

//update password
router.put("/password/update", isAuthenticatedUser, updatePassword);

//update profile
router.put("/me/update", isAuthenticatedUser, updateProfile);


export default router;