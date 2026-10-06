import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const API_BASE_URL = "http://127.0.0.1:8000"

function AdminTransactions() {
  const navigate = useNavigate()

  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [statusFilter, setStatusFilter] = useState("")
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  useEffect(() => {
    const loadTransactions = async () => {
      const token = localStorage.getItem("access_token")

      if (!token) {
        navigate("/login")
        return
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/transactions/admin/all/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load transactions"
          )
        }

        setTransactions(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [navigate])

  const filteredTransactions = transactions.filter(
    (transaction) => {
      if (
        statusFilter &&
        transaction.status !== statusFilter
      ) {
        return false
      }

      const amount = Number(transaction.amount)

      if (
        minAmount &&
        amount < Number(minAmount)
      ) {
        return false
      }

      if (
        maxAmount &&
        amount > Number(maxAmount)
      ) {
        return false
      }

      if (dateFilter) {
        const transactionDate =
          new Date(transaction.created_at)
            .toISOString()
            .split("T")[0]

        if (transactionDate !== dateFilter) {
          return false
        }
      }

      return true
    }
  )

  const resetFilters = () => {
    setStatusFilter("")
    setMinAmount("")
    setMaxAmount("")
    setDateFilter("")
  }

  const downloadCSV = async () => {
    const token = localStorage.getItem("access_token")

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/transactions/export/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(
          data.detail || "Failed to download CSV"
        )
      }

      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = "transactions.csv"

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)

    } catch (error) {
      setError(error.message)
    }
  }

  const getStatusStyle = (status) => {
    if (status === "SUCCESS") {
      return "bg-green-100 text-green-700"
    }

    if (status === "FAILED") {
      return "bg-red-100 text-red-700"
    }

    return "bg-yellow-100 text-yellow-700"
  }

  return (
    <div className="min-h-screen bg-slate-100">

      <nav className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">

          <Link
            to="/admin-dashboard"
            className="text-slate-300 hover:text-white"
          >
            ← Admin Dashboard
          </Link>

          <h1 className="text-2xl font-bold">
            Transactions
          </h1>

        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              Transaction Management
            </h2>

            <p className="text-gray-500 mt-2">
              View, filter and export payment transactions.
            </p>
          </div>

          <button
            onClick={downloadCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold"
          >
            Download CSV
          </button>

        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-6 mb-6">

          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Filters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">
                  All Statuses
                </option>

                <option value="SUCCESS">
                  SUCCESS
                </option>

                <option value="FAILED">
                  FAILED
                </option>

                <option value="PENDING">
                  PENDING
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Amount
              </label>

              <input
                type="number"
                min="0"
                value={minAmount}
                onChange={(event) =>
                  setMinAmount(event.target.value)
                }
                placeholder="₹0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Amount
              </label>

              <input
                type="number"
                min="0"
                value={maxAmount}
                onChange={(event) =>
                  setMaxAmount(event.target.value)
                }
                placeholder="₹10000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>

              <input
                type="date"
                value={dateFilter}
                onChange={(event) =>
                  setDateFilter(event.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

          </div>

          <button
            onClick={resetFilters}
            className="mt-4 bg-slate-700 hover:bg-slate-800 text-white px-5 py-2 rounded-lg"
          >
            Reset Filters
          </button>

        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            Loading transactions...
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">

            <div className="px-6 py-4 border-b bg-slate-50">
              <p className="text-gray-600">
                Showing{" "}
                <span className="font-bold">
                  {filteredTransactions.length}
                </span>{" "}
                of{" "}
                <span className="font-bold">
                  {transactions.length}
                </span>{" "}
                transactions
              </p>
            </div>

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50 border-b">

                  <tr>

                    <th className="text-left px-6 py-4">
                      ID
                    </th>

                    <th className="text-left px-6 py-4">
                      User ID
                    </th>

                    <th className="text-left px-6 py-4">
                      Card ID
                    </th>

                    <th className="text-left px-6 py-4">
                      Amount
                    </th>

                    <th className="text-left px-6 py-4">
                      Status
                    </th>

                    <th className="text-left px-6 py-4">
                      Reference
                    </th>

                    <th className="text-left px-6 py-4">
                      Date
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredTransactions.map(
                    (transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b last:border-b-0 hover:bg-slate-50"
                      >

                        <td className="px-6 py-4 font-semibold">
                          {transaction.id}
                        </td>

                        <td className="px-6 py-4">
                          {transaction.user_id}
                        </td>

                        <td className="px-6 py-4">
                          {transaction.card_id}
                        </td>

                        <td className="px-6 py-4 font-semibold">
                          ₹{transaction.amount}
                        </td>

                        <td className="px-6 py-4">

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                              transaction.status
                            )}`}
                          >
                            {transaction.status}
                          </span>

                        </td>

                        <td className="px-6 py-4 font-mono text-sm">
                          {transaction.reference}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {new Date(
                            transaction.created_at
                          ).toLocaleString()}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

            {filteredTransactions.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No transactions match the selected filters.
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  )
}

export default AdminTransactions