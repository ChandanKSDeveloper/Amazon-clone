import asyncHandler from "../utils/asyncHandler.js";
import * as adminService from "../services/admin.service.js";

// Get all users with pagination and filtering
/**
 * @desc    Get all users with pagination and search
 * @route   GET /api/v1/admin/users
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res, next) => {
    const data = await adminService.getAllUsers(req);

    res.status(200).json({
        success: true,
        ...data
    });
});

// Get single user with caching
/**
 * @desc    Get single user
 * @route   GET /api/v1/admin/user/:id
 * @access  Private/Admin
 */
const getSingleUser = asyncHandler(async (req, res, next) => {
    
    const data = await adminService.getSingleUser(req);

    res.status(200).json({
        success: true,
       ...data
    });
});

// Delete user with cleanup
/**
 * @desc    Delete user
 * @route   DELETE /api/v1/admin/user/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res, next) => {
    const data = await adminService.deleteUser(req);

    res.status(200).json({
        success: true,
      ...data
    });
});

// Get admin dashboard stats with caching
/**
 * @desc    Get dashboard stats
 * @route   GET /api/v1/admin/stats
 * @access  Private/Admin
 */
const getAdminDashboardStats = asyncHandler(async (req, res, next) => {
    const data = await adminService.getAdminDashboardStats(req);

    res.status(200).json({
        success: true,
     ...data
    });
});

// Update user role
/**
 * @desc    Update user role
 * @route   PUT /api/v1/admin/user/:id
 * @access  Private/Admin
 */
const updateUserRole = asyncHandler(async (req, res, next) => {
    const data = await adminService.updateUserRole(req);

    res.status(200).json({
        success: true,
      ...data
    });
});

// Get user statistics (admin only)
/**
 * @desc    Get user statistics
 * @route   GET /api/v1/admin/user-stats
 * @access  Private/Admin
 */
const getUserStatistics = asyncHandler(async (req, res, next) => {
    const data = await adminService.getUserStatistics(req);

    res.status(200).json({
        success: true,
     ...data
    });
});

// Bulk delete users
/**
 * @desc    Bulk delete users
 * @route   DELETE /api/v1/admin/users/bulk
 * @access  Private/Admin
 */
const bulkDeleteUsers = asyncHandler(async (req, res, next) => {
    const data = await adminService.bulkDeleteUsers(req);

    res.status(200).json({
        success: true,
       ...data
    });
});

// Export all functions
export { 
    getAllUsers,
    getSingleUser,
    deleteUser,
    getAdminDashboardStats,
    updateUserRole,
    getUserStatistics,
    bulkDeleteUsers
};