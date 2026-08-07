import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";



const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [6, "Password must be at least 6 characters long"],
    select: false, // This will prevent the password from being returned in the response
  },
  avatar: {
    public_id: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin", "seller"],
  },

  cart: [{
    product : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity cannot be less than 1"],
        default: 1,
    },
    addedAt: {
        type: Date,
        default: Date.now,
      },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String, // Stores the hashed token sent to the user for password reset verification
  resetPasswordExpire: Date, // Stores the expiry time of the reset token to ensure the reset link works only for a limited time
});

// Hash the password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare the password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// generate jwt token
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

userSchema.methods.getResetPasswordToken = function () {
  // Generate a random token
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // Token expires in 15 minutes

  return resetToken; // Return the unhashed token to send to the user via email
};


// Cart methods
userSchema.methods.addToCart = async function (productId, quantity = 1) {
  const existingItem = this.cart.find(
    item => item.product.toString() === productId.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.cart.push({ product: productId, quantity });
  }

  return await this.save();
};

userSchema.methods.removeFromCart = async function (productId) {
  this.cart = this.cart.filter(
    item => item.product.toString() !== productId.toString()
  );
  return await this.save();
};

userSchema.methods.updateCartQuantity = async function (productId, quantity) {
  const item = this.cart.find(
    item => item.product.toString() === productId.toString()
  );

  if (item) {
    if (quantity <= 0) {
      return await this.removeFromCart(productId);
    }
    item.quantity = quantity;
    return await this.save();
  }
  throw new Error("Product not found in cart");
};

userSchema.methods.clearCart = async function () {
  this.cart = [];
  return await this.save();
};

userSchema.methods.getCartCount = function () {
  return this.cart.reduce((total, item) => total + item.quantity, 0);
};


export default mongoose.model("User", userSchema);
