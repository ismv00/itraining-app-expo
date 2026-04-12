import axios from "axios";

export const api = axios.create({
  baseURL: "http://192.168.1.7:3333",
});

export function setAuthToken(token: string) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export function clearAuthToken() {
  delete api.defaults.headers.common["Authorization"];
}
