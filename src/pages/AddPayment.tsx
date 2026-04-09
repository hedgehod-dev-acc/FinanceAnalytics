import { useState, FormEvent } from "react";
import { usePayments } from "../context/PaymentsContext";
import { useSettings } from "../context/SettingsContext";

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

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export default function AddPayment() {
  const { addPayment } = usePayments();
  const { currency, currencySymbol } = useSettings();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(todayString);
  const [description, setDescription] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;

    addPayment({
      amount: parsed,
      currency,
      category,
      date: date || todayString(),
      description: description.trim() || undefined,
    });
    setAmount("");
    setDate(todayString());
    setDescription("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="page">
      <h1>Add Payment</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Amount ({currencySymbol})
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>

        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <label>
          Description (optional)
          <input
            type="text"
            placeholder="e.g. Grocery shopping"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <button type="submit">Add Payment</button>
        {saved && <p className="success">Payment saved!</p>}
      </form>
    </div>
  );
}
