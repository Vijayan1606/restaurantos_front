import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertTriangle, RefreshCw, Tag, Trash2 } from 'lucide-react';
import api from '../api/client';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

function Section({ title, icon: Icon, children }) {
  return (
    <motion.div variants={item} className="card">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        {Icon && <Icon size={16} className="text-brand-600" />} {title}
      </h3>
      {children}
    </motion.div>
  );
}

export default function AiInsights() {
  const [shortages, setShortages] = useState([]);
  const [reorders, setReorders] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [waste, setWaste] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/ai/shortage-predictions'),
      api.get('/ai/reorder-recommendations'),
      api.get('/ai/pricing-suggestions'),
      api.get('/ai/waste-analysis'),
    ])
      .then(([s, r, p, w]) => {
        setShortages(s.data);
        setReorders(r.data);
        setPricing(p.data);
        setWaste(w.data);
      })
      .catch((e) => setError(e.response?.data?.error || 'Failed to load AI insights'));
  }, []);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center gap-2">
        <Sparkles className="text-brand-600" size={22} />
        <h2 className="text-xl font-bold">AI Insights</h2>
      </motion.div>
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Section title="Predicted Ingredient Shortages" icon={AlertTriangle}>
        <table className="data-table w-full">
          <thead><tr><th>Ingredient</th><th>Stock Left</th><th>Days Left</th><th>Risk</th></tr></thead>
          <tbody>
            {shortages.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td><td>{s.current_stock}</td><td>{s.days_of_stock_left ?? '—'}</td>
                <td>
                  <span className={`badge ${s.risk === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{s.risk}</span>
                </td>
              </tr>
            ))}
            {!shortages.length && <tr><td colSpan={4} className="text-gray-400 text-center py-4">No shortages predicted 🎉</td></tr>}
          </tbody>
        </table>
      </Section>

      <Section title="Stock Reorder Recommendations" icon={RefreshCw}>
        <table className="data-table w-full">
          <thead><tr><th>Ingredient</th><th>Suggested Reorder Qty</th></tr></thead>
          <tbody>
            {reorders.map((r) => (
              <tr key={r.ingredient_id}><td>{r.name}</td><td className="font-medium">{r.suggested_reorder_qty}</td></tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Menu Pricing Suggestions" icon={Tag}>
        <table className="data-table w-full">
          <thead><tr><th>Item</th><th>Current Price</th><th>Suggested Price</th><th>Current Margin</th></tr></thead>
          <tbody>
            {pricing.map((p) => (
              <tr key={p.menu_item_id}>
                <td>{p.name}</td><td>₹{p.current_price}</td>
                <td className="font-medium text-brand-700">{p.suggested_price != null ? `₹${p.suggested_price}` : '—'}</td>
                <td>{p.current_margin_pct != null ? `${p.current_margin_pct}%` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Ingredient Waste Analysis" icon={Trash2}>
        <table className="data-table w-full">
          <thead><tr><th>Ingredient</th><th>Total Wasted</th><th>Cost Impact</th><th>Recommendation</th></tr></thead>
          <tbody>
            {waste.map((w, i) => (
              <tr key={i}>
                <td>{w.name}</td><td>{w.total_wasted}</td><td>₹{Math.round(w.total_cost)}</td><td className="text-gray-500">{w.recommendation}</td>
              </tr>
            ))}
            {!waste.length && <tr><td colSpan={4} className="text-gray-400 text-center py-4">No waste records logged yet</td></tr>}
          </tbody>
        </table>
      </Section>
    </motion.div>
  );
}
