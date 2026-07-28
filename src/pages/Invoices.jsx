import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ScanLine, Download, Sparkles, Eye, UploadCloud, X } from 'lucide-react';
import api from '../api/client';

const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-600',
  processing: 'bg-blue-100 text-blue-700',
  extracted: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  reviewed: 'bg-purple-100 text-purple-700',
};

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  async function load() {
    const { data } = await api.get('/invoices');
    setInvoices(data);
  }

  useEffect(() => { load(); }, []);

  async function uploadFiles(files) {
    if (!files.length) return;
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    const toastId = toast.loading(`Uploading ${files.length} file(s)...`);
    try {
      await api.post('/invoices/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Upload complete', { id: toastId });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed', { id: toastId });
    }
  }

  async function processInvoice(id) {
    setBusyId(id);
    const toastId = toast.loading('Running AI extraction...');
    try {
      await api.post(`/invoices/${id}/process`);
      toast.success('Invoice extracted!', { id: toastId });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'AI extraction failed', { id: toastId });
    } finally {
      setBusyId(null);
    }
  }

  async function viewInvoice(id) {
    const { data } = await api.get(`/invoices/${id}`);
    setSelected(data);
  }

  async function saveReview(fields) {
    await api.patch(`/invoices/${selected.id}`, { ...fields, processing_status: 'reviewed' });
    toast.success('Invoice reviewed & saved');
    setSelected(null);
    load();
  }

  async function exportRegister() {
    const toastId = toast.loading('Generating Excel register...');
    try {
      const res = await api.get('/invoices/export/expense-register', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'expense-register.xlsx';
      a.click();
      toast.success('Downloaded expense-register.xlsx', { id: toastId });
    } catch (e) {
      toast.error('Export failed', { id: toastId });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <ScanLine className="text-brand-600" size={22} />
          <h2 className="text-xl font-bold">AI Invoice Processing</h2>
        </div>
        <motion.button whileTap={{ scale: 0.96 }} onClick={exportRegister} className="btn-primary">
          <Download size={16} /> Export Expense Register
        </motion.button>
      </div>

      <motion.div
        layout
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); uploadFiles(Array.from(e.dataTransfer.files)); }}
        className={`card border-2 border-dashed transition-colors ${dragOver ? 'border-brand-500 bg-brand-50/60' : 'border-orange-200'}`}
      >
        <div className="flex flex-col items-center text-center py-6">
          <motion.div animate={dragOver ? { scale: 1.1 } : { scale: 1 }} className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center mb-3">
            <UploadCloud size={26} className="text-brand-600" />
          </motion.div>
          <h3 className="font-semibold mb-1">Upload Supplier Invoices</h3>
          <p className="text-xs text-gray-400 mb-4">Drag & drop or click below — supports printed and handwritten invoices (JPG, PNG, WEBP)</p>
          <label className="btn-secondary cursor-pointer">
            Choose Files
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => uploadFiles(Array.from(e.target.files))}
            />
          </label>
        </div>
      </motion.div>

      <div className="card overflow-x-auto">
        <table className="data-table w-full">
          <thead>
            <tr>
              <th>File</th><th>Supplier</th><th>Invoice #</th><th>Date</th><th>Total</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {invoices.map((inv) => (
                <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <td className="max-w-[160px] truncate">{inv.file_name}</td>
                  <td>{inv.supplier_name_raw || '—'}</td>
                  <td>{inv.invoice_number || '—'}</td>
                  <td>{inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString() : '—'}</td>
                  <td>{inv.total_amount ? `₹${inv.total_amount}` : '—'}</td>
                  <td>
                    <span className={`badge ${STATUS_COLORS[inv.processing_status] || ''}`}>
                      {inv.processing_status === 'processing' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse-ring" />
                      )}
                      {inv.processing_status}
                    </span>
                  </td>
                  <td className="space-x-2">
                    {inv.processing_status === 'pending' && (
                      <button disabled={busyId === inv.id} onClick={() => processInvoice(inv.id)} className="text-xs btn-secondary py-1 px-2">
                        <Sparkles size={13} /> {busyId === inv.id ? 'Processing…' : 'Run AI Extraction'}
                      </button>
                    )}
                    {['extracted', 'reviewed'].includes(inv.processing_status) && (
                      <button onClick={() => viewInvoice(inv.id)} className="text-xs btn-secondary py-1 px-2">
                        <Eye size={13} /> Review
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {!invoices.length && (
              <tr><td colSpan={7} className="text-gray-400 text-center py-8">No invoices uploaded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selected && <ReviewModal invoice={selected} onClose={() => setSelected(null)} onSave={saveReview} />}
      </AnimatePresence>
    </div>
  );
}

function ReviewModal({ invoice, onClose, onSave }) {
  const [form, setForm] = useState({
    invoice_number: invoice.invoice_number || '',
    invoice_date: invoice.invoice_date ? invoice.invoice_date.slice(0, 10) : '',
    subtotal: invoice.subtotal || '',
    tax_amount: invoice.tax_amount || '',
    total_amount: invoice.total_amount || '',
  });

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg">Review Extracted Invoice</h3>
          <button onClick={onClose} className="btn-icon text-gray-400"><X size={18} /></button>
        </div>
        <p className="text-xs text-gray-400">
          Confidence: {invoice.extraction_confidence != null ? `${Math.round(invoice.extraction_confidence * 100)}%` : 'n/a'}
          {invoice.is_handwritten ? ' · Handwritten' : ''}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="Invoice #" value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} />
          <input className="input" type="date" value={form.invoice_date} onChange={(e) => setForm({ ...form, invoice_date: e.target.value })} />
          <input className="input" type="number" placeholder="Subtotal" value={form.subtotal} onChange={(e) => setForm({ ...form, subtotal: e.target.value })} />
          <input className="input" type="number" placeholder="Tax" value={form.tax_amount} onChange={(e) => setForm({ ...form, tax_amount: e.target.value })} />
          <input className="input" type="number" placeholder="Total" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} />
        </div>

        <div>
          <h4 className="font-medium text-sm mb-2">Line Items</h4>
          <table className="data-table w-full">
            <thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Line Total</th></tr></thead>
            <tbody>
              {(invoice.line_items || []).map((li) => (
                <tr key={li.id}>
                  <td>{li.description}</td><td>{li.quantity}</td><td>{li.unit_price}</td><td>{li.line_total}</td>
                </tr>
              ))}
              {!invoice.line_items?.length && <tr><td colSpan={4} className="text-gray-400 text-center py-3">No line items extracted</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => onSave(form)} className="btn-primary">Save & Mark Reviewed</motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
