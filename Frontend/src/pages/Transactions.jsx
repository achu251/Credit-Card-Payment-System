import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const API_BASE_URL = "http://127.0.0.1:8000"

function Transactions() {
  const navigate = useNavigate()

  const [transactions, setTransactions] = useState([])

  const [status, setStatus] = useState("")
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState("")

  const getToken = () => {
    const token = localStorage.getItem("access_token")

    if (!token) {
      navigate("/login")
      return null
    }

    return token
  }

  const loadTransactions = async () => {
    const token = getToken()

    if (!token) {
      return
    }

    setLoading(true)
    setError("")

    try {
      const params = new URLSearchParams()

      if (status) {
        params.append("status", status)
      }

      if (minAmount) {
        params.append("min_amount", minAmount)
      }

      if (maxAmount) {
        params.append("max_amount", maxAmount)
      }

      if (startDate) {
        params.append("start_date", startDate)
      }

      if (endDate) {
        params.append("end_date", endDate)
      }

      const query = params.toString()

      const url = query
        ? `${API_BASE_URL}/api/transactions/?${query}`
        : `${API_BASE_URL}/api/transactions/`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.status === 401) {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        navigate("/login")
        return
      }

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load transactions."
        )
      }

      setTransactions(Array.isArray(data) ? data : [])
    } catch (error) {
      setError(error.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  const handleFilter = (event) => {
    event.preventDefault()

    setError("")

    if (
      minAmount &&
      maxAmount &&
      Number(minAmount) > Number(maxAmount)
    ) {
      setError("Minimum amount cannot be greater than maximum amount.")
      return
    }

    if (startDate && endDate && startDate > endDate) {
      setError("Start date cannot be after end date.")
      return
    }

    loadTransactions()
  }

  const clearFilters = () => {
    setStatus("")
    setMinAmount("")
    setMaxAmount("")
    setStartDate("")
    setEndDate("")
    setError("")

    setTimeout(() => {
      loadTransactions()
    }, 0)
  }

  const downloadCSV = async () => {
    const token = getToken()

    if (!token) {
      return
    }

    setDownloading(true)
    setError("")

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/transactions/export/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.status === 401) {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        navigate("/login")
        return
      }

      if (!response.ok) {
        let message = "Failed to download CSV."

        try {
          const data = await response.json()
          message = data.detail || message
        } catch {
          // Keep default error message.
        }

        throw new Error(message)
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
      setError(error.message || "Failed to download CSV.")
    } finally {
      setDownloading(false)
    }
  }

  const getStatusClasses = (transactionStatus) => {
    if (transactionStatus === "SUCCESS") {
      return "bg-green-100 text-green-700"
    }

    if (transactionStatus === "FAILED") {
      return "bg-red-100 text-red-700"
    }

    return "bg-yellow-100 text-yellow-700"
  }

  const getStatusLabel = (transactionStatus) => {
    if (transactionStatus === "SUCCESS") {
      return "Success"
    }

    if (transactionStatus === "FAILED") {
      return "Failed"
    }

    return "Pending"
  }

  const formatAmount = (amount) => {
    const numericAmount = Number(amount)

    if (Number.isNaN(numericAmount)) {
      return amount
    }

    return numericAmount.toFixed(2)
  }

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-"
    }

    const date = new Date(dateValue)

    if (Number.isNaN(date.getTime())) {
      return dateValue
    }

    return date.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Navbar */}

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">

          <div className="flex items-center gap-4">

            <Link
              to="/dashboard"
              className="text-gray-500 hover:text-blue-600 font-medium"
            >
              ← Dashboard
            </Link>

            <h1 className="text-2xl font-bold text-blue-600">
              Transactions
            </h1>

          </div>

          <button
            onClick={downloadCSV}
            disabled={downloading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-5 py-2 rounded-lg font-semibold transition"
          >
            {downloading ? "Downloading..." : "Download CSV"}
          </button>

        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Page Header */}

        <div className="mb-8">

          <h2 className="text-3xl font-bold text-slate-800">
            Transaction History
          </h2>

          <p className="text-gray-500 mt-2">
            View and filter your payment transactions.
          </p>

        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}

        <div className="bg-white rounded-2xl shadow p-6 mb-8">

          <h3 className="text-lg font-bold text-slate-800 mb-5">
            Filters
          </h3>

          <form onSubmit={handleFilter}>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

              {/* Status */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="SUCCESS">Success</option>
                  <option value="FAILED">Failed</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>

              {/* Minimum Amount */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Amount
                </label>

                <input
                  type="number"
                  min="0"
                  max="100000"
                  step="0.01"
                  value={minAmount}
                  onChange={(event) => setMinAmount(event.target.value)}
                  placeholder="₹ Min"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Maximum Amount */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Amount
                </label>

                <input
                  type="number"
                  min="0"
                  max="100000"
                  step="0.01"
                  value={maxAmount}
                  onChange={(event) => setMaxAmount(event.target.value)}
                  placeholder="₹ Max"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Start Date */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* End Date */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>

                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>

            {/* Filter Buttons */}

            <div className="flex gap-3 mt-5">

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                {loading ? "Loading..." : "Apply Filters"}
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold transition"
              >
                Clear
              </button>

            </div>

          </form>

        </div>

        {/* Transaction Count */}

        {!loading && (
          <div className="mb-4 text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {transactions.length}
            </span>{" "}
            transaction{transactions.length !== 1 ? "s" : ""}
          </div>
        )}

        {/* Transactions Table */}

        <div className="bg-white rounded-2xl shadow overflow-hidden">

          {loading ? (
            <div className="p-10 text-center">

              <div className="text-4xl mb-4">
                ⏳
              </div>

              <p className="text-gray-500">
                Loading transactions...
              </p>

            </div>
          ) : transactions.length === 0 ? (
            <div className="p-10 text-center">

              <div className="text-5xl mb-4">
                📜
              </div>

              <h3 className="text-xl font-bold text-slate-800">
                No transactions found
              </h3>

              <p className="text-gray-500 mt-2">
                Try changing your filters or make a payment first.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50 border-b">

                  <tr>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      ID
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Card
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Amount
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Reference
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Date
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {transactions.map((transaction) => (

                    <tr
                      key={transaction.id}
                      className="border-b last:border-b-0 hover:bg-slate-50"
                    >

                      {/* ID */}

                      <td className="px-6 py-4 font-semibold text-slate-800">
                        #{transaction.id}
                      </td>

                      {/* Card */}

                      <td className="px-6 py-4">
                        <span className="font-mono text-sm">
                          ****{String(transaction.card_id).slice(-4)}
                        </span>
                      </td>

                      {/* Amount */}

                      <td className="px-6 py-4 font-semibold text-slate-800">
                        ₹{formatAmount(transaction.amount)}
                      </td>

                      {/* Status */}

                      <td className="px-6 py-4">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(
                            transaction.status
                          )}`}
                        >
                          {getStatusLabel(transaction.status)}
                        </span>

                      </td>

                      {/* Reference */}

                      <td className="px-6 py-4 font-mono text-sm text-gray-700">
                        {transaction.reference}
                      </td>

                      {/* Date */}

                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(transaction.created_at)}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </main>

    </div>
  )
}

export default Transactions