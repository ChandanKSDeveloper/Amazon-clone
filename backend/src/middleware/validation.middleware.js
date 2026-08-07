import { body, param, query, validationResult } from 'express-validator';
import ErrorHandler from '../utils/ErrorHandler.js';

// Validate update user role
const validateUpdateUser = [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('name').optional().isString().trim().isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email').optional().isEmail().normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('role').optional().isIn(['user', 'admin', 'seller'])
        .withMessage('Role must be user, admin, or seller'),
];

// Validate bulk delete
const validateBulkDelete = [
    body('userIds').isArray({ min: 1 }).withMessage('Please provide an array of user IDs'),
    body('userIds.*').isMongoId().withMessage('Invalid user ID in array'),
];

// Validation result handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return next(new ErrorHandler(errorMessages.join(', '), 400));
    }
    next();
};


// Order validations
// Update validation to make price fields optional
const validateOrderCreation = [
    body('orderItems').isArray({ min: 1 }).withMessage('At least one product is required'),
    body('orderItems.*.product').isMongoId().withMessage('Invalid product ID'),
    body('orderItems.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('shippingInfo').isObject().withMessage('Shipping info is required'),
    body('shippingInfo.address').notEmpty().withMessage('Address is required'),
    body('shippingInfo.city').notEmpty().withMessage('City is required'),
    body('shippingInfo.state').notEmpty().withMessage('State is required'),
    body('shippingInfo.country').notEmpty().withMessage('Country is required'),
    body('shippingInfo.pinCode').notEmpty().withMessage('Pin code is required'),
    // Make price fields optional
    body('itemsPrice').optional().isNumeric().withMessage('Items price must be a number'),
    body('taxPrice').optional().isNumeric().withMessage('Tax price must be a number'),
    body('shippingPrice').optional().isNumeric().withMessage('Shipping price must be a number'),
    body('totalPrice').optional().isNumeric().withMessage('Total price must be a number'),
];
const validateOrderUpdate = [
    param('id').isMongoId().withMessage('Invalid order ID'),
    body('status').isIn(['Processing', 'Shipped', 'Delivered', 'Cancelled'])
        .withMessage('Status must be Processing, Shipped, Delivered, or Cancelled'),
];

const validateOrderId = [
    param('id').isMongoId().withMessage('Invalid order ID'),
];

const validatePagination = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

// Add to existing validations
export { 
    validateUpdateUser,
    validateBulkDelete,
    validateOrderCreation,
    validateOrderUpdate,
    validateOrderId,
    validatePagination,
    handleValidationErrors
};