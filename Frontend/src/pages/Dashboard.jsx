import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTheme } from "../components/ThemeContext"

const API_BASE_URL = "http://127.0.0.1:8001"

function Dashboard() {
  const navigate = useNavigate()
  const { isDarkMode, toggleTheme } = useTheme()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadDashboard = async () => {
      const token = localStorage.getItem("access_token")
      if (!token) {
        navigate("/login")
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()

        if (response.status === 401) {
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          navigate("/login")
          return
        }

        if (!response.ok) {
          throw new Error(data.detail || "Failed to load dashboard summary.")
        }

        setSummary(data)
      } catch (err) {
        setError(err.message || "Unable to load dashboard summary.")
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    navigate("/login")
  }

  const formatAmount = (amount) => {
    const value = Number(amount)
    return Number.isNaN(value) ? "0.00" : value.toFixed(2)
  }

  const formatDate = (value) => {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
  }

  const statusClass = (status) =>
    status === "SUCCESS"
      ? "bg-green-100 text-green-700"
      : status === "FAILED"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700"

  const statusLabel = (status) =>
    status === "SUCCESS" ? "Success" : status === "FAILED" ? "Failed" : "Pending"

  const stats = summary
    ? [
        ["Total Spent", `₹${formatAmount(summary.total_amount_spent)}`, "💰"],
        ["Available Credit", `₹${formatAmount(summary.available_credit_limit)}`, "💳"],
        ["Total Transactions", summary.total_transactions, "📊"],
        ["This Month", `₹${formatAmount(summary.current_month_spending)}`, "📅"],
      ]
    : []

  const handleDownloadStatement = () => {
    const token = localStorage.getItem("access_token")
    fetch(`${API_BASE_URL}/dashboard/statement`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "statement.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch(err => console.error(err));
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-200">
      <nav className="bg-white dark:bg-slate-800 border-b dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">CreditPay</h1>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white">
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-medium">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Dashboard</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Quick overview of your credit card usage and recent activity.</p>
          </div>
          <button onClick={handleDownloadStatement} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow">
            📄 Download Statement
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900 dark:text-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 animate-pulse">
                  <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg mb-5" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-3" />
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 animate-pulse space-y-4">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48" />
              {[1,2,3,4,5].map((item) => <div key={item} className="h-12 bg-slate-100 dark:bg-slate-700 rounded" />)}
            </div>
          </>
        ) : summary ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map(([label, value, icon]) => (
                <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
                  <div className="text-3xl mb-4">{icon}</div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white mt-2">{value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow overflow-hidden">
              <div className="px-6 py-5 border-b dark:border-slate-700 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Last 5 Transactions</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your most recent payment activity.</p>
                </div>
                <Link to="/transactions" className="text-blue-600 dark:text-blue-400 font-semibold text-sm">View All</Link>
              </div>

              {summary.last_5_transactions.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No transactions yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700 border-b dark:border-slate-600">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Amount</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Card</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.last_5_transactions.map((transaction, index) => (
                        <tr key={`${transaction.date}-${index}`} className="border-b dark:border-slate-600 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700">
                          <td className="px-6 py-4 font-semibold dark:text-white">₹{formatAmount(transaction.amount)}</td>
                          <td className="px-6 py-4 font-mono text-sm dark:text-gray-300">{transaction.masked_card}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass(transaction.status)}`}>
                              {statusLabel(transaction.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(transaction.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Link to="/cards" className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 hover:shadow-lg transition">
                <div className="text-3xl mb-4">💳</div><h3 className="text-xl font-bold dark:text-white">My Cards</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Add and manage your saved cards.</p>
              </Link>
              <Link to="/payment" className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 hover:shadow-lg transition">
                <div className="text-3xl mb-4">💰</div><h3 className="text-xl font-bold dark:text-white">Make Payment</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Make a secure payment using your card.</p>
              </Link>
              <Link to="/transactions" className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 hover:shadow-lg transition">
                <div className="text-3xl mb-4">📜</div><h3 className="text-xl font-bold dark:text-white">Transactions</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">View your complete payment history.</p>
              </Link>
            </div>
          </>
        ) : null}
      </main>
    </div>
  )
}

export default Dashboard
