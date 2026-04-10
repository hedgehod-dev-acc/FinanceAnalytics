import { useMemo, useState } from "react";
import { usePayments } from "../context/PaymentsContext";
import {
  useSettings,
  type Currency,
  CURRENCY_SYMBOLS,
} from "../context/SettingsContext";
import { type Payment } from "../types";
import { CATEGORIES } from "../categories";
import { CaretRight, ChartBar, Warning, CaretDown } from "@phosphor-icons/react";

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
  { value: "USD", label: "USD ($)" },
  { value: "GEL", label: "GEL (\u20BE)" },
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

  const catIcon = (name: string) => {
    const cat = CATEGORIES.find((c) => c.name === name);
    if (!cat) return null;
    const CatIcon = cat.icon;
    return <CatIcon size={16} weight="regular" />;
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 mb-6">
        Summary
      </h1>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Month
          </label>
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setExpandedCategory(null);
              }}
              className="w-full appearance-none px-3 py-2.5 pr-9 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 cursor-pointer"
            >
              <option value="all">All time</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonth(m)}
                </option>
              ))}
            </select>
            <CaretDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Currency
          </label>
          <div className="relative">
            <select
              value={displayCurrency}
              onChange={(e) =>
                setDisplayCurrency(e.target.value as Currency)
              }
              className="w-full appearance-none px-3 py-2.5 pr-9 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 cursor-pointer"
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

      {/* Conversion warning */}
      {showConversionWarning && (
        <div className="flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200/60 rounded-xl mb-6 animate-fade-in">
          <Warning
            size={18}
            weight="fill"
            className="text-amber-500 shrink-0 mt-0.5"
          />
          <p className="text-sm text-amber-800 leading-relaxed">
            Some payments use a different currency. Download the exchange rate in
            Settings to see accurate totals.
          </p>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
            <ChartBar size={28} className="text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-500 mb-1">
            Nothing to summarize
          </p>
          <p className="text-xs text-zinc-400">
            Add some expenses to see your breakdown
          </p>
        </div>
      ) : (
        <>
          {/* Category breakdown */}
          <div className="space-y-2">
            {entries.map(([category, amount], i) => {
              const pct = total > 0 ? (amount / total) * 100 : 0;
              const isExpanded = expandedCategory === category;
              const catPayments = isExpanded
                ? paymentsForCategory(category)
                : [];

              return (
                <div
                  key={category}
                  className="bg-white rounded-2xl border border-zinc-200/60 overflow-hidden animate-list-in"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 transition-colors duration-150 hover:bg-zinc-50/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 text-zinc-600">
                      {catIcon(category)}
                      <span className="text-sm font-semibold text-zinc-900">
                        {category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold tabular-nums text-zinc-900">
                        {symbol}
                        {amount.toFixed(2)}
                      </span>
                      <span className="text-xs text-zinc-400 w-12 text-right font-mono tabular-nums">
                        {pct.toFixed(1)}%
                      </span>
                      <CaretRight
                        size={14}
                        className={`text-zinc-400 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                      />
                    </div>
                  </button>

                  {/* Progress bar */}
                  <div className="px-5 pb-4 -mt-1">
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-zinc-100 animate-fade-in">
                      {catPayments.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between px-5 py-3 text-sm border-b border-zinc-50 last:border-b-0"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-zinc-600 tabular-nums text-xs">
                              {p.date}
                            </span>
                            {p.description && (
                              <span className="text-zinc-400 text-xs">
                                {p.description}
                              </span>
                            )}
                          </div>
                          <span className="font-mono tabular-nums font-medium text-zinc-700">
                            {symbol}
                            {convertAmount(p).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="mt-4 px-5 py-4 bg-zinc-900 rounded-2xl flex items-center justify-between animate-slide-up">
            <span className="text-sm font-medium text-zinc-400">Total</span>
            <span className="font-mono text-lg font-semibold text-white tabular-nums">
              {symbol}
              {total.toFixed(2)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
