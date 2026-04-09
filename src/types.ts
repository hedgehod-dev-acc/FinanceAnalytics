export type Currency = "USD" | "GEL";

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  GEL: "₾",
};

export interface Payment {
  id: string;
  amount: number;
  currency: Currency;
  category: string;
  date: string; // YYYY-MM-DD
  description?: string;
}
