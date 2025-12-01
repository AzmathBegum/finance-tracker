import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import ThemeToggle from "../components/ThemeToggle";
import AddTransactionModal from "../components/AddTransactionModal";
import EditTransactionModal from "../components/EditTransactionModal";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const PIE_COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#ec4899"];

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    category: "",
  });

  const [error, setError] = useState("");

  const fetchTransactions = async () => {
    try {
      const res = await axiosInstance.get("/transactions/");
      setTransactions(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch transactions:", err);
      setError("Failed to load transactions.");
    }
  };

  const fetchInsights = async () => {
    try {
      const res = await axiosInstance.get("/insights/");
      setInsights(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch insights:", err);
      setError("Failed to load insights.");
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchTransactions(), fetchInsights()]);
      setLoading(false);
    };
    load();
  }, []);

  const categories = useMemo(() => {
    const setCat = new Set();
    transactions.forEach((t) => {
      if (t.category) setCat.add(t.category);
    });
    return Array.from(setCat);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const tDate = t.date ? new Date(t.date) : null;
      const start = filters.startDate ? new Date(filters.startDate) : null;
      const end = filters.endDate ? new Date(filters.endDate) : null;

      if (start && (!tDate || tDate < start)) return false;
      if (end && (!tDate || tDate > end)) return false;

      if (filters.category && t.category !== filters.category) return false;

      return true;
    });
  }, [transactions, filters]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((t) => {
      const amt = parseFloat(t.amount);
      if (t.type === "income") income += amt;
      else if (t.type === "expense") expense += amt;
    });
    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [filteredTransactions]);

  const pieData = useMemo(() => {
    const map = {};
    filteredTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        if (!map[t.category]) map[t.category] = 0;
        map[t.category] += parseFloat(t.amount);
      });
    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredTransactions]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await axiosInstance.delete(`/transactions/${id}/`);
      fetchTransactions();
      fetchInsights();
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("Failed to delete transaction");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
  };

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      category: "",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">📊 Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track your income, expenses & insights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded bg-red-500 text-white text-sm hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-red-500 text-sm bg-red-100 dark:bg-red-900/40 px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Total Income</p>
          <p className="text-2xl font-bold text-green-500">
            ₹{totals.income.toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Total Expense</p>
          <p className="text-2xl font-bold text-red-500">
            ₹{totals.expense.toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Balance</p>
          <p className={`text-2xl font-bold ${totals.balance >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            ₹{totals.balance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters + Add button */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6 flex flex-col md:flex-row gap-4 md:items-end md:justify-between">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex flex-col">
            <label className="text-xs mb-1">Start Date</label>
            <input
              type="date"
              className="p-2 border rounded bg-gray-50 dark:bg-gray-900"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((f) => ({ ...f, startDate: e.target.value }))
              }
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs mb-1">End Date</label>
            <input
              type="date"
              className="p-2 border rounded bg-gray-50 dark:bg-gray-900"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((f) => ({ ...f, endDate: e.target.value }))
              }
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs mb-1">Category</label>
            <select
              className="p-2 border rounded bg-gray-50 dark:bg-gray-900"
              value={filters.category}
              onChange={(e) =>
                setFilters((f) => ({ ...f, category: e.target.value }))
              }
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={clearFilters}
            className="px-3 py-2 rounded border text-sm"
          >
            Clear
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-3 py-2 rounded bg-green-600 text-white text-sm hover:bg-green-700"
          >
            ➕ Add Transaction
          </button>
        </div>
      </div>

      {/* Main Grid: Pie + Insights + List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow lg:col-span-1">
          <h2 className="text-lg font-semibold mb-3">Expense by Category</h2>
          {pieData.length === 0 ? (
            <p className="text-sm text-gray-500">No expense data to show.</p>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* AI Insights + Transactions */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Insights */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-2">AI Insights 💡</h2>
            {!insights ? (
              <p className="text-sm text-gray-500">No insights yet.</p>
            ) : (
              <>
                <p>{insights.summary}</p>
                <p className="mt-1 text-sm text-emerald-400">
                  {insights.suggestion}
                </p>
              </>
            )}
          </div>

          {/* Transactions List */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-3">Transactions</h2>
            {filteredTransactions.length === 0 ? (
              <p className="text-sm text-gray-500">
                No transactions match the current filters.
              </p>
            ) : (
              <div className="space-y-2">
                {filteredTransactions.map((t) => (
                  <div
                    key={t.id}
                    className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">
                        {t.category}{" "}
                        <span className="text-xs text-gray-500">
                          ({t.type})
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        {t.description || "No description"} • {t.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-bold ${
                          t.type === "income"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        ₹{parseFloat(t.amount).toFixed(2)}
                      </span>
                      <button
                        onClick={() => {
                          setEditingTransaction(t);
                          setIsEditOpen(true);
                        }}
                        className="text-blue-500 text-sm hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-red-500 text-sm hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdded={() => {
          fetchTransactions();
          fetchInsights();
        }}
      />

      <EditTransactionModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        transaction={editingTransaction}
        onUpdated={() => {
          fetchTransactions();
          fetchInsights();
        }}
      />
    </div>
  );
}
