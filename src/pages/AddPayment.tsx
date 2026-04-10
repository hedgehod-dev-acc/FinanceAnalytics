import { useState, type FormEvent } from "react";
import { usePayments } from "../context/PaymentsContext";
import { useSettings } from "../context/SettingsContext";
import { CATEGORIES } from "../categories";
import { Check, CaretDown } from "@phosphor-icons/react";
import { type Currency } from "../types";

const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: "USD", label: "USD ($)" },
  { value: "GEL", label: "GEL (\u20BE)" },
];

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export default function AddPayment() {
  const { addPayment } = usePayments();
  const { currency } = useSettings();
  const [amount, setAmount] = useState("");
  const [paymentCurrency, setPaymentCurrency] = useState<Currency>(currency);
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [date, setDate] = useState(todayString);
  const [description, setDescription] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;

    addPayment({
      amount: parsed,
      currency: paymentCurrency,
      category,
      date: date || todayString(),
      description: description.trim() || undefined,
    });
    setAmount("");
    setDate(todayString());
    setDescription("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 mb-8">
        Record expense
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount + Currency */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">Amount</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              min="0.01"
              inputMode="decimal"
              placeholder="0.00"
              className="flex-1 px-4 py-3 bg-white border border-zinc-200 rounded-xl text-base font-mono placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <div className="relative">
              <select
                value={paymentCurrency}
                onChange={(e) => setPaymentCurrency(e.target.value as Currency)}
                className="appearance-none h-full px-4 pr-9 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 cursor-pointer"
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
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

        {/* Category chips */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(({ name, icon: CatIcon }) => (
              <button
                key={name}
                type="button"
                onClick={() => setCategory(name)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98] cursor-pointer ${
                  category === name
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                    : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                }`}
              >
                <CatIcon size={18} weight={category === name ? "fill" : "regular"} />
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">Date</label>
          <input
            type="date"
            className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">
            Description
            <span className="text-zinc-400 font-normal ml-1.5">optional</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Weekly grocery run"
            className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-sm shadow-emerald-600/20"
        >
          Save expense
        </button>

        {/* Success */}
        {saved && (
          <div className="flex items-center justify-center gap-2 py-2 animate-fade-in">
            <Check size={16} weight="bold" className="text-emerald-600" />
            <span className="text-sm font-medium text-emerald-600">
              Expense recorded
            </span>
          </div>
        )}
      </form>
    </div>
  );
}
