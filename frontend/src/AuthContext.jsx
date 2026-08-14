import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Helper: make API calls ────────────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { "Content-Type": "application/json", ...options.headers },
      credentials: "include", // Send HttpOnly cookies automatically
      ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Something went wrong");
    return data;
  } catch (err) {
    // Provide a friendlier message for network / CORS failures
    if (err instanceof TypeError) {
      throw new Error(
        "Network error: unable to reach the API. Ensure the backend is running and CORS allows this origin.",
      );
    }
    throw err;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // True on first load
  const [error, setError] = useState(null);

  // ─── On app load: check if user is already logged in ────────────────────────
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("kc_token");
      if (!token) {
        setUser(null);
        return;
      }
      const data = await apiFetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data.user);
    } catch {
      // Token invalid/expired — clear everything
      localStorage.removeItem("kc_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ─── Register ────────────────────────────────────────────────────────────────
  const register = async (formData) => {
    setError(null);
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(formData),
    });
    localStorage.setItem("kc_token", data.token);
    setUser(data.user);
    return data;
  };

  // ─── Login ───────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setError(null);
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("kc_token", data.token);
    setUser(data.user);
    return data;
  };

  // ─── Google Auth ─────────────────────────────────────────────────────────────
  const googleLogin = async (credential, isRegistration = false) => {
    setError(null);

    const data = await apiFetch("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({
        credential,
        isRegistration,
      }),
    });

    localStorage.setItem("kc_token", data.token);
    setUser(data.user);

    return data;
  };

  // ─── Logout ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore logout API errors — still clear local state
    }
    localStorage.removeItem("kc_token");
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        login,
        register,
        googleLogin,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this everywhere instead of useContext(AuthContext) directly
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}

export default AuthContext;
