import { HashRouter, Routes, Route, NavLink } from "react-router-dom";
import { PaymentsProvider } from "./context/PaymentsContext";
import { SettingsProvider } from "./context/SettingsContext";
import AddPayment from "./pages/AddPayment";
import PaymentsList from "./pages/PaymentsList";
import Summary from "./pages/Summary";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <SettingsProvider>
      <PaymentsProvider>
        <HashRouter>
          <nav className="navbar">
            <NavLink to="/">Add Payment</NavLink>
            <NavLink to="/payments">Payments</NavLink>
            <NavLink to="/summary">Summary</NavLink>
            <NavLink to="/settings">Settings</NavLink>
          </nav>
          <Routes>
            <Route path="/" element={<AddPayment />} />
            <Route path="/payments" element={<PaymentsList />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </HashRouter>
      </PaymentsProvider>
    </SettingsProvider>
  );
}
