import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Cards from "./pages/Cards"
import AddCard from "./pages/AddCard"
import Payment from "./pages/Payment"
import Transactions from "./pages/Transactions"

import AdminDashboard from "./pages/AdminDashboard"
import AdminUsers from "./pages/AdminUsers"
import AdminCards from "./pages/AdminCards"
import AdminTransactions from "./pages/AdminTransactions"
import AdminLogs from "./pages/AdminLogs"


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/cards"
          element={<Cards />}
        />

        <Route
          path="/cards/add"
          element={<AddCard />}
        />

        <Route
          path="/payment"
          element={<Payment />}
        />

        <Route
          path="/transactions"
          element={<Transactions />}
        />

        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/users"
          element={<AdminUsers />}
        />

        <Route
          path="/admin/cards"
          element={<AdminCards />}
        />

        <Route
          path="/admin/transactions"
          element={<AdminTransactions />}
        />

        <Route
          path="/admin/logs"
          element={<AdminLogs />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App