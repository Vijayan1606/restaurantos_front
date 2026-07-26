import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Trash2, Inbox, Search } from 'lucide-react';
import api from '../api/client';

/**
 * Reusable list + inline-create UI for simple master-data entities.
 *
 * fields: [{
 *   key,                 // column submitted to the API (e.g. 'category_id')
 *   label,               // input placeholder / column header
 *   type,                // 'text' | 'number' | 'date' | 'select'
 *   optionsEndpoint,      // for type='select': API path to fetch options from, e.g. 'menu-categories'
 *   optionLabel,          // key on each option to display, e.g. 'name'
 *   displayKey,           // for the table column: prefer this joined field (e.g. 'cat_name') over raw id
 * }]
 */
export default function GenericCrud({ title, endpoint, fields, icon: Icon }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({});
  const [optionSets, setOptionSets] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const selectFields = fields.filter((f) => f.type === 'select' && f.optionsEndpoint);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(`/${endpoint}`, { params: search ? { search } : {} });
      setRows(data);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function loadOptions() {
    const entries = await Promise.all(
      selectFields.map(async (f) => {
        try {
          const { data } = await api.get(`/${f.optionsEndpoint}`);
          return [f.key, data];
        } catch {
          return [f.key, []];
        }
      })
    );
    setOptionSets(Object.fromEntries(entries));
  }

  useEffect(() => {
    load();
    loadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleCreate(e) {
    e.preventDefault();
    const toastId = toast.loading('Saving...');
    try {
      await api.post(`/${endpoint}`, form);
      toast.success('Added successfully', { id: toastId });
      setForm({});
      load();
    } catch (e2) {
      toast.error(e2.response?.data?.error || 'Failed to create', { id: toastId });
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this record? This cannot be undone.')) return;
    const toastId = toast.loading('Deleting...');
    try {
      await api.delete(`/${endpoint}/${id}`);
      toast.success('Deleted', { id: toastId });
      setRows((r) => r.filter((row) => row.id !== id));
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to delete', { id: toastId });
    }
  }

  function displayValue(row, f) {
    if (f.displayKey && row[f.displayKey] !== undefined && row[f.displayKey] !== null) {
      return row[f.displayKey];
    }
    return row[f.key] ?? '—';
  }

  return (
    <motion.div layout className="card">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-bold flex items-center gap-2">
          {Icon && <Icon size={18} className="text-brand-600" />} {title}
        </h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-8 py-1.5 text-sm w-48"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mb-3 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {fields.map((f) => {
          if (f.type === 'select') {
            const options = f.options || optionSets[f.key] || [];
            return (
              <select
                key={f.key}
                className="select"
                value={form[f.key] ?? ''}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              >
                <option value="">{f.label}</option>
                {options.map((opt) => (
                  <option key={opt.id ?? opt} value={opt.id ?? opt}>
                    {opt[f.optionLabel || 'name'] ?? opt}
                  </option>
                ))}
              </select>
            );
          }
          return (
            <input
              key={f.key}
              className="input"
              placeholder={f.label}
              type={f.type || 'text'}
              value={form[f.key] ?? ''}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
          );
        })}
        <motion.button whileTap={{ scale: 0.95 }} className="btn-primary sm:col-span-2 md:col-span-1">
          <Plus size={16} /> Add
        </motion.button>
      </form>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-9 w-full" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                {fields.map((f) => (
                  <th key={f.key}>{f.label}</th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {rows.map((r) => (
                  <motion.tr
                    key={r.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {fields.map((f) => (
                      <td key={f.key}>{String(displayValue(r, f))}</td>
                    ))}
                    <td>
                      <button onClick={() => handleDelete(r.id)} className="btn-icon text-gray-400 hover:text-red-600 hover:bg-red-50">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {!rows.length && (
                <tr>
                  <td colSpan={fields.length + 1}>
                    <div className="flex flex-col items-center py-10 text-gray-400 gap-2">
                      <Inbox size={28} className="opacity-50" />
                      <span className="text-sm">No records yet — add your first one above</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
