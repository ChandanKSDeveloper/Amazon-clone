import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
    createOrderService,
    getSingleOrderService,
    getMyOrdersService,
    getAllOrdersService,
    updateOrderService,
    deleteOrderService,
    getOrderStatisticsService,
    cancelOrderService
} from "../services/order.service.js";

// Create new order
export const createOrder = asyncHandler(async (req, res, next) => {
    const order = await createOrderService(req.body, req.user._id);
    
    res.status(201).json({
        success: true,
        order,
    });
});

// Get single order
export const getSingleOrder = asyncHandler(async (req, res, next) => {
    const isAdmin = req.user?.role === 'admin';
    const { order, fromCache } = await getSingleOrderService(
        req.params.id, 
        req.user._id,
        isAdmin
    );
    
    res.status(200).json({
        success: true,
        order,
        fromCache,
    });
});

// Get all orders of logged in user
export const getMyOrders = asyncHandler(async (req, res, next) => {
    const result = await getMyOrdersService(req.user._id, req.query);
    
    res.status(200).json({
        success: true,
        ...result,
    });
});

// Get all orders (admin)
export const getAllOrders = asyncHandler(async (req, res, next) => {
    const result = await getAllOrdersService(req.query);
    
    res.status(200).json({
        success: true,
        ...result,
    });
});

// Update / process order (admin)
export const updateOrder = asyncHandler(async (req, res, next) => {
    const order = await updateOrderService(
        req.params.id, 
        req.body.status,
        req.user._id
    );
    
    res.status(200).json({
        success: true,
        order,
        message: `Order status updated to ${req.body.status}`,
    });
});

// Delete order (admin)
export const deleteOrder = asyncHandler(async (req, res, next) => {
    const result = await deleteOrderService(req.params.id);
    
    res.status(200).json({
        success: true,
        ...result,
    });
});

// Get order statistics (admin)
export const getOrderStatistics = asyncHandler(async (req, res, next) => {
    const stats = await getOrderStatisticsService();
    
    res.status(200).json({
        success: true,
        ...stats,
    });
});

// Cancel order (user)
export const cancelOrder = asyncHandler(async (req, res, next) => {
    const result = await cancelOrderService(req.params.id, req.user._id);
    
    res.status(200).json({
        success: true,
        ...result,
    });
});
