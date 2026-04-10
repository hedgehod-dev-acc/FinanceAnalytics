import { useState } from "react";
import { useSettings, type Currency } from "../context/SettingsContext";
import { usePayments } from "../context/PaymentsContext";
import {
  ArrowsClockwise,
  Trash,
  CaretDown,
  CurrencyDollar,
} from "@phosphor-icons/react";

const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: "USD", label: "US Dollar ($)" },
  { value: "GEL", label: "Georgian Lari (\u20BE)" },
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
    <div className="animate-fade-in">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 mb-8">
        Settings
      </h1>

      {/* ── Currency ── */}
      <section className="mb-10">
        <label className="text-sm font-medium text-zinc-700 mb-2 block">
          Default currency
        </label>
        <div className="relative">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="w-full appearance-none px-4 py-3 pr-10 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 cursor-pointer"
          >
            {CURRENCY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <CaretDown
            size={14}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          />
        </div>
      </section>

      {/* ── Exchange Rate ── */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
          Exchange Rate
        </h2>

        {exchangeRate ? (
          <div className="bg-white border border-zinc-200/60 rounded-2xl px-5 py-4 mb-4">
            <div className="flex items-center gap-2.5 mb-1">
              <CurrencyDollar size={16} className="text-emerald-600" />
              <span className="text-sm text-zinc-700">
                1 {"\u20BE"} ={" "}
                <span className="font-mono font-semibold tabular-nums">
                  {exchangeRate.gelToUsd.toFixed(4)}
                </span>{" "}
                $
              </span>
            </div>
            <p className="text-xs text-zinc-400 ml-[26px]">
              Updated{" "}
              {new Date(exchangeRate.updatedAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 mb-4 bg-white border border-zinc-200/60 rounded-2xl">
            <CurrencyDollar size={24} className="text-zinc-300 mb-2" />
            <p className="text-sm text-zinc-400">
              No exchange rate downloaded yet
            </p>
          </div>
        )}

        <button
          onClick={fetchExchangeRate}
          disabled={fetchingRate}
          className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <ArrowsClockwise
            size={16}
            className={fetchingRate ? "animate-spin" : ""}
          />
          {fetchingRate ? "Downloading..." : "Download GEL-USD rate"}
        </button>

        {fetchError && (
          <p className="text-sm text-rose-600 mt-3 animate-fade-in">
            {fetchError}
          </p>
        )}
      </section>

      {/* ── Danger Zone ── */}
      <section className="pt-8 border-t border-zinc-200">
        <h2 className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-3">
          Danger Zone
        </h2>
        <p className="text-sm text-zinc-500 mb-4">
          <span className="font-mono tabular-nums">{payments.length}</span>{" "}
          payment{payments.length !== 1 ? "s" : ""} stored locally
        </p>
        <button
          onClick={() => setShowConfirm(true)}
          disabled={payments.length === 0}
          className="w-full flex items-center justify-center gap-2 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <Trash size={16} />
          Clear all data
        </button>
      </section>

      {/* ── Confirm dialog ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-white/20 animate-scale-in">
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              Clear all data?
            </h3>
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
              This will permanently delete all{" "}
              <span className="font-mono font-medium tabular-nums">
                {payments.length}
              </span>{" "}
              payment{payments.length !== 1 ? "s" : ""}. This cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="py-3 rounded-xl bg-zinc-100 text-sm font-medium text-zinc-700 hover:bg-zinc-200 transition-colors duration-200 active:scale-[0.98] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClear}
                className="py-3 rounded-xl bg-rose-600 text-sm font-medium text-white hover:bg-rose-700 transition-colors duration-200 active:scale-[0.98] cursor-pointer"
              >
                Delete all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
