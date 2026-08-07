import express from "express";
import { 
    createOrder, 
    getSingleOrder, 
    getMyOrders, 
    getAllOrders, 
    updateOrder, 
    deleteOrder,
    getOrderStatistics,
    cancelOrder
} from "../controllers/order.controller.js";
import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.middleware.js";
import {
    validateOrderCreation,
    validateOrderUpdate,
    validateOrderId,
    validatePagination,
    handleValidationErrors
} from "../middleware/validation.middleware.js";

const router = express.Router();

// User routes
router.route("/order/new")
    .post(isAuthenticatedUser, validateOrderCreation, handleValidationErrors, createOrder);
router.route("/order/:id")
    .get(isAuthenticatedUser, validateOrderId, handleValidationErrors, getSingleOrder);
router.route("/orders/me")
    .get(isAuthenticatedUser, validatePagination, handleValidationErrors, getMyOrders);
router.route("/order/:id/cancel")
    .put(isAuthenticatedUser, validateOrderId, handleValidationErrors, cancelOrder);

// Admin routes
router.route("/admin/orders")
    .get(isAuthenticatedUser, authorizeRoles("admin"), validatePagination, handleValidationErrors, getAllOrders);
router.route("/admin/order/:id")
    .put(isAuthenticatedUser, authorizeRoles("admin"), validateOrderUpdate, handleValidationErrors, updateOrder)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), validateOrderId, handleValidationErrors, deleteOrder);
router.route("/admin/orders/stats")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getOrderStatistics);

export default router;