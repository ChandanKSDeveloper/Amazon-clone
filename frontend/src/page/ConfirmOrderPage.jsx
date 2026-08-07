import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Phone, User, ShoppingCart, CreditCard, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {amazonCheckoutBtn} from '../constants/amazonClasses.js';
import CheckoutSteps from '../components/CheckoutSteps';


export default function ConfirmOrderPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { cartItems, shippingInfo } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.user);

    const itemsPrice = cartItems.reduce((acc, item) => {
        const price = item.product?.price || item.price || 0;
        return acc + price * item.quantity;
    }, 0);
    
    const shippingPrice = itemsPrice > 1000 ? 0 : 99;
    const taxPrice = Math.round(itemsPrice * 0.18); // 18% GST
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const addressStr = `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} - ${shippingInfo.pinCode}, ${shippingInfo.country}`;

    const proceedToPayment = () => {
        navigate('/payment/process', { state: { totalPrice } });
    };

    return (
        <>
            <div className="max-w-300 mx-auto px-4 py-8">
                <CheckoutSteps activeStep={1} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
                    
                    {/* Details Column */}
                    <div className="lg:col-span-8 space-y-0">
                        
                        {/* Shipping Info Card */}
                        <div className="bg-white border border-gray-200 rounded-sm p-6 mb-2">
                            <h3 className="text-lg font-bold text-[#0F1111] mb-4 flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-[#FFD814] flex items-center justify-center text-xs font-bold text-[#0F1111]">1</div>
                                Shipping Address
                            </h3>
                            <div className="pl-9 space-y-2 text-sm text-gray-700">
                                <p className="font-bold text-[#0F1111]">{user?.name}</p>
                                <p>{addressStr}</p>
                                <p>Phone: {shippingInfo.phoneNo}</p>
                            </div>
                        </div>

                        {/* Cart Items Card */}
                        <div className="bg-white border border-gray-200 rounded-sm p-6">
                            <h3 className="text-lg font-bold text-[#0F1111] mb-4 flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-[#FFD814] flex items-center justify-center text-xs font-bold text-[#0F1111]">2</div>
                                Items in your order
                            </h3>
                            <div className="pl-9 divide-y divide-gray-200">
                                {cartItems.map((item) => {
                                    const itemName = item.product?.name || item.name;
                                    const itemImage = item.product?.images?.[0]?.url || item.image;
                                    const itemPrice = item.product?.price || item.price;

                                    return (
                                        <div key={item.product?._id || item.product} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 gap-4">
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className="w-16 h-16 rounded-sm overflow-hidden bg-gray-50 border border-gray-200 flex-shrink-0 p-1">
                                                    <img 
                                                        src={itemImage} 
                                                        alt={itemName} 
                                                        className="w-full h-full object-contain mix-blend-multiply" 
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <Link 
                                                        to={`/product/${item.product?._id || item.product}`} 
                                                        className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline line-clamp-1"
                                                    >
                                                        {itemName}
                                                    </Link>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        Qty: {item.quantity}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-sm font-bold text-[#0F1111] shrink-0">
                                                ₹{(itemPrice * item.quantity).toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Summary Column */}
                    <div className="lg:col-span-4">
                        <div className="bg-white border border-gray-200 rounded-sm p-6 sticky top-24">
                            <h3 className="text-lg font-bold text-[#0F1111] mb-4">
                                Order Summary
                            </h3>

                            <div className="space-y-3 mb-6 text-sm">
                                <div className="flex justify-between text-gray-700">
                                    <span>Items ({cartItems.reduce((acc, item) => acc + item.quantity, 0)}):</span>
                                    <span>₹{itemsPrice.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Shipping & handling:</span>
                                    <span>
                                        {shippingPrice === 0 ? (
                                            <span className="text-[#067D62] font-medium">FREE</span>
                                        ) : (
                                            `₹${shippingPrice}`
                                        )}
                                    </span>
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
                                    <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <button
                                onClick={proceedToPayment}
                                className={amazonCheckoutBtn}
                            >
                                Place your order
                            </button>

                            <p className="text-center text-xs text-gray-500 mt-4 leading-relaxed">
                                By placing your order, you agree to ShopHub's <a href="#" className="text-[#007185] hover:text-[#C7511F] hover:underline">privacy notice</a> and <a href="#" className="text-[#007185] hover:text-[#C7511F] hover:underline">conditions of use</a>.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}