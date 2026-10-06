import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const DJANGO_URL = "http://127.0.0.1:8000"
const FASTAPI_URL = "http://127.0.0.1:8001"

function Payment() {
  const navigate = useNavigate()

  const [cards, setCards] = useState([])
  const [cardId, setCardId] = useState("")
  const [amount, setAmount] = useState("")

  const [loadingCards, setLoadingCards] = useState(true)
  const [loadingPayment, setLoadingPayment] = useState(false)

  const [error, setError] = useState("")
  const [result, setResult] = useState(null)

  const [idempotencyKey, setIdempotencyKey] = useState("")

  useEffect(() => {
    const loadCards = async () => {
      const token = localStorage.getItem("access_token")

      if (!token) {
        navigate("/login")
        return
      }

      try {
        const response = await fetch(`${DJANGO_URL}/api/cards/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.detail || "Failed to load cards")
        }

        setCards(data)

        if (data.length > 0) {
          setCardId(String(data[0].id))
        }
      } catch (error) {
        setError(error.message)
      } finally {
        setLoadingCards(false)
      }
    }

    loadCards()
  }, [navigate])

  const handlePayment = async (event) => {
    event.preventDefault()

    setError("")
    setResult(null)

    const token = localStorage.getItem("access_token")

    if (!token) {
      navigate("/login")
      return
    }

    if (!cardId) {
      setError("Please select a card.")
      return
    }

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.")
      return
    }

    if (Number(amount) > 100000) {
      setError("Payment amount cannot exceed ₹100000.")
      return
    }

    setLoadingPayment(true)

    // Keep the same key throughout this payment attempt.
    const currentIdempotencyKey =
      idempotencyKey || crypto.randomUUID()

    setIdempotencyKey(currentIdempotencyKey)

    try {
      const response = await fetch(`${FASTAPI_URL}/api/payments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          card_id: Number(cardId),
          amount: Number(amount).toFixed(2),
          idempotency_key: currentIdempotencyKey,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Payment failed")
      }

      setResult(data)

      // Payment attempt is complete.
      // The next payment gets a new idempotency key.
      setIdempotencyKey("")
      setAmount("")
    } catch (error) {
      setError(error.message)
    } finally {
      setLoadingPayment(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">

          <Link
            to="/dashboard"
            className="text-gray-500 hover:text-blue-600"
          >
            ← Dashboard
          </Link>

        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-10">

        <div className="bg-white rounded-2xl shadow-xl p-8">

          <div className="text-center mb-8">

            <div className="mx-auto w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl">
                ₹
              </span>
            </div>

            <h1 className="text-3xl font-bold text-slate-800 mt-5">
              Make Payment
            </h1>

            <p className="text-gray-500 mt-2">
              Make a secure payment using your saved card
            </p>

          </div>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {result && (
            <div
              className={`mb-6 rounded-lg p-5 border ${
                result.status === "SUCCESS"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >

              <h3
                className={`text-lg font-bold ${
                  result.status === "SUCCESS"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                Payment {result.status}
              </h3>

              <div className="mt-3 space-y-1 text-sm">

                <p>
                  <span className="font-semibold">
                    Amount:
                  </span>{" "}
                  ₹{result.amount}
                </p>

                <p>
                  <span className="font-semibold">
                    Reference:
                  </span>{" "}
                  {result.reference}
                </p>

                <p>
                  <span className="font-semibold">
                    Transaction ID:
                  </span>{" "}
                  {result.id}
                </p>

              </div>

            </div>
          )}

          {loadingCards ? (
            <div className="text-center py-8">
              Loading cards...
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center">

              <div className="text-5xl mb-4">
                💳
              </div>

              <h3 className="text-xl font-bold text-slate-800">
                No saved cards
              </h3>

              <p className="text-gray-500 mt-2 mb-6">
                Add a card before making a payment.
              </p>

              <Link
                to="/cards/add"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Add Card
              </Link>

            </div>
          ) : (
            <form onSubmit={handlePayment} className="space-y-6">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Card
                </label>

                <select
                  value={cardId}
                  onChange={(event) => setCardId(event.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >

                  {cards.map((card) => (
                    <option
                      key={card.id}
                      value={card.id}
                    >
                      {card.card_type} - {card.masked_card}
                    </option>
                  ))}

                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-3 text-gray-500">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="1"
                    max="100000"
                    step="0.01"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="Enter amount"
                    required
                    className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Maximum payment amount: ₹100000
                </p>
              </div>

              <button
                type="submit"
                disabled={loadingPayment}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-lg font-semibold transition"
              >
                {loadingPayment
                  ? "Processing Payment..."
                  : "Pay Now"}
              </button>

            </form>
          )}

        </div>

      </main>
    </div>
  )
}

export default Payment