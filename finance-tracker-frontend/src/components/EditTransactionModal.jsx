import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function EditTransactionModal({
  isOpen,
  onClose,
  transaction,
  onUpdated,
}) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount);
      setType(transaction.type);
      setCategory(transaction.category);
      setDescription(transaction.description || "");
      setDate(transaction.date);
    }
  }, [transaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transaction) return;

    try {
      await axiosInstance.put(`/transactions/${transaction.id}/`, {
        amount,
        type,
        category,
        description,
        date,
      });

      onUpdated();
      onClose();
    } catch (error) {
      console.error("❌ Error updating transaction:", error);
      alert("Failed to update transaction");
    }
  };

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-96 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Edit Transaction</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="number"
            placeholder="Amount"
            className="p-2 border rounded bg-gray-50 dark:bg-gray-800"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <select
            className="p-2 border rounded bg-gray-50 dark:bg-gray-800"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <input
            type="text"
            placeholder="Category"
            className="p-2 border rounded bg-gray-50 dark:bg-gray-800"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Description (optional)"
            className="p-2 border rounded bg-gray-50 dark:bg-gray-800"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            type="date"
            className="p-2 border rounded bg-gray-50 dark:bg-gray-800"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </form>

        <button
          onClick={onClose}
          className="mt-4 text-red-500 hover:underline block mx-auto"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
