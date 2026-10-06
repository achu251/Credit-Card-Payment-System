import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const API_BASE_URL = "http://127.0.0.1:8000"

function AdminUsers() {
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadUsers = async () => {
      const token = localStorage.getItem("access_token")

      if (!token) {
        navigate("/login")
        return
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/auth/admin/users/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load users"
          )
        }

        setUsers(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [navigate])

  return (
    <div className="min-h-screen bg-slate-100">

      <nav className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-4">
            <Link
              to="/admin-dashboard"
              className="text-slate-300 hover:text-white"
            >
              ← Admin Dashboard
            </Link>

            <h1 className="text-2xl font-bold">
              Users
            </h1>
          </div>

        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800">
            User Management
          </h2>

          <p className="text-gray-500 mt-2">
            View all registered users.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            Loading users...
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-4">
                      ID
                    </th>

                    <th className="text-left px-6 py-4">
                      Username
                    </th>

                    <th className="text-left px-6 py-4">
                      Email
                    </th>

                    <th className="text-left px-6 py-4">
                      Role
                    </th>

                    <th className="text-left px-6 py-4">
                      Status
                    </th>

                    <th className="text-left px-6 py-4">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b last:border-b-0 hover:bg-slate-50"
                    >

                      <td className="px-6 py-4">
                        {user.id}
                      </td>

                      <td className="px-6 py-4 font-semibold">
                        {user.username}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {user.email}
                      </td>

                      <td className="px-6 py-4">

                        {user.is_superuser ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                            Super Admin
                          </span>
                        ) : user.is_staff ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            Admin
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                            User
                          </span>
                        )}

                      </td>

                      <td className="px-6 py-4">

                        {user.is_active ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            Inactive
                          </span>
                        )}

                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {new Date(
                          user.created_at
                        ).toLocaleDateString()}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

            {users.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No users found.
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  )
}

export default AdminUsers