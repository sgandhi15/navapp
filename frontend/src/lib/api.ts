const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("access_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

export const api = {
  // Auth
  register: (email: string, password: string) =>
    fetchWithAuth("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    fetchWithAuth("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => fetchWithAuth("/api/auth/me"),

  // Addresses
  getAddresses: () => fetchWithAuth("/api/addresses"),

  saveAddress: (address: string, lat: number, lng: number) =>
    fetchWithAuth("/api/addresses", {
      method: "POST",
      body: JSON.stringify({ address, lat, lng }),
    }),

  deleteAddress: (id: number) =>
    fetchWithAuth(`/api/addresses/${id}`, {
      method: "DELETE",
    }),

  // Geocoding
  geocode: (query: string) =>
    fetchWithAuth(`/api/geocode?q=${encodeURIComponent(query)}`),

  // Routing
  getRoute: (
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number
  ) =>
    fetchWithAuth(
      `/api/route?startLat=${startLat}&startLng=${startLng}&endLat=${endLat}&endLng=${endLng}`
    ),
};
