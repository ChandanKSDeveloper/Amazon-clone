import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { CreditCard, Lock, ShieldCheck, Building2, Banknote, Loader2, CheckCircle2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { clearLocalCart } from '../redux/slices/cartSlice';
import { createOrder } from '../redux/slices/orderSlice'; // Assuming you will migrate this next
import CheckoutSteps from '../components/CheckoutSteps.jsx';
import api from '../config/axios.js';
import {amazonInput, amazonCheckoutBtn} from '../constants/amazonClasses.js';


export default function Payment() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    // Redux State
    const { cartItems, shippingInfo } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.user);
    
    // Get total price passed from ConfirmOrder page
    const totalPrice = location.state?.totalPrice || 0;

    const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod'
    const [processing, setProcessing] = useState(false);

    // ─── Price Calculations (Fallback if state is missing) ─────────────
    const itemsPrice = cartItems.reduce((acc, item) => {
        const price = item.product?.price || item.price || 0;
        return acc + price * item.quantity;
    }, 0);
    
    const shippingPrice = itemsPrice > 1000 ? 0 : 99;
    const taxPrice = Math.round(itemsPrice * 0.18);
    const finalTotal = totalPrice > 0 ? totalPrice : (itemsPrice + shippingPrice + taxPrice);

    // ─── Load Razorpay Script ──────────────────────────────────────────
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // ─── Direct Checkout Helper (Creates order in DB) ─────────────────
    const placeOrder = async (paymentId, methodLabel, status = 'succeeded') => {
        const orderData = {
            orderItems: cartItems.map((item) => ({
                name: item.product?.name || item.name,
                price: item.product?.price || item.price,
                quantity: item.quantity,
                image: item.product?.images?.[0]?.url || item.image,
                product: item.product?._id || item.product,
            })),
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice: finalTotal,
            paymentInfo: {
                id: paymentId,
                status: status,
            },
        };

        const orderResult = await dispatch(createOrder(orderData));

        // Redux toolkit resolves .meta.requestStatus
        if (orderResult.meta.requestStatus === 'fulfilled') {
            dispatch(clearLocalCart());
            toast.success(`Order placed successfully using ${methodLabel}!`);
            navigate('/orders/me');
        } else {
            toast.error(orderResult.payload || 'Order creation failed');
        }
    };

    // ─── Razorpay Submit ───────────────────────────────────────────────
    const handleRazorpaySubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            // 1. Create Order on Backend to get Razorpay Order ID
            const { data } = await api.post('/payment/process', {
                amount: Math.round(finalTotal * 100), // Amount in paise
            });

            const options = {
                key: data.key_id, // Razorpay Key ID from backend
                amount: data.amount,
                currency: 'INR',
                name: 'ShopHub',
                description: `Order Payment`,
                image: 'https://your-logo-url.com/logo.png', // Replace with your logo
                order_id: data.order_id, // Razorpay Order ID from backend
                handler: async (response) => {
                    // 2. Verify Payment on Backend (Crucial for security)
                    try {
                        const verifyRes = await api.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        // 3. Place Order in Database if verification succeeds
                        if (verifyRes.data.success) {
                            await placeOrder(response.razorpay_payment_id, 'Razorpay');
                        } else {
                            toast.error('Payment verification failed.');
                            setProcessing(false);
                        }
                    } catch (error) {
                        toast.error(error.response?.data?.message || 'Verification failed.');
                        setProcessing(false);
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: shippingInfo.phoneNo,
                },
                theme: {
                    color: '#131921', // Amazon dark header color
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false);
                        toast.error('Payment cancelled by user.');
                    }
                }
            };

            // Open Razorpay Checkout Modal
            const razorpayWindow = new window.Razorpay(options);
            razorpayWindow.open();

        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to initiate Razorpay. Please try again.');
            setProcessing(false);
        }
    };

    // ─── COD Submit ────────────────────────────────────────────────────
    const handleCodSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            // You can skip the backend payment call for COD, or hit it if your backend requires it
            await placeOrder(`COD_${Date.now()}`, 'Cash On Delivery', 'Pending');
        } catch (error) {
            toast.error('Failed to place order.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <div className="max-w-[1200px] mx-auto px-4 py-8">
                <CheckoutSteps activeStep={2} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
                    
                    {/* Payment Methods Column */}
                    <div className="lg:col-span-8">
                        <div className="bg-white border border-gray-200 rounded-sm p-6">
                            <h3 className="text-xl font-bold text-[#0F1111] mb-6">Select a payment method</h3>

                            <div className="space-y-4">
                                {/* Razorpay Option */}
                                <label className={`flex items-start gap-4 p-4 border rounded-sm cursor-pointer transition-colors ${
                                    paymentMethod === 'razorpay' ? 'border-[#007185] bg-[#F0F2F2]' : 'border-gray-300 hover:border-gray-400'
                                }`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="razorpay"
                                        checked={paymentMethod === 'razorpay'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="mt-1 h-4 w-4 text-[#007185] focus:ring-[#007185] border-gray-300"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-5 w-5 text-[#0F1111]" />
                                            <span className="font-bold text-sm text-[#0F1111]">UPI, Cards & More (Razorpay)</span>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1 ml-7">
                                            Pay using Credit/Debit Cards, UPI, Netbanking, or Wallets. Fast and secure.
                                        </p>
                                    </div>
                                </label>

                                {/* COD Option */}
                                <label className={`flex items-start gap-4 p-4 border rounded-sm cursor-pointer transition-colors ${
                                    paymentMethod === 'cod' ? 'border-[#007185] bg-[#F0F2F2]' : 'border-gray-300 hover:border-gray-400'
                                }`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="mt-1 h-4 w-4 text-[#007185] focus:ring-[#007185] border-gray-300"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Banknote className="h-5 w-5 text-[#0F1111]" />
                                            <span className="font-bold text-sm text-[#0F1111]">Cash on Delivery (COD)</span>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1 ml-7">
                                            Pay when your order is delivered. Recommended for testing the purchase flow.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* Action Button */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                {paymentMethod === 'razorpay' ? (
                                    <form onSubmit={handleRazorpaySubmit}>
                                        <button
                                            type="submit"
                                            disabled={processing || finalTotal === 0}
                                            className={amazonCheckoutBtn}
                                        >
                                            {processing ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    Opening Razorpay...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Lock className="h-4 w-4" />
                                                    Pay ₹{finalTotal.toLocaleString('en-IN')} with Razorpay
                                                </span>
                                            )}
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleCodSubmit}>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className={amazonCheckoutBtn}
                                        >
                                            {processing ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    Placing Order...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Place Order (COD)
                                                </span>
                                            )}
                                        </button>
                                    </form>
                                )}

                                <p className="text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
                                    <ShieldCheck className="h-4 w-4 text-[#067D62]" />
                                    Your transaction is secured with industry-standard encryption
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="bg-white border border-gray-200 rounded-sm p-6 sticky top-24">
                            <h3 className="text-lg font-bold text-[#0F1111] mb-4">
                                Order Summary
                            </h3>

                            <div className="divide-y divide-gray-200 max-h-[250px] overflow-y-auto mb-4 pr-1">
                                {cartItems.map((item) => {
                                    const itemName = item.product?.name || item.name;
                                    const itemImage = item.product?.images?.[0]?.url || item.image;
                                    const itemPrice = item.product?.price || item.price;

                                    return (
                                        <div key={item.product?._id || item.product} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-sm overflow-hidden bg-gray-50 border border-gray-200 flex-shrink-0 p-0.5">
                                                    <img src={itemImage} alt={itemName} className="w-full h-full object-contain mix-blend-multiply" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm text-[#0F1111] truncate max-w-[160px]">{itemName}</p>
                                                    <p className="text-xs text-gray-500">{item.quantity} × ₹{itemPrice.toLocaleString('en-IN')}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-[#0F1111] whitespace-nowrap">
                                                ₹{(itemPrice * item.quantity).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-2 pt-4 border-t border-gray-200 text-sm">
                                <div className="flex justify-between text-gray-700">
                                    <span>Items ({cartItems.reduce((acc, item) => acc + item.quantity, 0)}):</span>
                                    <span>₹{itemsPrice.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Shipping & handling:</span>
                                    <span>{shippingPrice === 0 ? <span className="text-[#067D62]">FREE</span> : `₹${shippingPrice}`}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Total before tax:</span>
                                    <span>₹{(itemsPrice + shippingPrice).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Estimated tax (18%):</span>
                                    <span>₹{taxPrice.toLocaleString('en-IN')}</span>
                                </div>
                                
                                <div className="flex justify-between text-lg font-bold text-[#C7511F] pt-4 border-t border-gray-200 mt-4">
                                    <span>Order total:</span>
                                    <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}