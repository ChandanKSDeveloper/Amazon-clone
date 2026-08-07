import { Router } from "express";
import {
  processPayment,
  verifyPayment,
  getPaymentConfig,
} from "../controllers/payment.controller.js";

import { isAuthenticatedUser } from "../middleware/auth.middleware.js";

const router = Router();

router.route('/process').post(isAuthenticatedUser, processPayment);
router.route('/verify').post(isAuthenticatedUser, verifyPayment);
router.route('/config').get(processPayment);

export default router;