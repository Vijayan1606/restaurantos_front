import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ShoppingCart, Plus, ClipboardList, Utensils } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_STYLES = {
  open: 'bg-gray-100 text-gray-600',
  preparing: 'bg-amber-100 text-amber-700',
  ready: 'bg-blue-100 text-blue-700',
  served: 'bg-purple-100 text-purple-700',
  paid: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function Orders() {
  const { hasRole } = useAuth();
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tableId, setTableId] = useState('');
  const [cart, setCart] = useState([]);

  async function loadAll() {
    const [o, t, m] = await Promise.all([
      api.get('/orders'),
      api.get('/tables'),
      api.get('/menu-items'),
    ]);
    setOrders(o.data);
    setTables(t.data);
    setMenuItems(m.data);
  }

  useEffect(() => {
    loadAll();
    const interval = setInterval(() => api.get('/orders').then((r) => setOrders(r.data)), 8000);
    return () => clearInterval(interval);
  }, []);

  function addToCart(menuItemId) {
    setCart((c) => {
      const existing = c.find((i) => i.menu_item_id === menuItemId);
      if (existing) return c.map((i) => (i.menu_item_id === menuItemId ? { ...i, quantity: i.quantity + 1 } : i));
      return [...c, { menu_item_id: menuItemId, quantity: 1 }];
    });
  }

  async function placeOrder() {
    if (!cart.length) return toast.error('Add at least one item to the cart');
    const toastId = toast.loading('Placing order...');
    try {
      await api.post('/orders', { table_id: tableId || null, items: cart });
      toast.success('Order placed!', { id: toastId });
      setCart([]);
      setTableId('');
      loadAll();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to place order', { id: toastId });
    }
  }

  async function updateOrderStatus(id, status) {
    await api.patch(`/orders/${id}/status`, { status });
    toast.success(`Order marked as ${status}`);
    loadAll();
  }

  const canCreate = hasRole('waiter', 'cashier');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ClipboardList className="text-brand-600" size={22} />
        <h2 className="text-xl font-bold">Order Management</h2>
      </div>

      {canCreate && (
        <motion.div layout className="card">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Utensils size={16} className="text-brand-600" /> New Order</h3>
          <select className="select mb-3 max-w-xs" value={tableId} onChange={(e) => setTableId(e.target.value)}>
            <option value="">Takeaway / no table</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>{t.table_number} ({t.status})</option>
            ))}
          </select>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            {menuItems.map((m) => (
              <motion.button
                key={m.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => addToCart(m.id)}
                className="btn-secondary justify-between"
              >
                <span className="truncate">{m.name}</span><span className="ml-2 text-brand-600 font-semibold">₹{m.price}</span>
              </motion.button>
            ))}
          </div>
          <AnimatePresence>
            {cart.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm mb-3 bg-brand-50 rounded-lg px-3 py-2 flex items-center gap-2"
              >
                <ShoppingCart size={14} className="text-brand-600" />
                {cart.map((c) => `${menuItems.find((m) => m.id === c.menu_item_id)?.name} ×${c.quantity}`).join(', ')}
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button whileTap={{ scale: 0.96 }} onClick={placeOrder} className="btn-primary">
            <Plus size={16} /> Place Order
          </motion.button>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {orders.map((o) => (
            <motion.div
              key={o.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{o.order_number}</p>
                  <p className="text-xs text-gray-400">{o.table_number || 'Takeaway'} · {o.order_type}</p>
                </div>
                <span className={`badge ${STATUS_STYLES[o.status] || 'bg-gray-100 text-gray-600'}`}>{o.status}</span>
              </div>
              <p className="text-sm text-gray-500">Total: <span className="font-semibold text-gray-800">₹{o.total}</span></p>
              <div className="flex gap-2 mt-3 flex-wrap">
                {['preparing', 'ready', 'served', 'paid', 'cancelled'].map((s) => (
                  <button key={s} onClick={() => updateOrderStatus(o.id, s)} className="text-xs btn-secondary py-1 px-2">
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {!orders.length && <p className="text-gray-400">No orders yet.</p>}
      </div>
    </div>
  );
}
