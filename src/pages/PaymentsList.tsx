import { useState } from "react";
import { usePayments } from "../context/PaymentsContext";
import { useSettings } from "../context/SettingsContext";
import { Currency, CURRENCY_SYMBOLS } from "../types";
import { CATEGORIES } from "../categories";
import {
  Receipt,
  PencilSimple,
  Trash,
  Check,
  X,
  CaretDown,
} from "@phosphor-icons/react";

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

  function confirmDelete() {
    if (!deletingId) return;
    deletePayment(deletingId);
    setDeletingId(null);
  }

  function symbolFor(c: Currency) {
    return CURRENCY_SYMBOLS[c] ?? "$";
  }

  const catIcon = (name: string) => {
    const cat = CATEGORIES.find((c) => c.name === name);
    if (!cat) return null;
    const CatIcon = cat.icon;
    return <CatIcon size={16} weight="regular" className="text-zinc-400" />;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Payments
        </h1>
        {payments.length > 0 && (
          <span className="text-sm text-zinc-400 font-mono tabular-nums">
            {payments.length}
          </span>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
            <Receipt size={28} className="text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-500 mb-1">
            No payments yet
          </p>
          <p className="text-xs text-zinc-400">
            Start tracking by adding your first expense
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200/60 overflow-hidden divide-y divide-zinc-100">
          {sorted.map((p, i) =>
            editingId === p.id ? (
              <div
                key={p.id}
                className="px-5 py-4 bg-zinc-50 ring-2 ring-inset ring-emerald-500/20 space-y-3 animate-fade-in"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-500">
                      Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-500">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        className="w-full appearance-none px-3 py-2.5 pr-9 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 cursor-pointer"
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <CaretDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-500">
                    Amount ({CURRENCY_SYMBOLS[currency]})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-500">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    className="w-full px-3 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={saveEdit}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98] cursor-pointer"
                  >
                    <Check size={14} weight="bold" />
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98] cursor-pointer"
                  >
                    <X size={14} weight="bold" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={p.id}
                className="group px-5 py-4 transition-colors duration-150 hover:bg-zinc-50/50 animate-list-in"
                style={{ animationDelay: `${Math.min(i, 15) * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {catIcon(p.category)}
                      <span className="text-sm font-semibold text-zinc-900">
                        {p.category}
                      </span>
                    </div>
                    {p.description && (
                      <p className="text-sm text-zinc-400 truncate mb-0.5">
                        {p.description}
                      </p>
                    )}
                    <span className="text-xs text-zinc-400 tabular-nums">
                      {p.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold font-mono tabular-nums text-zinc-900">
                      {symbolFor(p.currency ?? "USD")}
                      {p.amount.toFixed(2)}
                    </span>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 md:transition-opacity md:duration-200 max-md:opacity-100">
                      <button
                        onClick={() => startEdit(p.id)}
                        className="p-2 rounded-lg text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-150 cursor-pointer"
                        aria-label="Edit payment"
                      >
                        <PencilSimple size={16} />
                      </button>
                      <button
                        onClick={() => setDeletingId(p.id)}
                        className="p-2 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors duration-150 cursor-pointer"
                        aria-label="Delete payment"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
            onClick={() => setDeletingId(null)}
          />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-white/20 animate-scale-in">
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              Delete payment?
            </h3>
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
              This action cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="py-3 rounded-xl bg-zinc-100 text-sm font-medium text-zinc-700 hover:bg-zinc-200 transition-colors duration-200 active:scale-[0.98] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="py-3 rounded-xl bg-rose-600 text-sm font-medium text-white hover:bg-rose-700 transition-colors duration-200 active:scale-[0.98] cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
