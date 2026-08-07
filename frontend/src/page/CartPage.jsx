import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  updateCartItemQuantity,
  clearCartApi,
  removeItemFromCart,
} from "../redux/slices/cartSlice.js";

import { amazonQtyBtn, amazonCheckoutBtn } from "../constants/amazonClasses.js";
import { useEffect } from "react";

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux State
  const { cartItems, totalPrice, totalItems, loading  } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.user);

  const [updatingItemId, setUpdatingItemId] = useState(null);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleUpdateQty = async (id, quantity, stock, isIncrease) => {
    const newQty = isIncrease ? quantity + 1 : quantity - 1;
    if (newQty < 1 || newQty > stock) return;

    setUpdatingItemId(id);
    try {
      await dispatch(
        updateCartItemQuantity({ productId: id, quantity: newQty }),
      ).unwrap();
    } catch (error) {
      toast.error(error || "Failed to update quantity");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (id, name) => {
    setUpdatingItemId(id);

    try {
      await dispatch(removeItemFromCart(id)).unwrap();

      toast.success(`{name} removed from the cart`);
    } catch (error) {
      toast.error(error || "failed to remove item");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const clearCart = async () => {
    try {
      await dispatch(clearCartApi()).unwrap();
      toast.success("cart has been cleared out");
    } catch (error) {
      toast.error(error || "failed to clear cart");
    }
  };
  const checkoutHandler = () => {
    if (isAuthenticated) {
      navigate("/shipping");
    } else {
      navigate("/login?redirect=shipping");
    }
  };

  // loadinf state
  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#FF9900]" />
        <p className="mt-4 text-gray-600">Loading your cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 bg-white">
          <div className="p-6 bg-gray-50 rounded-full mb-6 border border-gray-200">
            <ShoppingBag className="h-16 w-16 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F1111] mb-2">
            Your ShopHub Cart is empty
          </h2>
          <p className="text-gray-500 mb-8 text-center max-w-md">
            Your shopping cart is waiting. Give it purpose — fill it with
            groceries, clothing, household supplies, electronics, and more.
          </p>
          <Link
            to="/"
            className="h-10 px-8 rounded-sm text-sm font-medium bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] shadow-sm hover:shadow-md transition-all inline-flex items-center gap-2"
          >
            Continue Shopping
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-[1500px] mx-auto px-4 py-8">
        {/* Amazon splits cart into a left section (items) and right section (checkout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Cart Items List */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-gray-200 rounded-sm p-6">
              <h1 className="text-2xl font-bold text-[#0F1111] mb-6 pb-4 border-b border-gray-200">
                Shopping Cart
              </h1>

              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => {
                  const product = item.product;
                  const isUpdating = updatingItemId === product._id;

                  return (
                    <div
                      key={product._id}
                      className="py-6 first:pt-0 last:pb-0 flex gap-6 relative"
                    >
                      {isUpdating && (
                        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-[#FF9900]" />
                        </div>
                      )}

                      <Link
                        to={`/product/${product._id}`}
                        className="shrink-0 w-45 h-45"
                      >
                        <img
                          src={product.images?.[0]?.url || ""}
                          alt={product.name}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </Link>

                      <div className="flex-1 flex flex-col">
                        <Link
                          to={`/product/${product._id}`}
                          className="text-base font-medium text-[#0F1111] hover:text-[#C7511F] transition-colors line-clamp-2"
                        >
                          {product.name}
                        </Link>

                        <p className="text-sm text-green-600 font-medium mt-1">
                          In Stock
                        </p>

                        <div className="flex items-center gap-6 mt-4">
                          <div className="flex items-center rounded-sm overflow-hidden border border-gray-300">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateQty(
                                  product._id,
                                  item.quantity,
                                  product.stock,
                                  false,
                                )
                              }
                              className={amazonQtyBtn}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-10 h-8 flex items-center justify-center text-sm font-bold text-[#0F1111] bg-white border-x border-gray-300">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateQty(
                                  product._id,
                                  item.quantity,
                                  product.stock,
                                  true,
                                )
                              }
                              className={amazonQtyBtn}
                              disabled={
                                item.quantity >= product.stock || isUpdating
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <span className="text-base font-bold text-[#0F1111]">
                            ₹
                            {(product.price * item.quantity).toLocaleString(
                              "en-IN",
                            )}
                          </span>
                        </div>

                        {/* actions */}

                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <button
                            onClick={() =>
                              handleRemoveItem(product._id, product.name)
                            }
                            disabled={isUpdating}
                            className="text-[#007185] hover:text-[#C7511F] hover:underline flex items-center gap-1 disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

             <div className="text-right mt-6 pt-4 border-t border-gray-200">
              <span className="text-lg text-[#0F1111]">
                Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"}):{" "}
                <strong>₹{totalPrice.toLocaleString("en-IN")}</strong>
              </span>
            </div>
            </div>
          </div>

          {/* Right: Order Summary & Checkout */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-gray-200 rounded-sm p-6 sticky top-24">
              <p className="text-sm text-green-600 font-medium mb-2">
                {totalPrice > 1000
                  ? "✓ Your order qualifies for FREE Shipping"
                  : "Add ₹" + (1000 - totalPrice).toLocaleString("en-IN") + " more for FREE Shipping"}
              </p>

              <p className="text-lg text-[#0F1111] mb-4">
                Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"}):{" "}
                <strong>₹{totalPrice.toLocaleString("en-IN")}</strong>
              </p>

              {/* <label className="flex items-center gap-2 text-sm text-gray-600 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-[#0F1111] focus:ring-[#E77600]"
                  defaultChecked
                />
                This order contains a gift
              </label> */}

              <button
                onClick={checkoutHandler}
                className={`${amazonCheckoutBtn} flex items-center justify-center gap-2`}
              >
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </button>

              <div className="border-t border-gray-200 mt-6 pt-4">
                <button
                 type="button"
                onClick={clearCart}
                disabled={loading}
                className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline disabled:opacity-50" >
                  Clear entire cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;
