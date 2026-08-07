import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar.jsx";
import api from "../../config/axios.js";
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  IndianRupee, 
  AlertCircle 
} from "lucide-react";

// Pure Tailwind Spinner
const AmazonSpinner = () => (
  <svg className="animate-spin h-10 w-10 text-[#FF9900]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const { data } = await api.get("/admin/stats");
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Compute daily sales data for the SVG chart
  const getChartData = () => {
    if (!stats || !stats.orders || stats.orders.length === 0) return [];
    
    const dailyMap = {};
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split("T")[0];
      dailyMap[dateString] = 0;
    }

    stats.orders.forEach(order => {
      const dateString = new Date(order.createdAt).toISOString().split("T")[0];
      if (dailyMap[dateString] !== undefined) {
        dailyMap[dateString] += order.totalPrice;
      } else {
        dailyMap[dateString] = order.totalPrice;
      }
    });

    return Object.keys(dailyMap)
      .sort()
      .map(date => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        amount: dailyMap[date]
      }));
  };

  const chartData = getChartData();

  const generateSvgPoints = (data, width = 600, height = 200) => {
    if (data.length === 0) return { path: "", area: "", points: [] };

    const maxVal = Math.max(...data.map(d => d.amount), 100);
    const paddingX = 40;
    const paddingY = 20;
    const chartW = width - paddingX * 2;
    const chartH = height - paddingY * 2;

    const points = data.map((d, index) => {
      const x = paddingX + (index / (data.length - 1)) * chartW;
      const y = height - paddingY - (d.amount / maxVal) * chartH;
      return { x, y, amount: d.amount, date: d.date };
    });

    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, "");

    const areaD = pathD 
      ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
      : "";

    return { path: pathD, area: areaD, points };
  };

  const svgWidth = 700;
  const svgHeight = 220;
  const { path, area, points } = generateSvgPoints(chartData, svgWidth, svgHeight);

  const cardBaseClasses = "bg-white rounded-lg border border-gray-200 shadow-sm transition duration-300 hover:shadow-md hover:border-gray-300";

  if (loading) return <DashboardSkeleton />;

  return (
    <>
      <div className="flex min-h-screen bg-[#EAEDED]">
        <AdminSidebar />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* Header */}
          <div className="mb-8 border-b border-gray-300 pb-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#131921]">
              Overview Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Real-time monitoring of products, sales, orders, and registered customers.
            </p>
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex gap-4 items-start text-red-700">
              <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg">Error Loading Dashboard</h3>
                <p className="text-sm opacity-90 mt-1">{error}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Total Sales */}
                <div className={`${cardBaseClasses} relative overflow-hidden p-6 group`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sales</p>
                      <h3 className="text-2xl md:text-3xl font-bold text-[#131921] mt-2">
                        ₹{stats?.totalAmount?.toLocaleString("en-IN") || 0}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-[#232F3E] text-[#FF9900] flex items-center justify-center group-hover:scale-110 transition duration-300">
                      <IndianRupee className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FF9900]" />
                </div>

                {/* Products */}
                <div className={`${cardBaseClasses} relative overflow-hidden p-6 group`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Products</p>
                      <h3 className="text-2xl md:text-3xl font-bold text-[#131921] mt-2">
                        {stats?.productsCount || 0}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition duration-300">
                      <Package className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
                </div>

                {/* Orders */}
                <div className = {`${cardBaseClasses} relative overflow-hidden p-6 group`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</p>
                      <h3 className="text-2xl md:text-3xl font-bold text-[#131921] mt-2">
                        {stats?.ordersCount || 0}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition duration-300">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
                </div>

                {/* Users */}
                <div className={`${cardBaseClasses} relative overflow-hidden p-6 group`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Users</p>
                      <h3 className="text-2xl md:text-3xl font-bold text-[#131921] mt-2">
                        {stats?.usersCount || 0}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition duration-300">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
                </div>
              </div>

              {/* Chart & Summary Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Sales Chart Card */}
                <div className={`${cardBaseClasses} lg:col-span-2 p-6 flex flex-col`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-[#131921] text-lg">Sales Trend</h3>
                      <p className="text-xs text-gray-500">Total daily revenue generated over the last 7 days</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>Live</span>
                    </div>
                  </div>

                  {chartData.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center py-12 text-gray-400 text-sm">
                      No sales data available.
                    </div>
                  ) : (
                    <div className="flex-1 w-full overflow-x-auto">
                      <div className="min-w-[500px] h-[220px]">
                        <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                          <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#FF9900" stopOpacity="0.4"/>
                              <stop offset="100%" stopColor="#FF9900" stopOpacity="0.0"/>
                            </linearGradient>
                          </defs>

                          {/* Grid Lines */}
                          <line x1="40" y1="20" x2={svgWidth - 40} y2="20" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="40" y1="70" x2={svgWidth - 40} y2="70" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="40" y1="120" x2={svgWidth - 40} y2="120" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="40" y1="170" x2={svgWidth - 40} y2="170" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="40" y1="200" x2={svgWidth - 40} y2="200" stroke="#e2e8f0" strokeWidth="1.5" />

                          {area && <path d={area} fill="url(#chartGradient)" />}
                          {path && (
                            <path d={path} fill="none" stroke="#FF9900" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          )}

                          {points.map((pt, i) => (
                            <g key={i} className="group/node cursor-pointer">
                              <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke="#FF9900" strokeWidth="3" className="transition-all duration-150 hover:r-7" />
                              <rect x={pt.x - 45} y={pt.y - 45} width="90" height="32" rx="6" fill="#131921" className="opacity-0 pointer-events-none group-hover/node:opacity-100 transition-opacity duration-200" />
                              <text x={pt.x} y={pt.y - 25} fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" className="opacity-0 pointer-events-none group-hover/node:opacity-100 transition-opacity duration-200">
                                ₹{pt.amount.toLocaleString()}
                              </text>
                              <text x={pt.x} y={svgHeight - 2} fill="#94a3b8" fontSize="10" textAnchor="middle">
                                {pt.date}
                              </text>
                            </g>
                          ))}
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stock Alerts / Breakdown */}
                <div className={`${cardBaseClasses} p-6 flex flex-col`}>
                  <h3 className="font-bold text-[#131921] text-lg mb-4">Catalog & Audience</h3>
                  {stats?.productsCount === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                      No products added.
                    </div>
                  ) : (
                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[220px]">
                      <p className="text-xs text-gray-500 mb-2">Monitor catalog availability and active users.</p>
                      
                      <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-sm text-gray-700">Operational Catalog</span>
                        <span className="text-sm font-bold text-[#131921]">{stats?.productsCount} items</span>
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-sm text-gray-700">Active Order Dispatch</span>
                        <span className="text-sm font-bold text-[#131921]">{stats?.ordersCount} orders</span>
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-sm text-gray-700">Registered Audience</span>
                        <span className="text-sm font-bold text-[#131921]">{stats?.usersCount} buyers</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Orders List */}
              <div className={`${cardBaseClasses} p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-[#131921] text-lg">Recent Orders</h3>
                  <Link to="/admin/orders" className="text-xs text-[#007185] font-semibold hover:text-[#C7511F] hover:underline">
                    View All Orders
                  </Link>
                </div>

                {!stats?.orders || stats.orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No orders recorded yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500 uppercase text-[10px] tracking-wider font-semibold">
                          <th className="pb-3 pr-4">Order ID</th>
                          <th className="pb-3 px-4">Status</th>
                          <th className="pb-3 px-4">Total Price</th>
                          <th className="pb-3 pl-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {stats.orders.slice(0, 5).map((order) => (
                          <tr key={order._id} className="text-gray-700 hover:bg-gray-50 transition">
                            <td className="py-4 pr-4 font-mono text-xs text-gray-500">{order._id}</td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                order.orderStatus === "Delivered" 
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : order.orderStatus === "Shipped"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                                {order.orderStatus}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-medium text-[#131921]">
                              ₹{order.totalPrice.toLocaleString("en-IN")}
                            </td>
                            <td className="py-4 pl-4 text-right">
                              <Link to={`/admin/orders`} className="text-[#007185] hover:text-[#C7511F] hover:underline text-xs font-semibold">
                                Manage
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

// Pure Tailwind Skeleton Loader
function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#EAEDED]">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="mb-8 border-b border-gray-300 pb-4 space-y-2">
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 w-96 bg-gray-200 animate-pulse rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-lg" />
              </div>
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-6 h-[300px]">
            <div className="h-6 w-40 bg-gray-200 animate-pulse rounded mb-6" />
            <div className="h-full w-full bg-gray-100 animate-pulse rounded" />
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 h-[300px]">
            <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-6" />
            <div className="space-y-4">
              <div className="h-16 w-full bg-gray-100 animate-pulse rounded" />
              <div className="h-16 w-full bg-gray-100 animate-pulse rounded" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="h-6 w-40 bg-gray-200 animate-pulse rounded mb-6" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-full bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}