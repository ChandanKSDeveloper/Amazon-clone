import asyncHandler from "../utils/asyncHandler.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

/**
 * Authentication Middleware
 * Checks if user is authenticated and token is valid
 */

const isAuthenticatedUser = asyncHandler(async (req, res, next) => {
    // Try to get token from cookies
    let token = req.cookies?.token;
    
    // If not in cookies, check Authorization header (Bearer token)
    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Remove 'Bearer ' prefix
        }
    }

    if (!token) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return next(new ErrorHandler("User not found. Please login again.", 401));
        }

        // Attach user and token to request object
        req.user = user;
        req.token = token;
        req.userID = user._id;

        next();
    } catch (error) {
        // Handle different JWT errors
        if (error.name === 'JsonWebTokenError') {
            return next(new ErrorHandler("Invalid token. Please login again.", 401));
        } else if (error.name === 'TokenExpiredError') {
            return next(new ErrorHandler("Token expired. Please login again.", 401));
        }
        return next(new ErrorHandler("Authentication failed. Please login again.", 401));
    }
});

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ErrorHandler("User not authenticated", 401));
        }
        
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(
                `Role '${req.user.role}' is not allowed to access this resource`, 
                403
            ));
        }
        next();
    };
};


const isAdmin = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        return next(new ErrorHandler("User not authenticated", 401));
    }
    
    if (req.user.role !== 'admin') {
        return next(new ErrorHandler("Access denied. Admin only.", 403));
    }
    next();
});


export { isAuthenticatedUser, authorizeRoles, isAdmin }; 