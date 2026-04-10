import { HashRouter, Routes, Route, NavLink } from "react-router-dom";
import { PaymentsProvider } from "./context/PaymentsContext";
import { SettingsProvider } from "./context/SettingsContext";
import {
  Plus,
  Receipt,
  ChartBar,
  GearSix,
  type Icon,
} from "@phosphor-icons/react";
import AddPayment from "./pages/AddPayment";
import PaymentsList from "./pages/PaymentsList";
import Summary from "./pages/Summary";
import Settings from "./pages/Settings";

interface NavItem {
  to: string;
  label: string;
  icon: Icon;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Add", icon: Plus },
  { to: "/payments", label: "Payments", icon: Receipt },
  { to: "/summary", label: "Summary", icon: ChartBar },
  { to: "/settings", label: "Settings", icon: GearSix },
];

export default function App() {
  return (
    <SettingsProvider>
      <PaymentsProvider>
        <HashRouter>
          <div className="min-h-[100dvh] bg-zinc-50">
            {/* ── Desktop top bar ── */}
            <header className="hidden md:block sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-200/60">
              <div className="max-w-2xl mx-auto flex items-center justify-between px-8 h-16">
                <span className="text-lg font-semibold tracking-tight text-zinc-900">
                  Finance
                </span>
                <nav className="flex items-center gap-1">
                  {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === "/"}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={18}
                            weight={isActive ? "fill" : "regular"}
                          />
                          <span>{label}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </nav>
              </div>
            </header>

            {/* ── Page content ── */}
            <main className="max-w-2xl mx-auto px-4 py-6 pb-28 md:px-8 md:py-10 md:pb-10">
              <Routes>
                <Route path="/" element={<AddPayment />} />
                <Route path="/payments" element={<PaymentsList />} />
                <Route path="/summary" element={<Summary />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>

            {/* ── Mobile bottom bar ── */}
            <nav className="fixed bottom-0 inset-x-0 md:hidden bg-white/80 backdrop-blur-xl border-t border-zinc-200/60 z-40 pb-[env(safe-area-inset-bottom)]">
              <div className="flex">
                {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/"}
                    className={({ isActive }) =>
                      `flex-1 flex flex-col items-center gap-1 pt-3 pb-2 text-[11px] font-medium transition-colors duration-200 ${
                        isActive ? "text-emerald-600" : "text-zinc-400"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={22}
                          weight={isActive ? "fill" : "regular"}
                        />
                        <span>{label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </nav>
          </div>
        </HashRouter>
      </PaymentsProvider>
    </SettingsProvider>
  );
}
