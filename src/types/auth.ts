export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}
