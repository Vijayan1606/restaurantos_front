import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Truck, Plus, PackageCheck } from 'lucide-react';
import api from '../api/client';

const STATUS_STYLES = {
  draft: 'bg-gray-100 text-gray-600',
  ordered: 'bg-amber-100 text-amber-700',
  received: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function PurchaseOrders() {
  const [pos, setPos] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [supplierId, setSupplierId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [items, setItems] = useState([{ ingredient_id: '', quantity: 1, unit_price: 0 }]);

  async function loadAll() {
    const [p, s, w, i] = await Promise.all([
      api.get('/purchase-orders'),
      api.get('/suppliers'),
      api.get('/warehouses'),
      api.get('/ingredients'),
    ]);
    setPos(p.data);
    setSuppliers(s.data);
    setWarehouses(w.data);
    setIngredients(i.data);
  }

  useEffect(() => { loadAll(); }, []);

  function updateItem(idx, field, value) {
    setItems((its) => its.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  }

  async function submit() {
    const toastId = toast.loading('Creating purchase order...');
    try {
      await api.post('/purchase-orders', {
        supplier_id: supplierId || null,
        warehouse_id: warehouseId || null,
        items: items.filter((i) => i.ingredient_id).map((i) => ({ ...i, quantity: Number(i.quantity), unit_price: Number(i.unit_price) })),
      });
      toast.success('Purchase order created', { id: toastId });
      setItems([{ ingredient_id: '', quantity: 1, unit_price: 0 }]);
      loadAll();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to create purchase order', { id: toastId });
    }
  }

  async function receive(id) {
    const toastId = toast.loading('Receiving stock...');
    try {
      await api.patch(`/purchase-orders/${id}/receive`);
      toast.success('Stock received & inventory updated', { id: toastId });
      loadAll();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to receive', { id: toastId });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Truck className="text-brand-600" size={22} />
        <h2 className="text-xl font-bold">Purchase Orders</h2>
      </div>

      <motion.div layout className="card">
        <h3 className="font-semibold mb-3">New Purchase Order</h3>
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          <select className="select" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
            <option value="">Select Supplier</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="select" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
            <option value="">Select Warehouse</option>
            {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <AnimatePresence initial={false}>
          {items.map((it, idx) => (
            <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 gap-2 mb-2">
              <select className="select" value={it.ingredient_id} onChange={(e) => updateItem(idx, 'ingredient_id', e.target.value)}>
                <option value="">Ingredient</option>
                {ingredients.map((ing) => <option key={ing.id} value={ing.id}>{ing.name}</option>)}
              </select>
              <input className="input" type="number" placeholder="Qty" value={it.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} />
              <input className="input" type="number" placeholder="Unit Price" value={it.unit_price} onChange={(e) => updateItem(idx, 'unit_price', e.target.value)} />
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="flex gap-2 mt-2">
          <button className="btn-secondary" onClick={() => setItems([...items, { ingredient_id: '', quantity: 1, unit_price: 0 }])}>
            <Plus size={15} /> Add Line
          </button>
          <motion.button whileTap={{ scale: 0.96 }} className="btn-primary" onClick={submit}>Create PO</motion.button>
        </div>
      </motion.div>

      <div className="card overflow-x-auto">
        <table className="data-table w-full">
          <thead><tr><th>PO #</th><th>Supplier</th><th>Status</th><th>Total</th><th></th></tr></thead>
          <tbody>
            <AnimatePresence initial={false}>
              {pos.map((po) => (
                <motion.tr key={po.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <td className="font-medium">{po.po_number}</td>
                  <td>{po.supplier_name || '—'}</td>
                  <td><span className={`badge ${STATUS_STYLES[po.status] || ''}`}>{po.status}</span></td>
                  <td>₹{po.total_amount}</td>
                  <td>
                    {po.status !== 'received' && (
                      <button onClick={() => receive(po.id)} className="text-xs btn-secondary py-1 px-2">
                        <PackageCheck size={13} /> Mark Received
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {!pos.length && <tr><td colSpan={5} className="text-gray-400 text-center py-8">No purchase orders yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
