import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminSidebar from "../../components/AdminSidebar.jsx";
import { toast } from "sonner";
import { 
  Eye, 
  Trash2, 
  X, 
  AlertCircle,
  Truck,
  CheckCircle,
  Clock
} from "lucide-react";

import AmazonSpinner from "../../components/products/AmazonSpinner.jsx";

import { amazonClasses, amazonSelect, amazonInput } from "../../constants/amazonClasses.js";

import { getAllOrders, updateOrder, deleteOrder } from "../../redux/slices/orderSlice.js";

export default function AdminOrders() {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.order);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    dispatch(getAllOrders());
  }, [dispatch]);

  const handleOpenManage = (order) => {
    setSelectedOrder(order);
    setUpdateStatus(order.orderStatus);
  };

  const handleCloseManage = () => {
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    
    setUpdating(true);
    try {
      // Pass id and status to the Redux thunk
      await dispatch(updateOrder({ id: selectedOrder._id, orderStatus: updateStatus })).unwrap();
      toast.success("Order status updated successfully!");
      setSelectedOrder(null);
    } catch (err) {
      toast.error(err || "Failed to update order status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await dispatch(deleteOrder(id)).unwrap();
        toast.success("Order deleted successfully.");
      } catch (err) {
        toast.error(err || "Failed to delete order.");
      }
    }
  };

  return (
    <>
      <div className="flex min-h-screen bg-[#EAEDED]">
        <AdminSidebar />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* Header */}
          <div className="mb-8 border-b border-gray-300 pb-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#131921]">
              Manage Orders
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Fulfill buyer orders, track shipping logistics, and review client purchases.
            </p>
          </div>

          {loading && orders.length === 0 ? (
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <AmazonSpinner className="h-10 w-10 text-[#FF9900]" />
                <p className="text-sm text-gray-600">Retrieving transactions...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex gap-4 text-red-700">
              <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg">Error Loading Orders</h3>
                <p className="text-sm opacity-90 mt-1">{error}</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className={`${amazonClasses.cardBase} p-12 text-center`}>
              <p className="text-gray-600">No buyer orders are registered yet.</p>
            </div>
          ) : (
            <div className={`${amazonClasses.cardBase} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider font-semibold">
                      <th className="py-4 px-6">Order ID</th>
                      <th className="py-4 px-6">Purchased Items</th>
                      <th className="py-4 px-6">Fulfillment Status</th>
                      <th className="py-4 px-6">Grand Total</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr key={order._id} className="text-gray-700 hover:bg-gray-50 transition">
                        {/* Order ID */}
                        <td className="py-4 px-6 font-mono text-xs font-semibold text-[#131921]">
                          {order._id}
                        </td>

                        {/* Order Items Summary */}
                        <td className="py-4 px-6 max-w-xs">
                          <p className="font-medium text-[#131921] truncate">
                            {order.orderItems?.map((item) => `${item.name} (x${item.quantity})`).join(", ")}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{order.orderItems?.length || 0} distinct type(s)</p>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                            order.orderStatus === "Delivered" 
                              ? "bg-green-50 text-green-700 border-green-200"
                              : order.orderStatus === "Shipped"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {order.orderStatus === "Delivered" && <CheckCircle className="h-3.5 w-3.5" />}
                            {order.orderStatus === "Shipped" && <Truck className="h-3.5 w-3.5" />}
                            {order.orderStatus === "Processing" && <Clock className="h-3.5 w-3.5" />}
                            <span>{order.orderStatus}</span>
                          </span>
                        </td>

                        {/* Total Price */}
                        <td className="py-4 px-6 font-bold text-[#131921]">
                          ₹{order.totalPrice?.toLocaleString("en-IN")}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleOpenManage(order)}
                              className={`${amazonClasses.iconBtn} h-9 w-9 hover:bg-[#F0F8FF] hover:border-[#007185] hover:text-[#007185]`}
                              title="Manage Order"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            
                            <button 
                              onClick={() => handleDeleteOrder(order._id)}
                              className={`${amazonClasses.iconBtn} h-9 w-9 hover:bg-red-50 hover:border-red-300 hover:text-red-600`}
                              title="Delete Order"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Manage Order Modal Overlay */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className={`${amazonClasses.cardBase} w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto rounded-lg`}>
                
                {/* Modal Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                  <div>
                    <h3 className="font-extrabold text-[#131921] text-lg">Process Order</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Fulfillment workflow and transaction invoice details</p>
                  </div>
                  <button 
                    onClick={handleCloseManage} 
                    className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-md transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                  
                  {/* Order Overview info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Order Identifier</p>
                      <p className="text-xs font-mono text-gray-800 mt-0.5">{selectedOrder._id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Grand Bill Total</p>
                      <p className="text-sm font-bold text-[#131921] mt-0.5">₹{selectedOrder.totalPrice?.toLocaleString("en-IN")}</p>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div>
                    <h4 className="font-bold text-gray-500 text-xs mb-2 uppercase tracking-wide">Shipping Details</h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p><span className="font-semibold text-gray-500">Address:</span> {selectedOrder.shippingInfo?.address}</p>
                      <p><span className="font-semibold text-gray-500">Location:</span> {selectedOrder.shippingInfo?.city}, {selectedOrder.shippingInfo?.state} - {selectedOrder.shippingInfo?.pinCode}</p>
                      <p><span className="font-semibold text-gray-500">Contact Phone:</span> {selectedOrder.shippingInfo?.phoneNo}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-bold text-gray-500 text-xs mb-3 uppercase tracking-wide">Purchase Receipt</h4>
                    <div className="space-y-3">
                      {selectedOrder.orderItems?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 rounded-md border border-gray-200 bg-gray-50">
                          <div>
                            <p className="font-semibold text-sm text-[#131921]">{item.name}</p>
                            <p className="text-xs text-gray-500">Unit Cost: ₹{item.price?.toLocaleString()}</p>
                          </div>
                          <span className="text-sm font-semibold text-[#131921]">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Update Status Form */}
                  <form onSubmit={handleUpdateStatus} className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                    <div className="space-y-1.5 flex-1">
                      <label htmlFor="orderStatus" className="text-xs font-semibold text-gray-500 uppercase">Change Dispatch Status</label>
                      <select
                        id="orderStatus"
                        value={updateStatus}
                        onChange={(e) => setUpdateStatus(e.target.value)}
                        disabled={selectedOrder.orderStatus === "Delivered"}
                        className={amazonSelect}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>

                    <div className="flex gap-2 justify-end self-end sm:self-center">
                      <button 
                        type="button" 
                        onClick={handleCloseManage} 
                        className={`${amazonClasses.btnSecondary} px-5 h-10`}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={updating || selectedOrder.orderStatus === "Delivered"} 
                        className={`${amazonClasses.btnYellow} px-5 h-10 flex items-center gap-1.5 font-medium`}
                      >
                        {updating && <AmazonSpinner />}
                        <span>Update Order</span>
                      </button>
                    </div>
                  </form>

                </div>

              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
}