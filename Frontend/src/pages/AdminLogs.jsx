import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

const API_BASE_URL = "http://127.0.0.1:8000"

function AdminLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    try {
      const token = localStorage.getItem("access_token")

      if (!token) {
        window.location.href = "/login"
        return
      }

      const response = await fetch(
        `${API_BASE_URL}/api/admin-logs/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load admin logs."
        )
      }

      setLogs(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "-"
    }

    return new Date(dateValue).toLocaleString()
  }

  function logout() {
    localStorage.clear()
    window.location.href = "/login"
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <header className="bg-slate-900 text-white px-8 py-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Admin Logs
          </h1>

          <p className="text-sm text-slate-300 mt-1">
            Track administrator activities
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/admin-dashboard"
            className="bg-white text-slate-900 px-4 py-2 rounded-lg font-medium hover:bg-slate-200"
          >
            Dashboard
          </Link>

          <button
            onClick={logout}
            className="bg-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-8">

        <div className="bg-white rounded-xl shadow overflow-hidden">

          <div className="px-6 py-5 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Activity Logs
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Administrator actions recorded by the system
            </p>
          </div>

          {loading && (
            <div className="p-6 text-gray-600">
              Loading logs...
            </div>
          )}

          {error && (
            <div className="p-6 text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && logs.length === 0 && (
            <div className="p-6 text-gray-500">
              No admin logs found.
            </div>
          )}

          {!loading && !error && logs.length > 0 && (
            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      ID
                    </th>

                    <th className="px-6 py-4 text-left">
                      Admin
                    </th>

                    <th className="px-6 py-4 text-left">
                      Action
                    </th>

                    <th className="px-6 py-4 text-left">
                      Description
                    </th>

                    <th className="px-6 py-4 text-left">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        {log.id}
                      </td>

                      <td className="px-6 py-4 font-medium">
                        {log.admin_username}
                      </td>

                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                          {log.action}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {log.description}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(log.created_at)}
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

export default AdminLogs