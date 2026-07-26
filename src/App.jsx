import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Sidebar from './components/Sidebar.jsx';
import PageTransition from './components/PageTransition.jsx';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Tables from './pages/Tables.jsx';
import Orders from './pages/Orders.jsx';
import MenuPage from './pages/Menu.jsx';
import Recipes from './pages/Recipes.jsx';
import Shifts from './pages/Shifts.jsx';
import ActivityLogs from './pages/ActivityLogs.jsx';
import Inventory from './pages/Inventory.jsx';
import PurchaseOrders from './pages/PurchaseOrders.jsx';
import Suppliers from './pages/Suppliers.jsx';
import Expenses from './pages/Expenses.jsx';
import Invoices from './pages/Invoices.jsx';
import AiInsights from './pages/AiInsights.jsx';

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-orange-100/60 px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-lg gradient-text">RestaurantOS</span>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-gray-600 hover:text-brand-600 focus:outline-none"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Sidebar overlay wrapper for mobile */}
      <div className={`fixed inset-y-0 left-0 z-40 md:relative md:flex md:z-auto transition-all duration-300 ${
        sidebarOpen ? 'w-full' : 'w-0 md:w-64 overflow-hidden md:overflow-visible'
      }`}>
        {/* Backdrop overlay */}
        <div 
          onClick={() => setSidebarOpen(false)}
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        />
        
        {/* Sidebar content container */}
        <div className={`relative w-64 h-full transform transition-transform duration-300 md:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <Sidebar closeMobileSidebar={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Main page content area */}
      <main className="flex-1 p-4 md:p-8 max-w-[1400px] mx-auto w-full mt-16 md:mt-0 overflow-x-hidden">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}

function Private({ children, roles }) {
  return (
    <ProtectedRoute roles={roles}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Private><Dashboard /></Private>} />
        <Route path="/tables" element={<Private><Tables /></Private>} />
        <Route path="/orders" element={<Private><Orders /></Private>} />
        <Route path="/menu" element={<Private><MenuPage /></Private>} />
        <Route path="/recipes" element={<Private roles={['manager', 'chef']}><Recipes /></Private>} />
        <Route path="/shifts" element={<Private roles={['manager']}><Shifts /></Private>} />
        <Route path="/activity-logs" element={<Private roles={['manager']}><ActivityLogs /></Private>} />
        <Route path="/inventory" element={<Private roles={['manager', 'store_manager']}><Inventory /></Private>} />
        <Route path="/purchase-orders" element={<Private roles={['manager', 'store_manager']}><PurchaseOrders /></Private>} />
        <Route path="/suppliers" element={<Private roles={['manager', 'store_manager']}><Suppliers /></Private>} />
        <Route path="/expenses" element={<Private roles={['manager', 'cashier']}><Expenses /></Private>} />
        <Route path="/invoices" element={<Private roles={['manager', 'cashier', 'store_manager']}><Invoices /></Private>} />
        <Route path="/ai-insights" element={<Private roles={['manager', 'store_manager', 'chef']}><AiInsights /></Private>} />
      </Routes>
    </AnimatePresence>
  );
}
