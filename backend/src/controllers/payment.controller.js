import asyncHandler from "../utils/asyncHandler.js";
import ErrorHandler from "../utils/ErrorHandler.js"

import {createRazorpayOrder, verifyPaymentSignature} from "../services/razorpay.service.js";

/**
 * @desc    Create Razorpay Order
 * @route   POST /api/v1/payment/process
 * @access  Private
 */
const processPayment = asyncHandler(async (req, res, next) => {
    const { amount, method } = req.body;

    // 1. Handle Cash on Delivery (Skip actual payment gateway)
    if (method === "cod") {
        return res.status(200).json({
            success: true,
            isMock: true,
            paymentInfo: {
                id: `COD_${Date.now()}`,
                status: "Pending" // COD orders are usually 'Pending' until delivered
            }
        });
    }

    // 2. Validate Environment Variables
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return next(new ErrorHandler("Razorpay Keys are not configured in backend .env", 500));
    }

    // 3. Validate Amount
    if (!amount || amount <= 0) {
        return next(new ErrorHandler("Valid payment amount is required", 400));
    }

    // 4. Create Order via Service
    const razorpayOrder = await createRazorpayOrder(amount);

    // 5. Send Order ID and Key ID to Frontend
    res.status(200).json({
        success: true,
        key_id: process.env.RAZORPAY_KEY_ID,  // Frontend needs this to open the modal
        amount: razorpayOrder.amount,
        order_id: razorpayOrder.id              // Frontend needs this to tie the payment to this order
    });
});

/**
 * @desc    Verify Razorpay Payment
 * @route   POST /api/v1/payment/verify
 * @access  Private
 */
const verifyPayment = asyncHandler(async (req, res, next) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return next(new ErrorHandler("Missing payment verification parameters", 400));
    }

    // 1. Verify Signature using Service
    const isAuthentic = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isAuthentic) {
        // CRITICAL: If signature fails, someone is trying to fake a payment!
        return next(new ErrorHandler("Payment signature verification failed. Transaction declined.", 400));
    }

    // 2. If authentic, send success response
    res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        paymentInfo: {
            id: razorpay_payment_id,
            status: "succeeded"
        }
    });
});

/**
 * @desc    Get Razorpay Key ID (Optional, frontend can just use the one from processPayment)
 * @route   GET /api/v1/payment/config
 * @access  Public
 */
const getPaymentConfig = asyncHandler(async (req, res, next) => {
    if (!process.env.RAZORPAY_KEY_ID) {
        return next(new ErrorHandler("Razorpay Key ID is not configured", 500));
    }
    res.status(200).json({
        success: true,
        key_id: process.env.RAZORPAY_KEY_ID
    });
});


export {processPayment, verifyPayment, getPaymentConfig};