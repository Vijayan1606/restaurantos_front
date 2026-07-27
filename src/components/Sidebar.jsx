import { NavLink, useLocation, useNavigate} from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  BookOpen,
  Boxes,
  Truck,
  Users2,
  Receipt,
  ScanLine,
  Sparkles,
  LogOut,
  ChefHat,
  Calendar,
  History,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: null },
  { to: "/tables", label: "Tables", icon: UtensilsCrossed, roles: null },
  { to: "/orders", label: "Orders", icon: ClipboardList, roles: null },
  { to: "/menu", label: "Menu", icon: BookOpen, roles: null },
  {
    to: "/recipes",
    label: "Recipes",
    icon: ChefHat,
    roles: ["manager", "chef"],
  },
  { to: "/shifts", label: "Staff Shifts", icon: Calendar, roles: ["manager"] },
  {
    to: "/activity-logs",
    label: "Activity Logs",
    icon: History,
    roles: ["manager"],
  },
  {
    to: "/inventory",
    label: "Inventory",
    icon: Boxes,
    roles: ["manager", "store_manager"],
  },
  {
    to: "/purchase-orders",
    label: "Purchase Orders",
    icon: Truck,
    roles: ["manager", "store_manager"],
  },
  {
    to: "/suppliers",
    label: "Suppliers",
    icon: Users2,
    roles: ["manager", "store_manager"],
  },
  {
    to: "/expenses",
    label: "Expenses",
    icon: Receipt,
    roles: ["manager", "cashier"],
  },
  {
    to: "/invoices",
    label: "AI Invoices",
    icon: ScanLine,
    roles: ["manager", "cashier", "store_manager"],
  },
  {
    to: "/ai-insights",
    label: "AI Insights",
    icon: Sparkles,
    roles: ["manager", "store_manager", "chef"],
  },
];

const ROLE_COLORS = {
  owner: "bg-purple-100 text-purple-700",
  manager: "bg-blue-100 text-blue-700",
  chef: "bg-green-100 text-green-700",
  waiter: "bg-amber-100 text-amber-700",
  cashier: "bg-pink-100 text-pink-700",
  store_manager: "bg-cyan-100 text-cyan-700",
};

export default function Sidebar({ closeMobileSidebar }) {
  const { user, hasRole, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const visible = links.filter((l) => !l.roles || hasRole(...l.roles));
 
  const handleLogout = () => {
    logout();
    closeMobileSidebar?.();
    navigate("/login", { replace: true });
  };
  return (
    <aside className="w-64 bg-white/90 backdrop-blur-xl border-r border-orange-100/60 flex flex-col h-screen sticky top-0 z-20">
      <div className="p-5 flex items-center justify-between border-b border-orange-100/60">
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-amber-400 flex items-center justify-center shadow-glow-lg"
          >
            <ChefHat size={20} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-lg font-extrabold gradient-text leading-tight">
              RestaurantOS
            </h1>
            <p className="text-[11px] text-gray-400 -mt-0.5">
              AI Restaurant Platform
            </p>
          </div>
        </div>
        <button
          onClick={closeMobileSidebar}
          className="p-1 text-gray-400 hover:text-brand-600 md:hidden focus:outline-none"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {visible.map((l) => {
          const isActive = location.pathname === l.to;
          const Icon = l.icon;
          return (
            <NavLink
              key={l.to}
              to={l.to}
              className="relative block"
              onClick={closeMobileSidebar}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl shadow-glow-lg"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span
                className={`relative z-10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "text-white"
                    : "text-gray-600 hover:bg-brand-50 hover:text-brand-700"
                }`}
              >
                <Icon size={17} strokeWidth={2.2} />
                {l.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-orange-100/60">
        <div className="flex items-center gap-2.5 mb-3 px-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-amber-400 flex items-center justify-center text-white text-xs font-bold">
            {user?.full_name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate">
              {user?.full_name}
            </p>
            <span
              className={`badge ${ROLE_COLORS[user?.role] || "bg-gray-100 text-gray-600"}`}
            >
              {user?.role}
            </span>
          </div>
        </div>
       <button onClick={handleLogout} className="btn-secondary w-full">
          <LogOut size={15} />
          <span className="ml-2">Log out</span>
        </button>
      </div>
    </aside>
  );
}
