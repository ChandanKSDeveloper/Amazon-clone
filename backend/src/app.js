import express from "express";
import qs from "qs";
import cookieParser from "cookie-parser";
import cors from "cors";

// routes
import {
  authRoutes,
  productRoutes,
  adminRoutes,
  orderRoutes,
  cartRoutes,
  paymentRoutes
} from "./routes/index.js";

const app = express();

// Middleware
app.use(express.json()); // to parse json data
app.use(express.urlencoded({ extended: true })); // to parse url encoded data

// query parser
app.set("query parser", (str) => qs.parse(str, { allowDots: true }));
app.use(cookieParser());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  process.env.FRONTEND_PROD_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      }

      const msg = `
            The CORS policy for this site does not allow access from the specified Origin. CORS: Origin "${origin}" is not allowed.`;
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/", orderRoutes);


export default app;
