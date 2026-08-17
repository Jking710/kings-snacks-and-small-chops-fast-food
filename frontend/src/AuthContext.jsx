import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const AuthContext = createContext(null);

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

// ─────────────────────────────────────────────────────────────
// API HELPER
// ─────────────────────────────────────────────────────────────

async function apiFetch(endpoint, options = {}) {
  try {
    const token =
      localStorage.getItem("kc_token");

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    // Keep Bearer authentication available.
    // Your backend also sends an HttpOnly cookie.
    if (
      token &&
      !headers.Authorization
    ) {
      headers.Authorization =
        `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE}${endpoint}`,
      {
        ...options,
        headers,
        credentials: "include",
      }
    );

    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Something went wrong."
      );
    }

    return data;
  } catch (error) {
    if (
      error instanceof TypeError
    ) {
      throw new Error(
        "Network error: unable to reach the API. Ensure the backend is running and CORS allows this origin."
      );
    }

    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// AUTH PROVIDER
// ─────────────────────────────────────────────────────────────

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  // ─────────────────────────────────────────────────────────────
  // CHECK AUTHENTICATION
  // ─────────────────────────────────────────────────────────────

  const checkAuth =
    useCallback(async () => {
      try {
        setLoading(true);

        const data =
          await apiFetch(
            "/api/auth/me"
          );

        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
          localStorage.removeItem(
            "kc_token"
          );
        }
      } catch (error) {
        console.error(
          "Authentication check failed:",
          error
        );

        setUser(null);

        localStorage.removeItem(
          "kc_token"
        );
      } finally {
        setLoading(false);
      }
    }, []);

  // ─────────────────────────────────────────────────────────────
  // INITIAL AUTH CHECK
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ─────────────────────────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────────────────────────

  const register = async (
    formData
  ) => {
    try {
      setError(null);

      const data =
        await apiFetch(
          "/api/auth/register",
          {
            method: "POST",
            body: JSON.stringify(
              formData
            ),
          }
        );

      if (data?.token) {
        localStorage.setItem(
          "kc_token",
          data.token
        );
      }

      if (data?.user) {
        setUser(data.user);
      }

      return data;
    } catch (error) {
      console.error(
        "Registration failed:",
        error
      );

      setError(
        error.message ||
          "Registration failed. Please try again."
      );

      throw error;
    }
  };

  // ─────────────────────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────────────────────

  const login = async (
    email,
    password
  ) => {
    try {
      setError(null);

      const data =
        await apiFetch(
          "/api/auth/login",
          {
            method: "POST",
            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

      if (data?.token) {
        localStorage.setItem(
          "kc_token",
          data.token
        );
      }

      if (data?.user) {
        setUser(data.user);
      }

      return data;
    } catch (error) {
      console.error(
        "Login failed:",
        error
      );

      setError(
        error.message ||
          "Login failed. Please try again."
      );

      throw error;
    }
  };

  // ─────────────────────────────────────────────────────────────
  // GOOGLE LOGIN / REGISTER
  // ─────────────────────────────────────────────────────────────

  const googleLogin = async (
    credential,
    isRegistration = false
  ) => {
    try {
      setError(null);

      if (!credential) {
        throw new Error(
          "Google credential is missing."
        );
      }

      const data =
        await apiFetch(
          "/api/auth/google",
          {
            method: "POST",
            body: JSON.stringify({
              credential,
              isRegistration,
            }),
          }
        );

      if (data?.token) {
        localStorage.setItem(
          "kc_token",
          data.token
        );
      }

      if (data?.user) {
        setUser(data.user);
      }

      return data;
    } catch (error) {
      console.error(
        "Google authentication failed:",
        error
      );

      setError(
        error.message ||
          "Google authentication failed. Please try again."
      );

      throw error;
    }
  };

  // ─────────────────────────────────────────────────────────────
  // UPDATE PROFILE
  // ─────────────────────────────────────────────────────────────

  const updateProfile = async (
    field,
    value,
    countryCode = ""
  ) => {
    try {
      setError(null);

      const data =
        await apiFetch(
          "/api/auth/profile",
          {
            method: "PUT",

            body: JSON.stringify({
              field,
              value,
              countryCode,
            }),
          }
        );

      if (data?.user) {
        setUser(data.user);
      }

      return data;
    } catch (error) {
      console.error(
        "Update profile request failed:",
        error
      );

      setError(
        error.message ||
          "Could not update your profile."
      );

      throw error;
    }
  };

  // ─────────────────────────────────────────────────────────────
  // UPDATE PHONE
  // ─────────────────────────────────────────────────────────────

  const updatePhone = async (
    phone,
    countryCode
  ) => {
    try {
      setError(null);

      const data =
        await apiFetch(
          "/api/auth/phone",
          {
            method: "PUT",

            body: JSON.stringify({
              phone,
              countryCode,
            }),
          }
        );

      if (data?.user) {
        setUser(data.user);
      }

      return data;
    } catch (error) {
      console.error(
        "Update phone request failed:",
        error
      );

      setError(
        error.message ||
          "Could not update your phone number."
      );

      throw error;
    }
  };

  // ─────────────────────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────────────────────

  const logout = async () => {
    try {
      setError(null);

      await apiFetch(
        "/api/auth/logout",
        {
          method: "POST",
        }
      );
    } catch (error) {
      console.error(
        "Logout request failed:",
        error
      );
    } finally {
      localStorage.removeItem(
        "kc_token"
      );

      setUser(null);
      setError(null);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // UPDATE USER
  // ─────────────────────────────────────────────────────────────

  const updateUser =
    useCallback(
      (updatedUser) => {
        setUser(updatedUser);
      },
      []
    );

  // ─────────────────────────────────────────────────────────────
  // AUTHENTICATION STATUS
  // ─────────────────────────────────────────────────────────────

  const isAuthenticated =
    Boolean(user);

  // ─────────────────────────────────────────────────────────────
  // PROVIDER
  // ─────────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        updateUser,

        loading,
        error,
        isAuthenticated,

        login,
        register,
        googleLogin,

        updateProfile,
        updatePhone,

        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
// USE AUTH
// ─────────────────────────────────────────────────────────────

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside <AuthProvider>"
    );
  }

  return context;
}

export default AuthContext;