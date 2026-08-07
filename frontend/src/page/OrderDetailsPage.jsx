import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Package, MapPin, CreditCard, Calendar, Truck, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { amazonClasses } from "../constants/amazonClasses.js"; 
import { useDispatch, useSelector } from "react-redux";
import { getOrderDetails } from "../redux/slices/orderSlice.js"; 

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

const OrderDetailsPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { order, loading, error } = useSelector((state) => state.order);

    useEffect(() => {
        if (id) {
            dispatch(getOrderDetails(id));
        }
    }, [id, dispatch]);

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (status) => {
        const config = statusConfig[status] || statusConfig.Processing;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${config.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
                {status}
            </span>
        );
    };

    if (loading) return <OrderDetailsSkeleton />;

    if (error) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4 bg-white">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                        <ShieldAlert className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Failed to load order details</h2>
                    <p className="text-gray-500">{error}</p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/orders/me">
                            <button className={`${amazonClasses.btnSecondary} gap-2 px-4 py-2 inline-flex items-center`}>
                                <ArrowLeft className="w-4 h-4" /> Back to My Orders
                            </button>
                        </Link>
                        <button onClick={() => dispatch(getOrderDetails(id))} className={`${amazonClasses.btnYellow} px-4 py-2`}>
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4 bg-white">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto">
                        <Package className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Order not found</h2>
                    <p className="text-gray-500">We couldn't find the order you were looking for.</p>
                    <Link to="/orders/me">
                        <button className={`${amazonClasses.btnYellow} gap-2 px-4 py-2 inline-flex items-center`}>
                            <ArrowLeft className="w-4 h-4" /> Back to My Orders
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    const isProcessing = true;
    const isShipped = order.orderStatus === "Shipped" || order.orderStatus === "Delivered";
    const isDelivered = order.orderStatus === "Delivered";

    const addressStr = `${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.state}, ${order.shippingInfo.pinCode}, ${order.shippingInfo.country}`;

    return (
        <>

            <div className="min-h-screen bg-gray-50 py-8 md:py-12">
                <div className="max-w-6xl mx-auto px-4">
                    {/* Back button & Title */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2">
                            <Link
                                to="/orders/me"
                                className="inline-flex items-center gap-1.5 text-sm text-[#007185] hover:text-[#C7511F] hover:underline transition-colors mb-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to My Orders
                            </Link>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    Order <span className="font-mono font-medium">#{order._id.toUpperCase()}</span>
                                </h1>
                                {getStatusBadge(order.orderStatus)}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" /> Placed on {formatDate(order.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Stepper */}
                    <div className={`${amazonClasses.cardBase} p-6 mb-8`}>
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Status Timeline</h2>
                        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
                            <div className="hidden md:block absolute left-0 right-0 top-1/2 h-0.5 -translate-y-4 bg-gray-200 -z-0 mx-16">
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-500"
                                    style={{ width: isDelivered ? "100%" : isShipped ? "50%" : "0%" }}
                                />
                            </div>

                            {/* Step 1: Processing */}
                            <div className="flex md:flex-col items-center gap-4 md:gap-2 md:text-center flex-1 z-10 w-full">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${isProcessing ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-gray-300 text-gray-400"}`}>
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-900">Processing</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">Order confirmed</p>
                                </div>
                            </div>

                            {/* Step 2: Shipped */}
                            <div className="flex md:flex-col items-center gap-4 md:gap-2 md:text-center flex-1 z-10 w-full">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${isShipped ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-gray-300 text-gray-400"}`}>
                                    <Truck className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-900">Shipped</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">In transit</p>
                                </div>
                            </div>

                            {/* Step 3: Delivered */}
                            <div className="flex md:flex-col items-center gap-4 md:gap-2 md:text-center flex-1 z-10 w-full">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${isDelivered ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-gray-300 text-gray-400"}`}>
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-900">Delivered</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {isDelivered ? formatDate(order.deliveredAt) : "Pending delivery"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left/Middle Columns: Details */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Shipping Information */}
                            <div className={`${amazonClasses.cardBase} p-6`}>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-gray-700" /> Delivery Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Recipient Name</p>
                                        <p className="font-medium text-gray-900 text-base">{order.user?.name || "N/A"}</p>
                                        <p className="text-xs mt-0.5">{order.user?.email || ""}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Phone Number</p>
                                        <p className="font-medium text-gray-900 text-base">{order.shippingInfo.phoneNo}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Shipping Address</p>
                                        <p className="font-medium text-gray-900 text-base leading-relaxed">{addressStr}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className={`${amazonClasses.cardBase} p-6`}>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-gray-700" /> Payment details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Payment Status</p>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${
                                            order.paymentInfo.status === "succeeded" || order.paymentInfo.status === "PAID"
                                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                                : "bg-amber-100 text-amber-800 border-amber-200"
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                order.paymentInfo.status === "succeeded" || order.paymentInfo.status === "PAID" ? "bg-emerald-500" : "bg-amber-500"
                                            }`} />
                                            {order.paymentInfo.status === "succeeded" || order.paymentInfo.status === "PAID" ? "PAID" : "PENDING"}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Transaction ID</p>
                                        <p className="font-mono text-xs text-gray-700 break-all select-all font-medium py-1 bg-gray-50 px-2 rounded mt-1">{order.paymentInfo.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Paid Time</p>
                                        <p className="font-medium text-gray-900">{formatDate(order.paidAt)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className={`${amazonClasses.cardBase} p-6`}>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Order Items ({order.orderItems.length})
                                </h3>
                                <div className="divide-y divide-gray-100">
                                    {order.orderItems.map((item) => (
                                        <div key={item._id || item.product} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <Link
                                                        to={`/product/${item.product}`}
                                                        className="font-semibold text-[#007185] hover:text-[#C7511F] hover:underline transition-colors line-clamp-2 text-sm md:text-base"
                                                    >
                                                        {item.name}
                                                    </Link>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        ₹{item.price.toLocaleString("en-IN")} × {item.quantity}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right font-bold text-gray-900 whitespace-nowrap">
                                                ₹{(item.price * item.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Order Summary */}
                        <div className="lg:col-span-1">
                            <div className={`${amazonClasses.cardBase} p-6 sticky top-24`}>
                                <h3 className="text-lg font-bold text-gray-900 border-b pb-4 mb-4">
                                    Price Summary
                                </h3>

                                <div className="space-y-4 mb-6 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Items Price</span>
                                        <span className="font-semibold text-gray-900">₹{order.itemsPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping Charge</span>
                                        <span className="font-semibold text-gray-900">
                                            {order.shippingPrice === 0 ? <span className="text-green-600">Free</span> : `₹${order.shippingPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>GST (18% included)</span>
                                        <span className="font-semibold text-gray-900">₹{order.taxPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-bold text-gray-900 pt-4 border-t">
                                        <span>Total Paid</span>
                                        <span className="text-lg text-gray-900">₹{order.totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Link to="/orders/me" className="w-full">
                                        <button className={`${amazonClasses.btnSecondary} w-full justify-center gap-2 py-2.5 inline-flex items-center`}>
                                            <Package className="w-4 h-4" /> View All Orders
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Pure Tailwind Skeleton Loader
function OrderDetailsSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 py-8 md:py-12">
            <div className="max-w-6xl mx-auto px-4">
                <div className="mb-8 space-y-3">
                    <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-60 bg-gray-200 animate-pulse rounded" />
                        <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full" />
                    </div>
                    <div className="h-4 w-48 bg-gray-200 animate-pulse rounded" />
                </div>

                <div className={`${amazonClasses.cardBase} p-6 mb-8`}>
                    <div className="h-5 w-48 bg-gray-200 animate-pulse rounded mb-6" />
                    <div className="flex flex-col md:flex-row gap-6 md:gap-2 justify-between">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex md:flex-col items-center gap-4 md:gap-2 flex-1">
                                <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
                                <div className="space-y-1.5 md:text-center w-full">
                                    <div className="h-4 w-24 bg-gray-200 animate-pulse rounded md:mx-auto" />
                                    <div className="h-3 w-32 bg-gray-200 animate-pulse rounded md:mx-auto" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {[...Array(3)].map((_, idx) => (
                            <div key={idx} className={`${amazonClasses.cardBase} p-6`}>
                                <div className="h-6 w-40 bg-gray-200 animate-pulse rounded mb-4" />
                                <div className="space-y-3">
                                    <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                                    <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded" />
                                    <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="lg:col-span-1">
                        <div className={`${amazonClasses.cardBase} p-6`}>
                            <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-4" />
                            <div className="space-y-3 mb-6">
                                <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                                <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                                <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                            </div>
                            <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderDetailsPage;