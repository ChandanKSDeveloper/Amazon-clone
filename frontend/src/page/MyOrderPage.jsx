import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, ExternalLink, ShoppingBag, AlertCircle } from "lucide-react";
import { amazonClasses } from "../constants/amazonClasses.js";
import { useDispatch, useSelector } from "react-redux";
import { getMyOrders, deleteOrder } from "../redux/slices/orderSlice"; // Assuming you create this
import { toast } from "sonner";

const statusConfig = {
  Processing: {
    color: "bg-amber-100 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  Shipped: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    dot: "bg-blue-500",
  },
  Delivered: {
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
  },
};

const MyOrderPage = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(getMyOrders());
  }, [dispatch]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.Processing;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${config.color}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`}
        />
        {status}
      </span>
    );
  };

  const cancelOrder = async (e, orderId) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await dispatch(deleteOrder(orderId)).unwrap();
      toast.success(
        `Your order with order id [${orderId.slice(-8).toUpperCase()}] has been cancelled by you`,
      );
    } catch (error) {
      toast.error(error || "Failed to cancel to order");
    }
  };

  if (loading) return <MyOrdersSkeleton />;

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Failed to load orders
          </h2>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={() => dispatch(getMyOrders())}
            className={`${amazonClasses.btnSecondary} px-6 py-2`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Your Orders
                </h1>
                <p className="text-sm text-gray-500">
                  {orders.length} order{orders.length !== 1 ? "s" : ""} placed
                </p>
              </div>
            </div>
          </div>

          {orders.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  No orders yet
                </h2>
                <p className="text-gray-500 max-w-sm">
                  Looks like you haven't placed any orders. Start shopping and
                  your orders will show up here!
                </p>
              </div>
              <Link to="/">
                <button
                  className={`${amazonClasses.btnYellow} px-8 py-2.5 flex items-center gap-2`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Start Shopping
                </button>
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-gray-50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-gray-700">
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {order.orderItems.slice(0, 3).map((item, idx) => (
                                <img
                                  key={idx}
                                  src={item.image}
                                  alt={item.name}
                                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {order.orderItems.length} item
                              {order.orderItems.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900">
                            ₹
                            {order.totalPrice.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(order.orderStatus)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link to={`/order/${order._id}`}>
                            <button className="inline-flex items-center gap-1.5 text-sm font-medium text-[#007185] hover:text-[#C7511F] hover:underline">
                              View <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </Link>

                          <button
                            onClick={(e) => cancelOrder(e, order._id)}
                            className="inline-flex ml-3 items-center gap-1.5 text-sm font-medium text-[#007185] hover:text-[#C7511F] hover:underline"
                          >
                            Cancel order
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="md:hidden space-y-3">
                {orders.map((order) => (
                  <Link
                    key={order._id}
                    to={`/order/${order._id}`}
                    className="block bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-mono text-sm font-medium text-gray-900">
                          #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      {getStatusBadge(order.orderStatus)}
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex -space-x-2">
                        {order.orderItems.slice(0, 3).map((item, idx) => (
                          <img
                            key={idx}
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg border-2 border-white object-cover"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {order.orderItems.length} item
                        {order.orderItems.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-500">Total</span>
                      <span className="font-bold text-gray-900">
                        ₹
                        {order.totalPrice.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

function MyOrdersSkeleton() {
  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8 border-b border-gray-200 pb-4">
          <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
          <div className="space-y-2">
            <div className="h-7 w-40 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-6 px-6 py-4 border-b border-gray-100"
            >
              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-28 bg-gray-200 animate-pulse rounded" />
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse border-2 border-white" />
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse border-2 border-white" />
              </div>
              <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
              <div className="h-6 w-20 bg-gray-200 animate-pulse rounded-full" />
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyOrderPage;
