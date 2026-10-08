import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTheme } from "../components/ThemeContext"

const API_BASE_URL = "http://127.0.0.1:8000"

function AdminCards() {
  const navigate = useNavigate()
  const { isDarkMode, toggleTheme } = useTheme()

  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadCards = async () => {
      const token = localStorage.getItem("access_token")

      if (!token) {
        navigate("/login")
        return
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/cards/admin/all/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load cards"
          )
        }

        setCards(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadCards()
  }, [navigate])

  const handleUpdateCard = async (cardId, updates) => {
    const token = localStorage.getItem("access_token")
    try {
      const response = await fetch(`${API_BASE_URL}/api/cards/admin/${cardId}/update/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })
      if (!response.ok) throw new Error("Failed to update card")
      
      setCards(cards.map(c => c.id === cardId ? { ...c, ...updates } : c))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-200">

      <nav className="bg-slate-900 dark:bg-slate-950 text-white border-b dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-4">
            <Link
              to="/admin-dashboard"
              className="text-slate-300 hover:text-white"
            >
              ← Admin Dashboard
            </Link>

            <h1 className="text-2xl font-bold">
              Cards
            </h1>
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
            Card Management
          </h2>

          <p className="text-gray-500 dark:text-gray-400 mt-2">
            View all saved cards and their owners.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900 dark:border-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-8 text-center dark:text-gray-300">
            Loading cards...
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50 dark:bg-slate-700 border-b dark:border-slate-600 text-gray-700 dark:text-gray-300">

                  <tr>

                    <th className="text-left px-6 py-4">
                      ID
                    </th>

                    <th className="text-left px-6 py-4">
                      Owner
                    </th>

                    <th className="text-left px-6 py-4">
                      Card
                    </th>

                    <th className="text-left px-6 py-4">
                      Type
                    </th>

                    <th className="text-left px-6 py-4">
                      Status
                    </th>

                    <th className="text-left px-6 py-4">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {cards.map((card) => (
                    <tr
                      key={card.id}
                      className="border-b dark:border-slate-600 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >

                      <td className="px-6 py-4 dark:text-gray-300">
                        {card.id}
                      </td>

                      <td className="px-6 py-4">

                        <p className="font-semibold dark:text-white">
                          {card.username}
                        </p>

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {card.email}
                        </p>

                      </td>

                      <td className="px-6 py-4">

                        <p className="font-mono font-semibold dark:text-gray-300">
                          {card.masked_card}
                        </p>

                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Exp: {String(card.expiry_month).padStart(2, "0")}/{card.expiry_year}
                        </p>

                      </td>

                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                          {card.card_type}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${card.is_blocked ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'}`}>
                          {card.is_blocked ? "Blocked" : "Active"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleUpdateCard(card.id, { is_blocked: !card.is_blocked })}
                            className={`px-3 py-1 text-xs rounded font-medium ${card.is_blocked ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                          >
                            {card.is_blocked ? "Unblock" : "Block"}
                          </button>
                          <div className="flex gap-2 items-center">
                            <input
                              type="number"
                              defaultValue={card.credit_limit}
                              id={`limit-${card.id}`}
                              className="border dark:border-slate-600 rounded px-2 py-1 text-xs w-20 dark:bg-slate-700 dark:text-white"
                            />
                            <button
                              onClick={() => {
                                const val = document.getElementById(`limit-${card.id}`).value
                                handleUpdateCard(card.id, { credit_limit: val })
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            {cards.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No cards found.
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  )
}

export default AdminCards