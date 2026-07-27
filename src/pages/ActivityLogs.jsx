import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  History,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  Calendar,
  Filter,
} from "lucide-react";
import api from "../api/client";

const ACTION_STYLES = {
  create: "bg-green-100 text-green-700 border-green-200",
  update: "bg-blue-100 text-blue-700 border-blue-200",
  delete: "bg-red-100 text-red-700 border-red-200",
  login: "bg-purple-100 text-purple-700 border-purple-200",
  register: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // Filters State
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  async function loadLogs() {
    setLoading(true);
    try {
      const { data } = await api.get("/activity-logs");
      setLogs(data);
    } catch (err) {
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  // Extract unique entities for filter dropdown
  const uniqueEntities = [
    ...new Set(logs.map((log) => log.entity).filter(Boolean)),
  ];

  // Apply filters
  const filteredLogs = logs.filter((log) => {
    const matchesAction = actionFilter ? log.action === actionFilter : true;
    const matchesEntity = entityFilter ? log.entity === entityFilter : true;

    const userName = log.u_full_name || "System";
    const matchesSearch = searchQuery
      ? userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.entity &&
          log.entity.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    return matchesAction && matchesEntity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <History className="text-brand-600" size={22} />
        <h2 className="text-xl font-bold">System Activity Logs</h2>
      </div>

      {/* Filters Card */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
          <Filter size={16} className="text-brand-600" /> Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />

            <input
              className="input py-1.5 text-sm"
              style={{ paddingLeft: "44px" }}
              placeholder="Search by operator or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="select text-sm"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="register">Register</option>
          </select>

          <select
            className="select text-sm"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          >
            <option value="">All Modules/Entities</option>
            {uniqueEntities.map((ent) => (
              <option key={ent} value={ent}>
                {ent.replace("_", " ")}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setActionFilter("");
              setEntityFilter("");
              setSearchQuery("");
            }}
            className="btn-secondary text-sm h-full"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Logs Table / List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Operator</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Ref ID</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filteredLogs.map((log) => {
                    const isExpanded = expandedId === log.id;
                    const logDate = new Date(log.created_at);
                    const formattedDate =
                      logDate.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      }) +
                      " " +
                      logDate.toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                    return (
                      <>
                        <motion.tr
                          key={log.id}
                          layout="position"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`cursor-pointer hover:bg-orange-50/20 transition-all ${
                            isExpanded ? "bg-orange-50/10" : ""
                          }`}
                          onClick={() => toggleExpand(log.id)}
                        >
                          <td className="text-gray-500 font-medium whitespace-nowrap text-xs">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={12} className="text-gray-400" />
                              {formattedDate}
                            </div>
                          </td>
                          <td className="font-semibold text-gray-700">
                            <div className="flex items-center gap-1.5">
                              <User size={13} className="text-brand-600/70" />
                              {log.u_full_name || "System / Auto"}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge border text-[11px] font-bold py-0.5 px-2 ${
                                ACTION_STYLES[log.action] ||
                                "bg-gray-100 text-gray-700 border-gray-200"
                              }`}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td className="capitalize text-xs text-gray-500 font-semibold">
                            {log.entity ? log.entity.replace("_", " ") : "—"}
                          </td>
                          <td className="font-mono text-[11px] text-gray-400">
                            {log.entity_id ? log.entity_id.slice(0, 8) : "—"}
                          </td>
                          <td>
                            <button className="flex items-center gap-1 text-xs text-brand-600 font-semibold hover:text-brand-700">
                              <FileText size={13} />
                              {isExpanded ? "Hide Payload" : "View Payload"}
                              {isExpanded ? (
                                <ChevronUp size={13} />
                              ) : (
                                <ChevronDown size={13} />
                              )}
                            </button>
                          </td>
                        </motion.tr>

                        {/* Collapsible details payload */}
                        {isExpanded && (
                          <tr
                            key={`${log.id}-details`}
                            className="bg-gray-50/60"
                          >
                            <td
                              colSpan={6}
                              className="py-4 px-6 border-b border-gray-100"
                            >
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2"
                              >
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                  Audit Log Transaction Details
                                </div>
                                <pre className="bg-white/80 border border-gray-100 rounded-xl p-3.5 text-xs text-gray-700 font-mono overflow-x-auto shadow-inner max-w-full">
                                  {JSON.stringify(
                                    log.details || {
                                      info: "No extra metadata payload",
                                    },
                                    null,
                                    2,
                                  )}
                                </pre>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </AnimatePresence>
                {!filteredLogs.length && (
                  <tr>
                    <td colSpan={6} className="text-gray-400 text-center py-8">
                      No system activity matching the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
