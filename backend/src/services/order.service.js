import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import { cacheData, getCachedData, deleteCachedData } from "../utils/redis.js";

const ORDER_CACHE_KEY = {
  SINGLE_ORDER: (orderId) => `order:${orderId}`,
  USER_ORDERS: (userId) => `orders:user:${userId}`,
  ALL_ORDERS: "orders:all",
  ORDER_STATS: "orders:stats",
};
// Create a new order

export const createOrderService = async (orderData, userId) => {
  const { orderItems, shippingInfo, paymentInfo } = orderData;

  if (!orderItems || orderItems.length === 0) {
    throw new ErrorHandler("Please add some items to the order", 400);
  }

  // Process order items and populate product details
  let itemsPrice = 0;
  const processedOrderItems = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new ErrorHandler(`Product not found: ${item.product}`, 404);
    }
    if (product.stock < item.quantity) {
      throw new ErrorHandler(
        `Product ${product.name} is out of stock. Available: ${product.stock}`,
        400,
      );
    }

    // Build order item with product details
    const orderItem = {
      product: item.product,
      name: product.name, // Get from product
      price: product.price, // Get from product
      quantity: item.quantity,
      image: product.images?.[0]?.url || product.images?.[0] || "", // Get from product
    };

    processedOrderItems.push(orderItem);
    itemsPrice += product.price * item.quantity;
  }

  // Calculate tax (e.g., 18% GST)
  const taxPrice = itemsPrice * 0.18;

  // Shipping price (could be based on order total or fixed)
  const shippingPrice = itemsPrice > 1000 ? 0 : 50;

  // Total price
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  // Create order
  const order = await Order.create({
    orderItems: processedOrderItems,
    shippingInfo,
    paymentInfo: {
      ...paymentInfo,
      status: paymentInfo.status || "Pending",
    },
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: userId,
  });

  // Update product stock
  for (const item of processedOrderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  // Clear cache
  await deleteCachedData(ORDER_CACHE_KEY.USER_ORDERS(userId));
  await deleteCachedData(ORDER_CACHE_KEY.ALL_ORDERS);
  await deleteCachedData(ORDER_CACHE_KEY.ORDER_STATS);

  return order;
};

// Get single order details

export const getSingleOrderService = async (
  orderId,
  userId,
  isAdmin = false,
) => {
  const cacheKey = ORDER_CACHE_KEY.SINGLE_ORDER(orderId);

  // check cache
  const cachedOrder = await getCachedData(cacheKey);

  if (cachedOrder) {
    // Check if user has access to this order
    if (!isAdmin && cachedOrder.user._id.toString() !== userId.toString()) {
      throw new ErrorHandler("You are not authorized to view this order", 403);
    }
    return { order: cachedOrder, fromCache: true };
  }

  const order = await Order.findById(orderId)
    .populate("user", "name email")
    .populate("orderItems.product", "name price stock images");

  if (!order) {
    throw new ErrorHandler("Order not found", 404);
  }

  if (!isAdmin && order.user._id.toString() !== userId.toString()) {
    throw new ErrorHandler("You are not authorized to view this order", 403);
  }

  await cacheData(cacheKey, order, 300);

  return { order, fromCache: false };
};

export const getMyOrdersService = async (userId, queryParams = {}) => {
  const { page = 1, limit = 10, status } = queryParams;
  const cacheKey = ORDER_CACHE_KEY.USER_ORDERS(userId);

  // Check cache for first page only
  if (page === 1 && !status) {
    const cachedOrders = await getCachedData(cacheKey);
    if (cachedOrders) {
      return { ...cachedOrders, fromCache: true };
    }
  }

  // Build base query
  const baseQuery = { user: userId };
  if (status) {
    baseQuery.orderStatus = status;
  }

  // Initialize ApiFeatures
  const apiFeatures = new ApiFeatures(Order.find(baseQuery), queryParams);

  // Apply filters and pagination
  apiFeatures.filter().pagination(parseInt(limit));

  // Execute query
  const orders = await apiFeatures.query
    .sort({ createdAt: -1 })
    .populate("orderItems.product", "name price images");

  // Get total count
  const totalOrders = await Order.countDocuments(baseQuery);

  const result = {
    orders,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalOrders / parseInt(limit)),
      totalOrders,
      limit: parseInt(limit),
    },
    fromCache: false,
  };

  // Cache for first page only (5 minutes)
  if (page === 1 && !status) {
    await cacheData(cacheKey, result, 300);
  }

  return result;
};

export const getAllOrdersService = async (queryParams = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    startDate,
    endDate,
    search,
  } = queryParams;
  const cacheKey = ORDER_CACHE_KEY.ALL_ORDERS;

  // Check cache for first page without filters
  if (page === 1 && !status && !startDate && !endDate && !search) {
    const cachedOrders = await getCachedData(cacheKey);
    if (cachedOrders) {
      return { ...cachedOrders, fromCache: true };
    }
  }

  // Build base query
  const query = {};
  if (status) {
    query.orderStatus = status;
  }
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  // Initialize ApiFeatures
  let apiFeatures = new ApiFeatures(Order.find(query), queryParams);

  // Apply filters and pagination
  apiFeatures.filter().pagination(parseInt(limit));

  // Handle search separately (since it's on populated fields)
  let ordersQuery = apiFeatures.query;
  if (search) {
    // Search requires populate first, then filter
    ordersQuery = ordersQuery.populate("user", "name email");
    // We'll handle search after populate
  }

  // Execute query
  let orders = await ordersQuery
    .sort({ createdAt: -1 })
    .populate("user", "name email")
    .populate("orderItems.product", "name price images");

  // Apply search filter on populated data
  if (search) {
    orders = orders.filter(
      (order) =>
        order.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(search.toLowerCase()),
    );
  }

  // Get total count
  const totalOrders = await Order.countDocuments(query);

  // Calculate summary statistics
  const stats = await Order.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: "$totalPrice" },
        minOrder: { $min: "$totalPrice" },
        maxOrder: { $max: "$totalPrice" },
      },
    },
  ]);

  const result = {
    orders,
    stats: stats[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      minOrder: 0,
      maxOrder: 0,
    },
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalOrders / parseInt(limit)),
      totalOrders,
      limit: parseInt(limit),
    },
    fromCache: false,
  };

  // Cache for first page without filters (2 minutes)
  if (page === 1 && !status && !startDate && !endDate && !search) {
    await cacheData(cacheKey, result, 120);
  }

  return result;
};

const updateStock = async (productId, quantity) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new ErrorHandler(`Product ${productId} not found`, 404);
  }
  if (product.stock < quantity) {
    throw new ErrorHandler(
      `Product ${product.name} has insufficient stock`,
      400,
    );
  }
  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
};

export const updateOrderService = async (orderId, status, adminId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ErrorHandler("Order not found", 404);
  }

  // Prevent updating delivered orders
  if (order.orderStatus === "Delivered") {
    throw new ErrorHandler("Order already delivered", 400);
  }

  // Validate status transition
  const validTransitions = {
    Processing: ["Shipped", "Cancelled"],
    Shipped: ["Delivered", "Cancelled"],
    Cancelled: [],
    Delivered: [],
  };

  if (status === order.orderStatus) {
    throw new ErrorHandler(`Order is already ${status}`, 400);
  }

  if (
    !validTransitions[order.orderStatus]?.includes(status) &&
    !["Processing", "Shipped", "Delivered", "Cancelled"].includes(status)
  ) {
    throw new ErrorHandler(
      `Invalid status transition from ${order.orderStatus} to ${status}`,
      400,
    );
  }

  // If status is Shipped or Delivered, update stock
  if (status === "Shipped" || status === "Delivered") {
    for (const item of order.orderItems) {
      await updateStock(item.product, item.quantity);
    }
  }

  // If status is Cancelled, restore stock
  if (status === "Cancelled" && order.orderStatus !== "Cancelled") {
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save({ validateBeforeSave: false });
      }
    }
  }

  order.orderStatus = status;
  order.updatedAt = Date.now();
  order.updatedBy = adminId;

  if (status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save();

  // Clear cache
  await deleteCachedData(ORDER_CACHE_KEY.SINGLE_ORDER(orderId));
  await deleteCachedData(ORDER_CACHE_KEY.USER_ORDERS(order.user.toString()));
  await deleteCachedData(ORDER_CACHE_KEY.ALL_ORDERS);
  await deleteCachedData(ORDER_CACHE_KEY.ORDER_STATS);

  return order;
};

export const deleteOrderService = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ErrorHandler("Order not found", 404);
  }

  // If order is not delivered or cancelled, restore stock
  if (order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled") {
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save({ validateBeforeSave: false });
      }
    }
  }

  await order.deleteOne();

  // Clear cache
  await deleteCachedData(ORDER_CACHE_KEY.SINGLE_ORDER(orderId));
  await deleteCachedData(ORDER_CACHE_KEY.USER_ORDERS(order.user.toString()));
  await deleteCachedData(ORDER_CACHE_KEY.ALL_ORDERS);
  await deleteCachedData(ORDER_CACHE_KEY.ORDER_STATS);

  return {
    message: "Order deleted successfully",
    orderId: order._id,
    orderStatus: order.orderStatus,
    deletedAt: new Date().toISOString(),
  };
};

/**
 * Get order statistics (admin)
 */
export const getOrderStatisticsService = async () => {
  const cacheKey = ORDER_CACHE_KEY.ORDER_STATS;

  // Check cache
  const cachedStats = await getCachedData(cacheKey);
  if (cachedStats) {
    return { ...cachedStats, fromCache: true };
  }

  const stats = await Order.aggregate([
    {
      $group: {
        _id: "$orderStatus",
        count: { $sum: 1 },
        totalRevenue: { $sum: "$totalPrice" },
        averageOrderValue: { $avg: "$totalPrice" },
      },
    },
  ]);

  // Get monthly revenue (last 12 months)
  const monthlyRevenue = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalRevenue: { $sum: "$totalPrice" },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Get recent orders (last 5)
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "name email");

  const result = {
    statusBreakdown: stats,
    monthlyRevenue,
    recentOrders,
    totalOrders: await Order.countDocuments(),
    totalRevenue: await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]).then((result) => result[0]?.total || 0),
    timestamp: new Date().toISOString(),
    fromCache: false,
  };

  // Cache for 5 minutes
  await cacheData(cacheKey, result, 300);

  return result;
};

/**
 * Cancel order (user)
 */
export const cancelOrderService = async (orderId, userId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ErrorHandler("Order not found", 404);
  }

  // Check authorization
  if (order.user.toString() !== userId.toString()) {
    throw new ErrorHandler("You are not authorized to cancel this order", 403);
  }

  // Check if order can be cancelled
  if (order.orderStatus === "Delivered") {
    throw new ErrorHandler("Delivered orders cannot be cancelled", 400);
  }

  if (order.orderStatus === "Cancelled") {
    throw new ErrorHandler("Order is already cancelled", 400);
  }

  // Restore stock
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stock += item.quantity;
      await product.save({ validateBeforeSave: false });
    }
  }

  order.orderStatus = "Cancelled";
  order.cancelledAt = Date.now();
  await order.save();

  // Clear cache
  await deleteCachedData(ORDER_CACHE_KEY.SINGLE_ORDER(orderId));
  await deleteCachedData(ORDER_CACHE_KEY.USER_ORDERS(userId));
  await deleteCachedData(ORDER_CACHE_KEY.ALL_ORDERS);
  await deleteCachedData(ORDER_CACHE_KEY.ORDER_STATS);

  return {
    message: "Order cancelled successfully",
    order,
    cancelledAt: new Date().toISOString(),
  };
};
