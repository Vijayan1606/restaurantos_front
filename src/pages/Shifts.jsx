import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Calendar, Plus, Trash2, User, Clock, CheckCircle2, AlertCircle, X } from 'lucide-react';
import api from '../api/client';

export default function Shifts() {
  const [shifts, setShifts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [userId, setUserId] = useState('');
  const [shiftDate, setShiftDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [status, setStatus] = useState('scheduled');

  async function loadData() {
    setLoading(true);
    try {
      const [shiftsRes, staffRes] = await Promise.all([
        api.get('/staff-shifts'),
        api.get('/auth/users'),
      ]);
      setShifts(shiftsRes.data);
      setStaff(staffRes.data);
    } catch (err) {
      toast.error('Failed to load shifts or staff directory');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAddShift(e) {
    e.preventDefault();
    if (!userId || !shiftDate || !startTime || !endTime) {
      return toast.error('All fields are required');
    }

    const toastId = toast.loading('Scheduling shift...');
    try {
      await api.post('/staff-shifts', {
        user_id: userId,
        shift_date: shiftDate,
        // format as TIME HH:MM:SS for postgres
        start_time: startTime + ':00',
        end_time: endTime + ':00',
        status,
      });
      toast.success('Shift scheduled successfully!', { id: toastId });
      setShowModal(false);
      
      // Reset form
      setUserId('');
      setShiftDate('');
      setStartTime('09:00');
      setEndTime('17:00');
      setStatus('scheduled');
      
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to schedule shift', { id: toastId });
    }
  }

  async function handleUpdateStatus(shiftId, newStatus) {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return;
    
    const toastId = toast.loading('Updating status...');
    try {
      await api.put(`/staff-shifts/${shiftId}`, {
        user_id: shift.user_id,
        shift_date: shift.shift_date.slice(0, 10),
        start_time: shift.start_time,
        end_time: shift.end_time,
        status: newStatus,
      });
      toast.success(`Shift status marked as ${newStatus}`, { id: toastId });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update shift status', { id: toastId });
    }
  }

  async function handleDeleteShift(id) {
    if (!confirm('Are you sure you want to delete this shift?')) return;
    const toastId = toast.loading('Deleting shift...');
    try {
      await api.delete(`/staff-shifts/${id}`);
      toast.success('Shift deleted', { id: toastId });
      setShifts(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete shift', { id: toastId });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="text-brand-600" size={22} />
          <h2 className="text-xl font-bold">Staff Shift Planner</h2>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <Plus size={16} /> Schedule Shift
        </motion.button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Date</th>
                <th>Shift Hours</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {shifts.map((s) => {
                  const staffMember = staff.find(member => member.id === s.user_id);
                  const fullName = s.u_full_name || staffMember?.full_name || 'Unknown Employee';
                  const roleName = staffMember?.role || 'Staff';
                  
                  return (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td className="font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-brand-700 font-bold text-xs">
                            {fullName[0].toUpperCase()}
                          </div>
                          {fullName}
                        </div>
                      </td>
                      <td className="capitalize text-xs text-gray-500 font-medium">
                        {roleName.replace('_', ' ')}
                      </td>
                      <td>
                        {new Date(s.shift_date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-gray-400" />
                          {s.start_time ? s.start_time.slice(0, 5) : '—'} – {s.end_time ? s.end_time.slice(0, 5) : '—'}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          s.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : s.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="space-x-2">
                        {s.status === 'scheduled' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(s.id, 'completed')}
                              className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-lg hover:bg-green-100 transition"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(s.id, 'cancelled')}
                              className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-lg hover:bg-red-100 transition"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteShift(s.id)}
                          className="btn-icon text-gray-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {!shifts.length && (
                <tr>
                  <td colSpan={6} className="text-gray-400 text-center py-8">
                    No shifts scheduled for this week.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Shift Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                  <Calendar size={18} className="text-brand-600" /> Schedule Shift
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-icon text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddShift} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Select Employee</label>
                  <select
                    className="select text-sm"
                    value={userId}
                    onChange={e => setUserId(e.target.value)}
                    required
                  >
                    <option value="">Choose employee...</option>
                    {staff.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.full_name} ({member.role.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
                  <input
                    type="date"
                    className="input"
                    value={shiftDate}
                    onChange={e => setShiftDate(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Start Time</label>
                    <input
                      type="time"
                      className="input"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">End Time</label>
                    <input
                      type="time"
                      className="input"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                  <select
                    className="select text-sm"
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-sm"
                  >
                    Create Shift
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
