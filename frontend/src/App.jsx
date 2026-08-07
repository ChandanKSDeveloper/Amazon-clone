import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store";
import { checkAuth } from "./redux/slices/userSlice";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import Navbar from "./components/common/Navbar";
import { Toaster } from "sonner";

import {
  HomePage,
  ProductPage,
  RegisterPage,
  LoginPage,
  CartPage,
  SearchPage,
  ShippingPage,
  ConfirmOrderPage,
  PaymentPage,
  MyOrderPage,
  OrderDetailsPage,
  Dashboard,
  AdminProducts,
  AdminUsers,
  NewProduct,
  ProfilePage,
  AdminOrders,
  UpdateProduct
} from "./page/index.js";

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    // Flex column ensures footer stays at the bottom
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />

      <Toaster position="top-right" richColors closeButton duration={3000} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/order/confirm" element={<ConfirmOrderPage />} />
          <Route path="/payment/process" element={<PaymentPage />} />
          <Route path="/orders/me" element={<MyOrderPage />} />
          <Route path="/order/:id" element={<OrderDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* ADMIN */}
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          {/* <Route path="/admin/product/new" element={<NewProduct />} /> */}
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/product/new" element={<UpdateProduct />} />
          <Route path="/admin/product/:id" element={<UpdateProduct />} />

        </Routes>
      </main>

      {/* <Footer /> */}
    </div>
  );
}

// A simple loading screen while redux rehydrates from localStorage
const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-[#131921] text-white text-lg flex-col gap-4">
    <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
    Loading ShopHub...
  </div>
);


export default function App() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        {/* PersistGate delays rendering until persistor has rehydrated state */}
        <PersistGate loading={<LoadingFallback />} persistor={persistor}>
          <AppContent />
        </PersistGate>
      </Provider>
    </BrowserRouter>
  );
}
