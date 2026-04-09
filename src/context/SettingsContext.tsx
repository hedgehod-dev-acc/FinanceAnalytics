import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Currency, CURRENCY_SYMBOLS } from "../types";

export type { Currency };
export { CURRENCY_SYMBOLS };

interface ExchangeRate {
  gelToUsd: number;
  updatedAt: string; // ISO date
}

interface SettingsContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  currencySymbol: string;
  exchangeRate: ExchangeRate | null;
  fetchExchangeRate: () => Promise<void>;
  fetchingRate: boolean;
  fetchError: string | null;
  convert: (amount: number, from: Currency, to: Currency) => number | null;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

const SETTINGS_KEY = "finance_settings";
const RATE_KEY = "finance_exchange_rate";

interface StoredSettings {
  currency: Currency;
}

function loadSettings(): StoredSettings {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.currency === "USD" || parsed.currency === "GEL") return parsed;
  }
  return { currency: "USD" };
}

function loadRate(): ExchangeRate | null {
  const stored = localStorage.getItem(RATE_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() => loadSettings().currency);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(loadRate);
  const [fetchingRate, setFetchingRate] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ currency }));
  }, [currency]);

  useEffect(() => {
    if (exchangeRate) {
      localStorage.setItem(RATE_KEY, JSON.stringify(exchangeRate));
    }
  }, [exchangeRate]);

  async function fetchExchangeRate() {
    setFetchingRate(true);
    setFetchError(null);
    try {
      const res = await fetch(
        "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/gel.json"
      );
      if (!res.ok) throw new Error("Failed to fetch rate");
      const data = await res.json();
      const rate = data.gel?.usd;
      if (typeof rate !== "number") throw new Error("Invalid rate data");
      setExchangeRate({ gelToUsd: rate, updatedAt: new Date().toISOString() });
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setFetchingRate(false);
    }
  }

  function convert(amount: number, from: Currency, to: Currency): number | null {
    if (from === to) return amount;
    if (!exchangeRate) return null;
    if (from === "GEL" && to === "USD") return amount * exchangeRate.gelToUsd;
    if (from === "USD" && to === "GEL") return amount / exchangeRate.gelToUsd;
    return null;
  }

  return (
    <SettingsContext.Provider
      value={{
        currency,
        setCurrency,
        currencySymbol: CURRENCY_SYMBOLS[currency],
        exchangeRate,
        fetchExchangeRate,
        fetchingRate,
        fetchError,
        convert,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
