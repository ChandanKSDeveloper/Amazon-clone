import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  User,
  Package,
  LayoutDashboard,
  LogOut,
  ShoppingCart
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import {logoutUser} from "../../redux/slices/userSlice.js";

const amazonInputClasses = `
  h-10 w-full pl-4 pr-12 rounded-l-md border-none outline-none 
  text-sm text-black bg-white
  focus:ring-2 focus:ring-yellow-500 focus:z-10
`;

const amazonSearchBtnClasses = `
  h-10 px-4 rounded-r-md border-none outline-none 
  bg-[#FEBD69] hover:bg-[#F3A847] active:bg-[#F09000] 
  text-black flex items-center justify-center
`;

const amazonNavLinkClasses = `
  flex flex-col items-start px-3 py-1.5 rounded-sm 
  text-white hover:outline hover:outline-1 hover:outline-white transition-colors
`;

const amazonIconBtnClasses = `
  flex items-center gap-2 px-3 py-1.5 rounded-sm 
  text-white hover:outline hover:outline-1 hover:outline-white transition-colors
`;

// -------------------------------
export default function Navbar() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();


  const {isAuthenticated, user, loading, authChecked} = useSelector((state) => state.user);
  const {cartItems} = useSelector((state) => state.cart);
  const cartItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  // Clear search when navigating away from search page
  useEffect(() => {
    if (!location.pathname.includes("/search")) {
      setSearchTerm("");
    }
    setIsProfileMenuOpen(false);
  }, [location]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isProfileMenuOpen && !e.target.closest(".profile-dropdown")) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isProfileMenuOpen]);


  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    await dispatch(logoutUser());
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      console.log("hello");
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const renderUserButton = () => {
    // Still checking auth - show loading
    if (!authChecked || loading) {
      return (
        <button className={amazonIconBtnClasses} disabled>
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        </button>
      );
    }

    // Authenticated - show profile menu
    if (isAuthenticated && user) {
      return (
        <div className="relative profile-dropdown">
          <button
            className={amazonIconBtnClasses}
            onClick={(e) => {
              e.stopPropagation();
              setIsProfileMenuOpen(!isProfileMenuOpen);
            }}
          >
            {user.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover ring-1 ring-white/50"
              />
            ) : (
              <User className="h-6 w-6 text-white" />
            )}
            <div className="flex flex-col items-start text-white leading-tight">
              <span className="text-[11px] text-gray-300">
                Hello, {user.name?.split(" ")[0] || "User"}
              </span>
              <span className="text-sm font-bold">Account & Lists</span>
            </div>
          </button>

          {/* Dropdown Menu - Styled like Amazon's mega menu box */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-0 w-56 rounded-sm bg-white text-black shadow-2xl border border-gray-200 z-50 py-2">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-sm font-bold truncate">{user.name}</p>
                <p className="text-xs text-gray-600 truncate">{user.email}</p>
              </div>
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#E3E6E6] transition-colors"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <User className="h-4 w-4 text-gray-600" /> My Profile
              </Link>
              <Link
                to="/orders/me"
                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#E3E6E6] transition-colors"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <Package className="h-4 w-4 text-gray-600" /> My Orders
              </Link>
              {user?.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#E3E6E6] text-indigo-600 font-semibold transition-colors"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                </Link>
              )}
              <div className="border-t border-gray-200 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-[#E3E6E6] transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Not authenticated - show login button
    return (
      <Link to="/login" className={amazonNavLinkClasses}>
        <span className="text-[11px] text-gray-300">Hello, Sign in</span>
        <span className="text-sm font-bold">Account & Lists</span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#111921]">
      <div className="flex items-center h-14 max-w-375 mx-auto px-4 gap-2">
        {/* Left logo */}
        <Link
          to="/"
          className="flex items-center px-2 py-1.5 border border-transparent hover:border-white rounded-sm transition-colors mr-2"
        >
          <span className="text-white text-2xl font-bold tracking-tight">
            ShopHub
          </span>
          <span className="text-white text-[10px] ml-1 mt-3">.in</span>
        </Link>

        {/* center search bar */}
        <form
          onSubmit={handleSearch}
          className="flex flex-1 max-w-3xl h-10 rounded-md overflow-hidden shadow-sm"
        >
          <input
            type="text"
            placeholder="Search bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={amazonInputClasses}
          />
          <button type="submit" className={amazonSearchBtnClasses}>
            <Search className="h-5 w-5 text-[#0F1111]" />
          </button>
        </form>

        {/* right actions */}
        <div className="flex items-center ml-2 gap-1">
          {renderUserButton()}

          {/* orders links */}
           <Link to="/orders/me" className={amazonNavLinkClasses}>
            <span className="text-[11px] text-gray-300">Returns</span>
            <span className="text-sm font-bold">& Orders</span>
          </Link>

          {/* Cart Link */}
          <Link to="/cart" className="flex items-end gap-1 px-3 py-1.5 rounded-sm text-white hover:outline hover:outline-1 hover:outline-white transition-colors">
            <div className="relative">
              <ShoppingCart className="h-8 w-8 text-white" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 bg-[#F08804] text-[#0F1111] text-sm font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                  {cartItemsCount}
                </span>
              )}
            </div>
            <span className="text-sm font-bold hidden lg:block">Cart</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
