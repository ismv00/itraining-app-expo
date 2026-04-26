import axios from "axios";
import Constants from "expo-constants";

const apiUrl =
  Constants.expoConfig?.extra?.apiUrl || "https://api.itraining.com.br";

export const api = axios.create({
  baseURL: apiUrl,
});

export function setAuthToken(token: string) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export function clearAuthToken() {
  delete api.defaults.headers.common["Authorization"];
}
