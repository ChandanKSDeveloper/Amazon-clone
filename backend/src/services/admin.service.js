import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

import ErrorHandler from "../utils/ErrorHandler.js";

import { cacheData, getCachedData, deleteCachedData } from "../utils/redis.js";

// Cache keys
const ADMIN_CACHE_KEYS = {
  ALL_USERS: "admin:users:all",
  SINGLE_USER: (id) => `admin:user:${id}`,
  DASHBOARD_STATS: "admin:dashboard:stats",
  USER_STATS: "admin:user:stats",
};

export const getAllUsers = async (req) => {
  const { page = 1, limit = 10, search, role } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (role) {
    query.role = role;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const users = await User.find(query)
    .skip(skip)
    .limit(parseInt(limit))
    .select("-password -resetPasswordToken -resetPasswordExpire");

  const totalUsers = await User.countDocuments(query);

  return {
    users,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
      limit: parseInt(limit),
    },
  };
};

export const getSingleUser = async (req) => {
  const userId = req.params.id;
  const cacheKey = ADMIN_CACHE_KEYS.SINGLE_USER(userId);

  // Check cache
  const cachedUser = await getCachedData(cacheKey);
  if (cachedUser) {
    return res.status(200).json({
      success: true,
      user: cachedUser,
      fromCache: true,
    });
  }

  const user = await User.findById(userId).select(
    "-password -resetPasswordToken -resetPasswordExpire",
  );

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Cache for 5 minutes
  await cacheData(cacheKey, user, 300);

  return {
    user,
    fromCache: false,
  };
};

export const deleteUser = async (req) => {
  const userId = req.params.id;
  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user._id.toString()) {
    return next(new ErrorHandler("You cannot delete your own account", 400));
  }

  // Get user's orders count
  const orderCount = await Order.countDocuments({ user: userId });

  // Delete user's orders (optional - or you can just remove user reference)
  // await Order.deleteMany({ user: userId });

  // Remove avatar from Cloudinary if exists
  if (user.avatar && user.avatar.public_id) {
    try {
      // Import cloudinary and delete
      // await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    } catch (error) {
      console.error("Error deleting avatar from Cloudinary:", error);
    }
  }

  // Delete user
  await user.deleteOne();

  // Clear cache
  await deleteCachedData(ADMIN_CACHE_KEYS.SINGLE_USER(userId));
  await deleteCachedData(ADMIN_CACHE_KEYS.ALL_USERS);
  await deleteCachedData(ADMIN_CACHE_KEYS.DASHBOARD_STATS);
  await deleteCachedData("products:*"); // Clear product cache too

  return {
    message: "User deleted successfully",
    deletedUser: {
      id: user._id,
      name: user.name,
      email: user.email,
      ordersCount: orderCount,
    },
  };
};

export const getAdminDashboardStats = async (req) => {
  const cacheKey = ADMIN_CACHE_KEYS.DASHBOARD_STATS;

  // Check cache
  const cachedStats = await getCachedData(cacheKey);
  if (cachedStats) {
    return { ...cachedStats,
      fromCache: true}
  }

  // Get all counts
  const [
    productsCount,
    usersCount,
    orders,
    totalRevenue,
    orderStatusCounts,
    recentOrders,
    topProducts,
    monthlyStats,
  ] = await Promise.all([
    // Total products
    Product.countDocuments(),

    // Total users
    User.countDocuments(),

    // All orders for calculation
    Order.find(),

    // Total revenue calculation
    Order.aggregate([
      { $match: { orderStatus: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),

    // Order status breakdown
    Order.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]),

    // Recent orders (last 5)
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email"),

    // Top selling products
    Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          totalSold: { $sum: "$orderItems.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]),

    // Monthly stats (last 6 months)
    Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          orders: { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]),
  ]);

  // Calculate total amount from orders
  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice || 0;
  });

  // Get total revenue (from delivered orders)
  const revenueData = totalRevenue[0] || { total: 0 };
  const totalRevenueAmount = revenueData.total;

  // Format order status counts
  const orderStatusCountsFormatted = {};
  orderStatusCounts.forEach((item) => {
    orderStatusCountsFormatted[item._id] = item.count;
  });

  // Prepare response
  const stats = {
    productsCount,
    usersCount,
    ordersCount: orders.length,
    totalAmount,
    totalRevenue: totalRevenueAmount,
    averageOrderValue: orders.length > 0 ? totalAmount / orders.length : 0,
    orders: recentOrders,
    orderStatusCounts: orderStatusCountsFormatted,
    topProducts,
    monthlyStats,
    // Additional metrics
    metrics: {
      conversionRate: usersCount > 0 ? (orders.length / usersCount) * 100 : 0,
      averageOrderItems:
        orders.length > 0
          ? orders.reduce((acc, order) => acc + order.orderItems.length, 0) /
            orders.length
          : 0,
    },
    timestamp: new Date().toISOString(),
  };

  // Cache for 5 minutes
  await cacheData(cacheKey, stats, 300);

  return {
    ...stats,
    fromCache: false,
  };
};

export const updateUserRole = async (req) => {
  const { name, email, role } = req.body;
  const userId = req.params.id;

  // Validate role
  const validRoles = ["user", "admin", "seller"];
  if (role && !validRoles.includes(role)) {
    return next(
      new ErrorHandler(
        `Invalid role. Must be one of: ${validRoles.join(", ")}`,
        400,
      ),
    );
  }

  // Prevent admin from changing their own role to non-admin
  if (userId === req.user._id.toString() && role && role !== "admin") {
    return next(new ErrorHandler("You cannot change your own admin role", 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Update fields
  if (name) user.name = name.trim();
  if (email) {
    // Check if email is taken by another user
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: userId },
    });
    if (existingUser) {
      return next(
        new ErrorHandler("Email already in use by another user", 400),
      );
    }
    user.email = email.toLowerCase();
  }
  if (role) user.role = role;

  await user.save();

  // Clear cache
  await deleteCachedData(ADMIN_CACHE_KEYS.SINGLE_USER(userId));
  await deleteCachedData(ADMIN_CACHE_KEYS.ALL_USERS);
  await deleteCachedData(ADMIN_CACHE_KEYS.DASHBOARD_STATS);

  return {
    message: "User updated successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const getUserStatistics = async (req) => {
  const cacheKey = ADMIN_CACHE_KEYS.USER_STATS;

  // Check cache
  const cachedStats = await getCachedData(cacheKey);
  if (cachedStats) {
    return res.status(200).json({
      success: true,
      ...cachedStats,
      fromCache: true,
    });
  }

  const [totalUsers, roleStats, signupStats] = await Promise.all([
    User.countDocuments(),
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
      { $limit: 30 },
    ]),
  ]);

  const stats = {
    totalUsers,
    roleDistribution: roleStats,
    recentSignups: signupStats,
    timestamp: new Date().toISOString(),
  };

  // Cache for 5 minutes
  await cacheData(cacheKey, stats, 300);

  return {
    ...stats,
    fromCache: false,
  };
};

export const bulkDeleteUsers = async (req) => {
  const { userIds } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return next(new ErrorHandler("Please provide an array of user IDs", 400));
  }

  // Prevent admin from deleting themselves
  const filteredUserIds = userIds.filter(
    (id) => id !== req.user._id.toString(),
  );

  if (filteredUserIds.length === 0) {
    return next(new ErrorHandler("Cannot delete your own account", 400));
  }

  const result = await User.deleteMany({ _id: { $in: filteredUserIds } });

  // Clear cache
  await deleteCachedData(ADMIN_CACHE_KEYS.ALL_USERS);
  await deleteCachedData(ADMIN_CACHE_KEYS.DASHBOARD_STATS);
  await deleteCachedData(ADMIN_CACHE_KEYS.USER_STATS);

  // Clear individual user caches
  for (const id of filteredUserIds) {
    await deleteCachedData(ADMIN_CACHE_KEYS.SINGLE_USER(id));
  }
  return {
    message: `${result.deletedCount} users deleted successfully`,
    deletedCount: result.deletedCount,
  };
};
