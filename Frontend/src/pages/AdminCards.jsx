import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const API_BASE_URL = "http://127.0.0.1:8000"

function AdminCards() {
  const navigate = useNavigate()

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
              Cards
            </h1>
          </div>

        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800">
            Card Management
          </h2>

          <p className="text-gray-500 mt-2">
            View all saved cards and their owners.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            Loading cards...
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
                      Owner
                    </th>

                    <th className="text-left px-6 py-4">
                      Card
                    </th>

                    <th className="text-left px-6 py-4">
                      Type
                    </th>

                    <th className="text-left px-6 py-4">
                      Expiry
                    </th>

                    <th className="text-left px-6 py-4">
                      Added
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {cards.map((card) => (

                    <tr
                      key={card.id}
                      className="border-b last:border-b-0 hover:bg-slate-50"
                    >

                      <td className="px-6 py-4">
                        {card.id}
                      </td>

                      <td className="px-6 py-4">

                        <p className="font-semibold">
                          {card.username}
                        </p>

                        <p className="text-sm text-gray-500">
                          {card.email}
                        </p>

                      </td>

                      <td className="px-6 py-4">

                        <p className="font-mono font-semibold">
                          {card.masked_card}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          Last 4: {card.last_four}
                        </p>

                      </td>

                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          {card.card_type}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {String(card.expiry_month).padStart(2, "0")}/
                        {card.expiry_year}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {new Date(
                          card.created_at
                        ).toLocaleDateString()}
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