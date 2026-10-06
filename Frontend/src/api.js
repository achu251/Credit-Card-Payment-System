const API_BASE_URL = "http://127.0.0.1:8000"

export async function loginUser(username, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.detail || "Login failed")
  }

  return data
}

export async function registerUser(username, email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    const message =
      data.username?.[0] ||
      data.email?.[0] ||
      data.password?.[0] ||
      data.detail ||
      "Registration failed"

    throw new Error(message)
  }

  return data
}

export async function getCurrentUser() {
  const token = localStorage.getItem("access_token")

  const response = await fetch(`${API_BASE_URL}/api/auth/me/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.detail || "Failed to get user")
  }

  return data
}