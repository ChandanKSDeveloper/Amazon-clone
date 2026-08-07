import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Mail,
  Save,
  Lock,
  LogOut,
  Camera,
  ShieldCheck,
  KeyRound,
  ShoppingBag,
  Calendar,
  Truck,
  CreditCard,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { amazonClasses, amazonInput, amazonPrimaryBtn } from "../constants/amazonClasses.js";
import {
  updateProfile,
  updatePassword,
  logoutUser,
  clearMessage,
} from "../redux/slices/userSlice.js";

import { getMyOrders } from "../redux/slices/orderSlice.js";
import AmazonSpinner from "../components/products/AmazonSpinner.jsx";
const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, loading, error, message, isUpdating } = useSelector(
    (state) => state.user,
  );
  const { orders, loading: ordersLoading } = useSelector(
    (state) => state.order,
  );

  const [activeTab, setActiveTab] = useState("profile");
  const [expandedOrder, setExpandedOrder] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarToUpload, setAvatarToUpload] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
      });
      setAvatarPreview(user.avatar?.url || null);
    }
  }, [user]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
    }
    if (error) {
      toast.error(error);
    }
  }, [message, error, dispatch, clearMessage]);

  useEffect(() => {
    if (activeTab === "orders") {
      dispatch(getMyOrders());
    }
  }, [activeTab, dispatch]);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
        setAvatarToUpload(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await dispatch(updateProfile(profileForm)).unwrap();
    } catch (err) {
      toast.error(err || "Failed to update profile.");
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (
      !passwordForm.oldPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await dispatch(
        updatePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
      ).unwrap();

      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err || "Failed to update password.");
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (err) {
      toast.error("Failed to logout.");
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EAEDED]">
        <AmazonSpinner className="h-12 w-12 text-[#FF9900]" />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-[#EAEDED] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header & Avatar Section */}
          <div className={`${amazonClasses.cardBase} p-6 mb-6`}>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-lg">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white"
                >
                  <Camera className="w-6 h-6" />
                </button>
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  ref={fileInputRef}
                  className="hidden"
                />
              </div>

              {/* User Info Summary */}
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold text-[#131921]">
                  {user.name}
                </h1>
                <p className="text-gray-600 mt-1">{user.email}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 bg-[#232F3E] text-[#FF9900] text-xs font-medium px-3 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {user.role === "admin" ? "Administrator" : "Member"}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex gap-2 mb-6 border-b border-gray-300">
            {[
              { id: "profile", label: "Profile", icon: User },
              { id: "password", label: "Security", icon: KeyRound },
              { id: "orders", label: "My Orders", icon: ShoppingBag },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                    activeTab === tab.id
                      ? "border-[#FF9900] text-[#131921]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Profile Tab Content */}
          {activeTab === "profile" && (
            <form
              onSubmit={handleUpdateProfile}
              className={`${amazonClasses.cardBase} p-6`}
            >
              <h2 className="text-lg font-semibold text-[#131921] mb-6">
                Personal Information
              </h2>
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="name"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      className={`${amazonInput} pl-10`}
                      placeholder="John Doe"
                      disabled={isUpdating}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      className={`${amazonInput} pl-10`}
                      placeholder="john@example.com"
                      disabled={isUpdating}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className={`${amazonPrimaryBtn} w-full sm:w-auto px-6 py-2 flex items-center justify-center gap-2`}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <AmazonSpinner className="h-4 w-4" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isUpdating ? "Saving Changes..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Orders Tab Content */}
          {activeTab === "orders" && (
            <div className={`${amazonClasses.cardBase} p-6`}>
              <h2 className="text-lg font-semibold text-[#131921] mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#FF9900]" /> Order History
              </h2>

              {ordersLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AmazonSpinner className="h-8 w-8 text-[#FF9900] mb-2" />
                  <p className="text-sm text-gray-600">
                    Loading your orders...
                  </p>
                </div>
              ) : !orders || orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
                    <ShoppingBag className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-base font-semibold text-[#131921] mb-1">
                    No Orders Found
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    You haven't placed any orders yet. Let's find some amazing
                    products!
                  </p>
                  <Link to="/">
                    <button
                      className={`${amazonClasses.btnYellow} px-6 py-2 text-sm`}
                    >
                      Start Shopping
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((ord) => (
                    <div
                      key={ord._id}
                      className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                    >
                      {/* Order Header */}
                      <div
                        onClick={() =>
                          setExpandedOrder(
                            expandedOrder === ord._id ? null : ord._id,
                          )
                        }
                        className="bg-gray-50 p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-sm cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                          <div>
                            <span className="block text-xs text-gray-500 font-medium uppercase">
                              Order ID
                            </span>
                            <span className="font-mono text-gray-700 font-semibold text-xs">
                              #{ord._id}
                            </span>
                          </div>
                          <div>
                            <span className="block text-xs text-gray-500 font-medium uppercase">
                              Date Placed
                            </span>
                            <span className="font-medium text-gray-700 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              {new Date(
                                ord.createdAt || ord.paidAt,
                              ).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <div>
                            <span className="block text-xs text-gray-500 font-medium uppercase">
                              Total Price
                            </span>
                            <span className="font-bold text-[#131921]">
                              ₹{ord.totalPrice?.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              ord.orderStatus === "Delivered"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : ord.orderStatus === "Shipped"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }`}
                          >
                            {ord.orderStatus}
                          </span>
                          {expandedOrder === ord._id ? (
                            <ChevronUp className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="divide-y divide-gray-100 px-4 py-1">
                        {ord.orderItems?.map((item) => (
                          <div
                            key={item.product}
                            className="flex items-center justify-between py-3 gap-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <Link
                                  to={`/product/${item.product}`}
                                  className="text-sm font-semibold text-[#007185] hover:text-[#C7511F] hover:underline transition-colors line-clamp-1"
                                >
                                  {item.name}
                                </Link>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Quantity: {item.quantity} × ₹
                                  {item.price?.toLocaleString("en-IN")}
                                </p>
                              </div>
                            </div>
                            <div className="text-right font-semibold text-sm text-[#131921]">
                              ₹
                              {(item.price * item.quantity).toLocaleString(
                                "en-IN",
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Expanded Details */}
                      {expandedOrder === ord._id && (
                        <div className="bg-gray-50/50 p-5 border-t border-gray-200 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Shipping Details */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <Truck className="h-4 w-4 text-[#FF9900]" />{" "}
                                Shipping Address
                              </h4>
                              <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm space-y-1 shadow-sm">
                                <p className="font-semibold text-[#131921]">
                                  {user?.name}
                                </p>
                                <p className="text-gray-700">
                                  {ord.shippingInfo?.address}
                                </p>
                                <p className="text-gray-700">
                                  {ord.shippingInfo?.city},{" "}
                                  {ord.shippingInfo?.state} -{" "}
                                  {ord.shippingInfo?.pinCode}
                                </p>
                                <p className="text-gray-700">
                                  {ord.shippingInfo?.country}
                                </p>
                                <p className="text-xs text-gray-500 mt-2 font-medium pt-1 border-t border-gray-100">
                                  Phone: {ord.shippingInfo?.phoneNo}
                                </p>
                              </div>
                            </div>

                            {/* Payment Info & Estimated Arrival */}
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                  <CreditCard className="h-4 w-4 text-[#FF9900]" />{" "}
                                  Payment Method
                                </h4>
                                <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm shadow-sm">
                                  <p className="font-medium text-[#131921]">
                                    Online Payment
                                  </p>
                                  <p className="text-xs text-gray-500 font-mono mt-1">
                                    ID: {ord.paymentInfo?.id}
                                  </p>
                                  <span className="inline-flex items-center gap-1.5 text-xs text-green-600 font-semibold mt-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5" />{" "}
                                    Paid Succeeded
                                  </span>
                                </div>
                              </div>

                              <div className="bg-[#FFF8E1] p-4 rounded-lg border border-[#FFD814]/30">
                                <p className="text-xs text-[#B48B00] font-bold uppercase tracking-wider">
                                  Arrival Status
                                </p>
                                <p className="text-sm font-semibold text-[#131921] mt-1">
                                  {ord.orderStatus === "Delivered" ? (
                                    <span className="text-green-600">
                                      Delivered on{" "}
                                      {new Date(
                                        ord.deliveredAt || ord.updatedAt,
                                      ).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      })}
                                    </span>
                                  ) : (
                                    <span>
                                      Estimated Delivery:{" "}
                                      <strong className="text-[#131921]">
                                        {new Date(
                                          new Date(
                                            ord.createdAt || ord.paidAt,
                                          ).getTime() +
                                            4 * 24 * 60 * 60 * 1000,
                                        ).toLocaleDateString("en-IN", {
                                          day: "numeric",
                                          month: "long",
                                          year: "numeric",
                                        })}
                                      </strong>
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Password Tab Content */}
          {activeTab === "password" && (
            <form
              onSubmit={handleUpdatePassword}
              className={`${amazonClasses.cardBase} p-6`}
            >
              <h2 className="text-lg font-semibold text-[#131921] mb-1">
                Update Password
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Ensure your account is using a strong password.
              </p>
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="oldPassword"
                    className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
                  >
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="oldPassword"
                      name="oldPassword"
                      type="password"
                      value={passwordForm.oldPassword}
                      onChange={handlePasswordChange}
                      className={`${amazonInput} pl-10`}
                      placeholder="••••••••"
                      disabled={isUpdating}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className={`${amazonInput} pl-10`}
                      placeholder="••••••••"
                      disabled={isUpdating}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`${amazonInput} pl-10`}
                      placeholder="••••••••"
                      disabled={isUpdating}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className={`${amazonClasses.btnSecondary} w-full sm:w-auto px-6 py-2 flex items-center justify-center gap-2`}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <AmazonSpinner className="h-4 w-4" />
                    ) : (
                      <KeyRound className="h-4 w-4" />
                    )}
                    {isUpdating ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Danger Zone */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-red-200 p-6">
            <h2 className="text-lg font-semibold text-red-600 mb-2">
              Danger Zone
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Once you log out, you will need to enter your credentials again to
              access your account.
            </p>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
