import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

const API_BASE_URL = "http://127.0.0.1:8000"

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDashboard()
  }, [])

  async function fetchDashboard() {
    try {
      const token = localStorage.getItem("access_token")

      if (!token) {
        window.location.href = "/login"
        return
      }

      const response = await fetch(
        `${API_BASE_URL}/api/transactions/admin-dashboard/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load admin dashboard."
        )
      }

      setDashboard(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.clear()
    window.location.href = "/login"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">
          Loading admin dashboard...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  const today = dashboard?.today || {}

  const totalPayments = today.total_payments || 0
  const successfulPayments = today.successful_payments || 0
  const failedPayments = today.failed_payments || 0
  const pendingPayments = today.pending_payments || 0

  const successfulPercentage =
    totalPayments > 0
      ? Math.round((successfulPayments / totalPayments) * 100)
      : 0

  const failedPercentage =
    totalPayments > 0
      ? Math.round((failedPayments / totalPayments) * 100)
      : 0

  const pendingPercentage =
    totalPayments > 0
      ? Math.round((pendingPayments / totalPayments) * 100)
      : 0

  return (
    <div className="min-h-screen bg-gray-100">

      <header className="bg-slate-900 text-white px-8 py-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Admin Dashboard
          </h1>

          <p className="text-sm text-slate-300 mt-1">
            Credit Card Payment System
          </p>
        </div>

        <button
          onClick={logout}
          className="bg-red-600 px-5 py-2 rounded-lg font-medium hover:bg-red-700"
        >
          Logout
        </button>
      </header>

      <main className="p-8">

        {/* Summary Cards */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500 text-sm">
              Total Users
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              {dashboard?.total_users || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500 text-sm">
              Total Cards
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              {dashboard?.total_cards || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500 text-sm">
              Total Transactions
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              {dashboard?.total_transactions || 0}
            </p>
          </div>

        </div>


        {/* Management */}

        <div className="mt-8">

          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Management
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <Link
              to="/admin/users"
              className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-bold text-slate-900">
                Manage Users
              </h3>

              <p className="text-gray-500 text-sm mt-2">
                View registered users and account status.
              </p>
            </Link>


            <Link
              to="/admin/cards"
              className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-bold text-slate-900">
                Manage Cards
              </h3>

              <p className="text-gray-500 text-sm mt-2">
                View stored card information securely.
              </p>
            </Link>


            <Link
              to="/admin/transactions"
              className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-bold text-slate-900">
                Manage Transactions
              </h3>

              <p className="text-gray-500 text-sm mt-2">
                View and filter payment transactions.
              </p>
            </Link>


            <Link
              to="/admin/logs"
              className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-bold text-slate-900">
                Admin Logs
              </h3>

              <p className="text-gray-500 text-sm mt-2">
                Track administrator activities and actions.
              </p>
            </Link>

          </div>

        </div>


        {/* Today's Payments */}

        <div className="mt-8">

          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Today's Payments
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-gray-500 text-sm">
                Total Payments
              </p>

              <p className="text-2xl font-bold mt-2">
                {totalPayments}
              </p>
            </div>


            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-gray-500 text-sm">
                Successful
              </p>

              <p className="text-2xl font-bold text-green-600 mt-2">
                {successfulPayments}
              </p>
            </div>


            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-gray-500 text-sm">
                Failed
              </p>

              <p className="text-2xl font-bold text-red-600 mt-2">
                {failedPayments}
              </p>
            </div>


            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-gray-500 text-sm">
                Pending
              </p>

              <p className="text-2xl font-bold text-yellow-600 mt-2">
                {pendingPayments}
              </p>
            </div>


            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-gray-500 text-sm">
                Successful Amount
              </p>

              <p className="text-2xl font-bold text-slate-900 mt-2">
                ₹{today.total_successful_amount || "0"}
              </p>
            </div>

          </div>

        </div>


        {/* Payment Status Overview */}

        <div className="mt-8 bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold text-gray-800">
            Payment Status Overview
          </h2>

          <div className="mt-6 space-y-5">

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">
                  Successful
                </span>

                <span className="text-sm text-gray-500">
                  {successfulPercentage}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{
                    width: `${successfulPercentage}%`,
                  }}
                />
              </div>
            </div>


            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">
                  Failed
                </span>

                <span className="text-sm text-gray-500">
                  {failedPercentage}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full"
                  style={{
                    width: `${failedPercentage}%`,
                  }}
                />
              </div>
            </div>


            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">
                  Pending
                </span>

                <span className="text-sm text-gray-500">
                  {pendingPercentage}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-yellow-500 h-3 rounded-full"
                  style={{
                    width: `${pendingPercentage}%`,
                  }}
                />
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  )
}

export default AdminDashboard