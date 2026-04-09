import { useState } from "react";
import { useSettings, Currency } from "../context/SettingsContext";
import { usePayments } from "../context/PaymentsContext";

const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: "USD", label: "US Dollar ($)" },
  { value: "GEL", label: "Georgian Lari (₾)" },
];

export default function Settings() {
  const {
    currency,
    setCurrency,
    exchangeRate,
    fetchExchangeRate,
    fetchingRate,
    fetchError,
  } = useSettings();
  const { payments, clearAllPayments } = usePayments();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleClear() {
    clearAllPayments();
    setShowConfirm(false);
  }

  return (
    <div className="page">
      <h1>Settings</h1>
      <div className="form">
        <label>
          Currency
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
          >
            {CURRENCY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rate-section">
        <h2>Exchange Rate</h2>
        {exchangeRate ? (
          <div className="rate-info">
            <p>
              1 ₾ = <strong>{exchangeRate.gelToUsd.toFixed(4)}</strong> $
            </p>
            <p className="rate-date">
              Updated: {new Date(exchangeRate.updatedAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <p className="empty">No exchange rate downloaded yet.</p>
        )}
        <button
          className="btn-fetch"
          onClick={fetchExchangeRate}
          disabled={fetchingRate}
        >
          {fetchingRate ? "Downloading..." : "Download GEL-USD Rate"}
        </button>
        {fetchError && <p className="error">{fetchError}</p>}
      </div>

      <div className="danger-section">
        <h2>Data</h2>
        <p className="danger-hint">
          {payments.length} payment{payments.length !== 1 ? "s" : ""} stored
        </p>
        <button
          className="btn-danger"
          onClick={() => setShowConfirm(true)}
          disabled={payments.length === 0}
        >
          Clear All Data
        </button>
      </div>

      {showConfirm && (
        <div className="dialog-overlay" onClick={() => setShowConfirm(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Clear all data?</h3>
            <p>This will permanently delete all {payments.length} payment{payments.length !== 1 ? "s" : ""}. This action cannot be undone.</p>
            <div className="dialog-actions">
              <button className="btn-cancel" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button className="btn-danger-confirm" onClick={handleClear}>
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
