import React, { useState } from "react";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Users,
  Star,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";

import { useLocation,Link } from "react-router-dom";
const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const location = useLocation();

  const links = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Create Product", path: "/admin/product/new", icon: PlusCircle },
    { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
    { name: "Users", path: "/admin/users", icon: Users },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#232F3E] border-r border-[#131921] text-white">
      <div className="flex items-center justify-between p-6 border-b border-[#3b4a5c]">
        <Link
          to="/"
          className="flex items-center gap-2 text-[#FF9900] hover:text-[#FFB84D] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Back to Shop
          </span>
        </Link>
      </div>

      <div className="px-6 py-5 border-b border-[#3b4a5c]">
        <h2 className="text-xl font-extrabold tracking-tight text-white">
          Admin <span className="text-[#FF9900]">Panel</span>
        </h2>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#FF9900] text-[#131921] shadow-sm"
                  : "text-gray-300 hover:bg-[#3b4a5c] hover:text-white"
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`}
              />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-[#3b4a5c] text-[11px] text-gray-500 text-center">
        &copy; {new Date().getFullYear()} ShopHub Admin
      </div>
    </div>
  );
  return (
  <>
     <aside className="hidden md:block w-64 min-h-screen sticky top-0 h-screen overflow-hidden flex-shrink-0">
        {sidebarContent}
      </aside>
  </>);
};


export default AdminSidebar;