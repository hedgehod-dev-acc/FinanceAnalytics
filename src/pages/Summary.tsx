import { useMemo, useState } from "react";
import { usePayments } from "../context/PaymentsContext";
import { useSettings, Currency, CURRENCY_SYMBOLS } from "../context/SettingsContext";
import { Payment } from "../types";

function getAvailableMonths(dates: string[]): string[] {
  const months = new Set(dates.map((d) => d.slice(0, 7)));
  return [...months].sort().reverse();
}

function formatMonth(ym: string): string {
  const [year, month] = ym.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleString("default", { month: "long", year: "numeric" });
}

const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: "USD", label: "US Dollar ($)" },
  { value: "GEL", label: "Georgian Lari (₾)" },
];

export default function Summary() {
  const { payments } = usePayments();
  const { convert, exchangeRate } = useSettings();
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [displayCurrency, setDisplayCurrency] = useState<Currency>("USD");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const availableMonths = useMemo(
    () => getAvailableMonths(payments.map((p) => p.date)),
    [payments]
  );

  const filtered =
    selectedMonth === "all"
      ? payments
      : payments.filter((p) => p.date.startsWith(selectedMonth));

  const canConvert = exchangeRate !== null;
  const symbol = CURRENCY_SYMBOLS[displayCurrency];

  function convertAmount(p: Payment): number {
    const from = p.currency ?? "USD";
    const converted = convert(p.amount, from, displayCurrency);
    return converted ?? p.amount;
  }

  const byCategory = filtered.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + convertAmount(p);
    return acc;
  }, {});

  const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, amount]) => sum + amount, 0);

  const hasMixedCurrencies = filtered.some(
    (p) => (p.currency ?? "USD") !== displayCurrency
  );
  const showConversionWarning = hasMixedCurrencies && !canConvert;

  function toggleCategory(category: string) {
    setExpandedCategory((prev) => (prev === category ? null : category));
  }

  function paymentsForCategory(category: string): Payment[] {
    return filtered
      .filter((p) => p.category === category)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return (
    <div className="page">
      <h1>Summary by Category</h1>

      <div className="filter-bar">
        <label>
          Month
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setExpandedCategory(null);
            }}
          >
            <option value="all">All time</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {formatMonth(m)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Display currency
          <select
            value={displayCurrency}
            onChange={(e) => setDisplayCurrency(e.target.value as Currency)}
          >
            {CURRENCY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {showConversionWarning && (
        <p className="warning">
          Some payments are in a different currency. Download the exchange rate in
          Settings to see accurate totals.
        </p>
      )}

      {entries.length === 0 ? (
        <p className="empty">No payments to summarize.</p>
      ) : (
        <>
          <div className="summary-list">
            {entries.map(([category, amount]) => {
              const isExpanded = expandedCategory === category;
              const catPayments = isExpanded ? paymentsForCategory(category) : [];
              return (
                <div key={category} className="summary-group">
                  <div
                    className={`summary-row ${isExpanded ? "summary-row-expanded" : ""}`}
                    onClick={() => toggleCategory(category)}
                  >
                    <span className="summary-category">
                      <span className={`summary-chevron ${isExpanded ? "chevron-open" : ""}`}>
                        &#9654;
                      </span>
                      {category}
                    </span>
                    <span className="summary-figures">
                      <span className="summary-amount">{symbol}{amount.toFixed(2)}</span>
                      <span className="summary-pct">
                        {total > 0 ? ((amount / total) * 100).toFixed(1) : 0}%
                      </span>
                    </span>
                  </div>
                  {isExpanded && (
                    <div className="summary-details">
                      {catPayments.map((p) => (
                        <div key={p.id} className="summary-detail-row">
                          <div className="summary-detail-left">
                            <span className="summary-detail-date">{p.date}</span>
                            {p.description && (
                              <span className="summary-detail-desc">{p.description}</span>
                            )}
                          </div>
                          <span className="summary-detail-amount">
                            {symbol}{convertAmount(p).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="total-row">
            <strong>Total:</strong> <span>{symbol}{total.toFixed(2)}</span>
          </div>
        </>
      )}
    </div>
  );
}
