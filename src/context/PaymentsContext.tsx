import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Payment } from "../types";

interface PaymentsContextType {
  payments: Payment[];
  addPayment: (payment: Omit<Payment, "id">) => void;
  updatePayment: (payment: Payment) => void;
  deletePayment: (id: string) => void;
  clearAllPayments: () => void;
}

const PaymentsContext = createContext<PaymentsContextType | null>(null);

const STORAGE_KEY = "finance_payments";

function loadPayments(): Payment[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function PaymentsProvider({ children }: { children: ReactNode }) {
  const [payments, setPayments] = useState<Payment[]>(loadPayments);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
  }, [payments]);

  function addPayment(payment: Omit<Payment, "id">) {
    setPayments((prev) => [
      ...prev,
      { ...payment, id: crypto.randomUUID() },
    ]);
  }

  function updatePayment(payment: Payment) {
    setPayments((prev) => prev.map((p) => (p.id === payment.id ? payment : p)));
  }

  function deletePayment(id: string) {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  }

  function clearAllPayments() {
    setPayments([]);
  }

  return (
    <PaymentsContext.Provider value={{ payments, addPayment, updatePayment, deletePayment, clearAllPayments }}>
      {children}
    </PaymentsContext.Provider>
  );
}

export function usePayments() {
  const ctx = useContext(PaymentsContext);
  if (!ctx) throw new Error("usePayments must be used within PaymentsProvider");
  return ctx;
}
