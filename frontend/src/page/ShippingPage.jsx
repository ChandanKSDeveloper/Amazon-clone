import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Building2, Home, Compass, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingInfo } from '../redux/slices/cartSlice';
import CheckoutSteps from '../components/CheckoutSteps.jsx';
import {amazonSelect, amazonInput, amazonCheckoutBtn} from "../constants/amazonClasses.js"

const countries = [
    { code: "IN", name: "India" },
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "CA", name: "Canada" },
    { code: "AU", name: "Australia" }
];

export default function ShippingPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { shippingInfo } = useSelector((state) => state.cart);

    const [address, setAddress] = useState(shippingInfo.address || '');
    const [city, setCity] = useState(shippingInfo.city || '');
    const [state, setState] = useState(shippingInfo.state || '');
    const [country, setCountry] = useState(shippingInfo.country || 'IN');
    const [pinCode, setPinCode] = useState(shippingInfo.pinCode || '');
    const [phoneNo, setPhoneNo] = useState(shippingInfo.phoneNo || '');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!address || !city || !state || !country || !pinCode || !phoneNo) {
            toast.error('Please fill in all shipping details');
            return;
        }

        if (phoneNo.length !== 10 || isNaN(phoneNo)) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }

        if (isNaN(pinCode)) {
            toast.error('Please enter a valid numeric PIN/postal code');
            return;
        }

        dispatch(saveShippingInfo({ address, city, state, country, pinCode, phoneNo }));
        navigate('/order/confirm');
    };

    return (
        <>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <CheckoutSteps activeStep={0} />

                <div className="bg-white border border-gray-200 rounded-sm p-6 md:p-8 mt-6 shadow-sm">
                    <h2 className="text-2xl font-bold text-[#0F1111] mb-8">
                        Add a new address
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Country / Region - Amazon puts this first */}
                        <div>
                            <label className="block text-xs font-bold text-[#0F1111] mb-1.5">
                                Country/Region
                            </label>
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                required
                                className={amazonSelect}
                            >
                                {countries.map((c) => (
                                    <option key={c.code} value={c.code}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Full Name (Optional but standard for Amazon) - Skipped to match your exact fields */}

                        {/* Street Address */}
                        <div>
                            <label className="block text-xs font-bold text-[#0F1111] mb-1.5">
                                Street address
                            </label>
                            <input
                                type="text"
                                placeholder="Flat/House No., Building, Street, Area"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                                className={amazonInput}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* City */}
                            <div>
                                <label className="block text-xs font-bold text-[#0F1111] mb-1.5">
                                    City
                                </label>
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    required
                                    className={amazonInput}
                                />
                            </div>

                            {/* State / Province / Region */}
                            <div>
                                <label className="block text-xs font-bold text-[#0F1111] mb-1.5">
                                    State / Province / Region
                                </label>
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    required
                                    className={amazonInput}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* ZIP Code */}
                            <div>
                                <label className="block text-xs font-bold text-[#0F1111] mb-1.5">
                                    ZIP / Postal Code
                                </label>
                                <input
                                    type="text"
                                    placeholder="110001"
                                    value={pinCode}
                                    onChange={(e) => setPinCode(e.target.value)}
                                    required
                                    className={amazonInput}
                                />
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-xs font-bold text-[#0F1111] mb-1.5">
                                    Phone number
                                </label>
                                <input
                                    type="tel"
                                    placeholder="10-digit mobile number"
                                    value={phoneNo}
                                    onChange={(e) => setPhoneNo(e.target.value)}
                                    required
                                    className={amazonInput}
                                />
                            </div>
                        </div>

                        {/* Amazon's delivery disclaimer text */}
                        <div className="bg-[#F6F6F6] border border-gray-200 rounded-sm p-4 text-sm text-gray-700">
                            <p><strong>Delivery address:</strong> This address will be used for this order and can be saved to your address book for future use.</p>
                        </div>

                        <button
                            type="submit"
                            className={amazonCheckoutBtn}
                        >
                            Use this address
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}