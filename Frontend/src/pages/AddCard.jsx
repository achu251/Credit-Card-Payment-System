import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const API_BASE_URL = "http://127.0.0.1:8000"

function AddCard() {
  const navigate = useNavigate()

  const [cardNumber, setCardNumber] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardType, setCardType] = useState("VISA")
  const [expiryMonth, setExpiryMonth] = useState("")
  const [expiryYear, setExpiryYear] = useState("")

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError("")
    setLoading(true)

    const token = localStorage.getItem("access_token")

    if (!token) {
      navigate("/login")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/cards/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          card_number: cardNumber,
          cvv: cvv,
          card_type: cardType,
          expiry_month: Number(expiryMonth),
          expiry_year: Number(expiryYear),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Failed to add card")
      }

      navigate("/cards")
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">

          <Link
            to="/cards"
            className="text-gray-500 hover:text-blue-600"
          >
            ← Back to My Cards
          </Link>

        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-10">

        <div className="bg-white rounded-2xl shadow-xl p-8">

          <div className="text-center mb-8">

            <div className="mx-auto w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl">
                💳
              </span>
            </div>

            <h1 className="text-3xl font-bold text-slate-800 mt-5">
              Add New Card
            </h1>

            <p className="text-gray-500 mt-2">
              Add your card securely
            </p>

          </div>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={16}
                value={cardNumber}
                onChange={(event) =>
                  setCardNumber(
                    event.target.value.replace(/\D/g, "")
                  )
                }
                placeholder="Enter 16-digit card number"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>

              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={cvv}
                onChange={(event) =>
                  setCvv(
                    event.target.value.replace(/\D/g, "")
                  )
                }
                placeholder="Enter CVV"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Type
              </label>

              <select
                value={cardType}
                onChange={(event) => setCardType(event.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="VISA">Visa</option>
                <option value="MASTERCARD">Mastercard</option>
                <option value="AMEX">American Express</option>
                <option value="RUPAY">RuPay</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Month
                </label>

                <input
                  type="number"
                  min="1"
                  max="12"
                  value={expiryMonth}
                  onChange={(event) =>
                    setExpiryMonth(event.target.value)
                  }
                  placeholder="MM"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Year
                </label>

                <input
                  type="number"
                  min="2026"
                  max="2100"
                  value={expiryYear}
                  onChange={(event) =>
                    setExpiryYear(event.target.value)
                  }
                  placeholder="YYYY"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              Your full card number and CVV are used only for validation.
              They are not stored in the database.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-lg font-semibold transition"
            >
              {loading ? "Adding Card..." : "Add Card"}
            </button>

          </form>

        </div>

      </main>
    </div>
  )
}

export default AddCard