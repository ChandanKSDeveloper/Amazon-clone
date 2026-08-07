import { Router } from "express";
import {
    getAllUsers,
    getSingleUser,
    deleteUser,
    getAdminDashboardStats,
    updateUserRole,
    getUserStatistics,
    bulkDeleteUsers
} from "../controllers/admin.controller.js";
import {
    isAuthenticatedUser,
    authorizeRoles
} from "../middleware/auth.middleware.js";
import {
    validateUpdateUser,
    validateBulkDelete,
    handleValidationErrors
} from "../middleware/validation.middleware.js";

const router = Router();

// All routes require authentication and admin role
router.use(isAuthenticatedUser, authorizeRoles("admin"));

// Dashboard stats
router.get("/stats", getAdminDashboardStats);

// User management
router.get("/users", getAllUsers);
router.get("/user-stats", getUserStatistics);
router.get("/user/:id", getSingleUser);
router.put("/user/:id", validateUpdateUser, handleValidationErrors, updateUserRole);
router.delete("/user/:id", deleteUser);

// Bulk operations
router.delete("/users/bulk", validateBulkDelete, handleValidationErrors, bulkDeleteUsers);

export default router;