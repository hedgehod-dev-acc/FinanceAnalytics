import { useState } from "react";
import { usePayments } from "../context/PaymentsContext";
import { useSettings } from "../context/SettingsContext";
import { Currency, CURRENCY_SYMBOLS } from "../types";

const CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "Entertainment",
  "Health",
  "Shopping",
  "Utilities",
  "Other",
];

export default function PaymentsList() {
  const { payments, updatePayment, deletePayment } = usePayments();
  const { currency } = useSettings();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sorted = [...payments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  function startEdit(id: string) {
    const p = payments.find((p) => p.id === id);
    if (!p) return;
    setEditingId(id);
    setEditAmount(String(p.amount));
    setEditCategory(p.category);
    setEditDate(p.date);
    setEditDescription(p.description ?? "");
  }

  function saveEdit() {
    if (!editingId) return;
    const parsed = parseFloat(editAmount);
    if (isNaN(parsed) || parsed <= 0) return;
    updatePayment({
      id: editingId,
      amount: parsed,
      currency,
      category: editCategory,
      date: editDate,
      description: editDescription.trim() || undefined,
    });
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function confirmDelete() {
    if (!deletingId) return;
    deletePayment(deletingId);
    setDeletingId(null);
  }

  function symbolFor(c: Currency) {
    return CURRENCY_SYMBOLS[c] ?? "$";
  }

  return (
    <div className="page">
      <h1>Payments</h1>
      {sorted.length === 0 ? (
        <p className="empty">No payments yet. Add one!</p>
      ) : (
        <div className="card-list">
          {sorted.map((p) =>
            editingId === p.id ? (
              <div key={p.id} className="card card-editing">
                <label className="card-field">
                  Date
                  <input
                    type="date"
                    className="edit-input"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </label>
                <label className="card-field">
                  Category
                  <select
                    className="edit-input"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="card-field">
                  Amount ({CURRENCY_SYMBOLS[currency]})
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="edit-input"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                  />
                </label>
                <label className="card-field">
                  Description (optional)
                  <input
                    type="text"
                    className="edit-input"
                    placeholder="e.g. Grocery shopping"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </label>
                <div className="card-actions">
                  <button className="btn-save" onClick={saveEdit}>Save</button>
                  <button className="btn-cancel" onClick={cancelEdit}>Cancel</button>
                </div>
              </div>
            ) : (
              <div key={p.id} className="card">
                <div className="card-top">
                  <span className="card-category">{p.category}</span>
                  <span className="card-amount">
                    {symbolFor(p.currency ?? "USD")}{p.amount.toFixed(2)}
                  </span>
                </div>
                {p.description && (
                  <p className="card-description">{p.description}</p>
                )}
                <div className="card-bottom">
                  <span className="card-date">{p.date}</span>
                  <div className="card-actions">
                    <button className="btn-edit" onClick={() => startEdit(p.id)}>Edit</button>
                    <button className="btn-delete" onClick={() => setDeletingId(p.id)}>Delete</button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {deletingId && (
        <div className="dialog-overlay" onClick={() => setDeletingId(null)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Delete payment?</h3>
            <p>This action cannot be undone.</p>
            <div className="dialog-actions">
              <button className="btn-cancel" onClick={() => setDeletingId(null)}>
                Cancel
              </button>
              <button className="btn-danger-confirm" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
