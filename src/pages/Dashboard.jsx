import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, ClipboardList, Wallet, PiggyBank, AlertTriangle, Truck } from 'lucide-react';
import api from '../api/client';
import CountUp from '../components/CountUp.jsx';

const COLORS = ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa'];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function KpiCard({ label, value, prefix = '', sub, icon: Icon }) {
  return (
    <motion.div variants={item} whileHover={{ y: -4 }} className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
          <p className="text-2xl font-extrabold mt-1 text-gray-800">
            <CountUp value={value} prefix={prefix} />
          </p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-amber-400 flex items-center justify-center text-white shadow-glow-lg">
            <Icon size={18} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard/overview')
      .then((res) => setData(res.data))
      .catch((e) => setError(e.response?.data?.error || 'Failed to load dashboard'));
  }, []);

  if (error) return <p className="text-red-600 p-6">{error}</p>;
  if (!data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
    );
  }

  const occupancy = data.table_occupancy.map((t) => ({ name: t.status, value: Number(t.count) }));
  const expenses = data.monthly_expenses.map((e) => ({ month: e.month, total: Number(e.total) }));
  const purchases = data.purchase_summary.map((p) => ({ status: p.status, value: Number(p.total_value) }));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center gap-2">
        <TrendingUp className="text-brand-600" size={22} />
        <h2 className="text-xl font-bold">Business Overview</h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Sales Today" value={Number(data.sales_overview.total_sales)} prefix="₹" sub={`${data.sales_overview.order_count} orders`} icon={Wallet} />
        <KpiCard label="Active Orders" value={data.active_orders} icon={ClipboardList} />
        <KpiCard label="Revenue (MTD)" value={data.profit_overview.revenue_mtd} prefix="₹" icon={TrendingUp} />
        <KpiCard
          label="Profit (MTD)"
          value={data.profit_overview.profit_mtd}
          prefix="₹"
          sub={data.profit_overview.margin_pct != null ? `${data.profit_overview.margin_pct}% margin` : ''}
          icon={PiggyBank}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div variants={item} className="card">
          <h3 className="font-semibold mb-3">Monthly Expenses</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={expenses}>
              <defs>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="total" stroke="#ea580c" strokeWidth={2.5} fill="url(#expenseGradient)" animationDuration={1000} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={item} className="card">
          <h3 className="font-semibold mb-3">Table Occupancy</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={occupancy} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3} label animationDuration={900}>
                {occupancy.map((entry, i) => (
                  <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={item} className="card">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Truck size={16} className="text-brand-600" /> Purchase Order Summary</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={purchases}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="value" fill="#f97316" radius={[8, 8, 0, 0]} animationDuration={900} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={item} className="card">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><AlertTriangle size={16} className="text-red-500" /> Low Stock Items</h3>
          <table className="data-table w-full">
            <thead>
              <tr><th>Ingredient</th><th>Stock</th><th>Reorder Level</th></tr>
            </thead>
            <tbody>
              {data.low_stock_items.map((i) => (
                <tr key={i.id}>
                  <td>{i.name}</td>
                  <td className="text-red-600 font-semibold">{i.current_stock} {i.unit}</td>
                  <td>{i.reorder_level} {i.unit}</td>
                </tr>
              ))}
              {!data.low_stock_items.length && (
                <tr><td colSpan={3} className="text-gray-400 text-center py-4">All stock levels healthy 🎉</td></tr>
              )}
            </tbody>
          </table>
        </motion.div>
      </div>

      <motion.div variants={item} className="card">
        <h3 className="font-semibold mb-3">Supplier Summary</h3>
        <table className="data-table w-full">
          <thead>
            <tr><th>Supplier</th><th>Purchase Orders</th><th>Total Spent</th></tr>
          </thead>
          <tbody>
            {data.supplier_summary.map((s) => (
              <tr key={s.name}>
                <td>{s.name}</td>
                <td>{s.orders_count}</td>
                <td className="font-medium">₹{Number(s.total_spent).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
}
