import axios from "axios";

export const api = axios.create({
  baseURL:
    "NEXT_PUBLIC_API_URL=https://api-itraining-production.up.railway.app",
});

export function setAuthToken(token: string) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export function clearAuthToken() {
  delete api.defaults.headers.common["Authorization"];
}
