import { Link, useNavigate } from "react-router-dom"

function Dashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-slate-100">

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <h1 className="text-2xl font-bold text-blue-600">
            CreditPay
          </h1>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-medium"
          >
            Logout
          </button>

        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800">
            Dashboard
          </h2>

          <p className="text-gray-500 mt-2">
            Manage your cards and payments from one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <Link
            to="/cards"
            className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition"
          >
            <div className="text-3xl mb-4">💳</div>

            <h3 className="text-xl font-bold text-slate-800">
              My Cards
            </h3>

            <p className="text-gray-500 mt-2">
              Add and manage your saved cards.
            </p>
          </Link>

          <Link
            to="/payment"
            className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition"
          >
            <div className="text-3xl mb-4">💰</div>

            <h3 className="text-xl font-bold text-slate-800">
              Make Payment
            </h3>

            <p className="text-gray-500 mt-2">
              Make a secure payment using your card.
            </p>
          </Link>

          <Link
            to="/transactions"
            className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition"
          >
            <div className="text-3xl mb-4">📜</div>

            <h3 className="text-xl font-bold text-slate-800">
              Transactions
            </h3>

            <p className="text-gray-500 mt-2">
              View your payment history.
            </p>
          </Link>

        </div>

      </main>
    </div>
  )
}

export default Dashboard