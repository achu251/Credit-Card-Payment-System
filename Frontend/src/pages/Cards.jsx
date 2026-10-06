import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const API_BASE_URL = "http://127.0.0.1:8000"

function Cards() {
  const navigate = useNavigate()

  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadCards = async () => {
    const token = localStorage.getItem("access_token")

    if (!token) {
      navigate("/login")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/cards/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load cards")
      }

      setCards(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCards()
  }, [])

  const handleDelete = async (cardId) => {
    const token = localStorage.getItem("access_token")

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/cards/${cardId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete card")
      }

      setCards((currentCards) =>
        currentCards.filter((card) => card.id !== cardId)
      )
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-gray-500 hover:text-blue-600"
            >
              ← Dashboard
            </Link>

            <h1 className="text-2xl font-bold text-blue-600">
              My Cards
            </h1>
          </div>

          <Link
            to="/cards/add"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold"
          >
            + Add Card
          </Link>

        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">

        <h2 className="text-3xl font-bold text-slate-800">
          Saved Cards
        </h2>

        <p className="text-gray-500 mt-2 mb-8">
          Manage your saved payment cards.
        </p>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            Loading cards...
          </div>
        ) : cards.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">

            <div className="text-5xl mb-4">
              💳
            </div>

            <h3 className="text-xl font-bold text-slate-800">
              No cards added
            </h3>

            <p className="text-gray-500 mt-2 mb-6">
              Add your first card to make payments.
            </p>

            <Link
              to="/cards/add"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Add Card
            </Link>

          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {cards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-2xl shadow p-6"
              >

                <div className="flex items-center justify-between mb-6">

                  <div className="text-3xl">
                    💳
                  </div>

                  <span className="text-sm font-semibold text-gray-500">
                    {card.card_type}
                  </span>

                </div>

                <p className="text-xl font-mono tracking-widest text-slate-800">
                  {card.masked_card}
                </p>

                <div className="mt-6 flex justify-between text-sm">

                  <div>
                    <p className="text-gray-400">
                      Expires
                    </p>

                    <p className="font-semibold">
                      {String(card.expiry_month).padStart(2, "0")}/
                      {card.expiry_year}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">
                      Last 4
                    </p>

                    <p className="font-semibold">
                      {card.last_four}
                    </p>
                  </div>

                </div>

                <button
                  onClick={() => handleDelete(card.id)}
                  className="w-full mt-6 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg font-semibold"
                >
                  Delete Card
                </button>

              </div>
            ))}

          </div>
        )}

      </main>
    </div>
  )
}

export default Cards