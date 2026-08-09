import { createContext, useContext, useEffect, useState } from "react";

import axios from "axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

// ==========================================
// AUTH PROVIDER
// ==========================================

export const AuthProvider = ({ children }) => {
  // ==========================================
  // USER
  // ==========================================

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("expensepilot_user");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  // ==========================================
  // TOKEN
  // ==========================================

  const [token, setToken] = useState(() => {
    return localStorage.getItem("expensepilot_token");
  });

  // ==========================================
  // LOADING
  // ==========================================

  const [loading, setLoading] = useState(true);

  // ==========================================
  // SAVE AUTH DATA
  // ==========================================

  useEffect(() => {
    if (token) {
      localStorage.setItem("expensepilot_token", token);
    } else {
      localStorage.removeItem("expensepilot_token");
    }

    if (user) {
      localStorage.setItem("expensepilot_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("expensepilot_user");
    }

    setLoading(false);
  }, [token, user]);

  // ==========================================
  // REGISTER
  // ==========================================

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
      });

      const data = response.data;

      setToken(data.token);
      setUser(data.user);

      toast.success("Account created successfully");

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to create account";

      toast.error(message);

      return {
        success: false,
        message,
      };
    }
  };

  // ==========================================
  // LOGIN
  // ==========================================

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const data = response.data;

      setToken(data.token);
      setUser(data.user);

      toast.success("Login successful");

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Invalid email or password";

      toast.error(message);

      return {
        success: false,
        message,
      };
    }
  };

  // ==========================================
  // GET CURRENT USER
  // ==========================================

  const getCurrentUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data.user);
    } catch (error) {
      console.error("Get current user error:", error);

      if (error.response?.status === 401) {
        setUser(null);
        setToken(null);

        localStorage.removeItem("expensepilot_user");

        localStorage.removeItem("expensepilot_token");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data.user);

      toast.success("Profile updated successfully");

      return {
        success: true,
        user: response.data.user,
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update profile";

      toast.error(message);

      return {
        success: false,
        message,
      };
    }
  };

  // ==========================================
  // UPLOAD PROFILE PICTURE
  // ==========================================

  const uploadProfilePicture = async (file) => {
    try {
      if (!file) {
        toast.error("Please select an image");

        return {
          success: false,
        };
      }

      // ==========================================
      // IMAGE TYPE
      // ==========================================

      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");

        return {
          success: false,
        };
      }

      // ==========================================
      // IMAGE SIZE
      // ==========================================

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");

        return {
          success: false,
        };
      }

      // ==========================================
      // FORM DATA
      // ==========================================

      const formData = new FormData();

      formData.append("profilePicture", file);

      // ==========================================
      // UPLOAD
      // ==========================================

      const response = await axios.post(
        `${API_URL}/auth/profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // ==========================================
      // UPDATE USER
      // ==========================================

      setUser(response.data.user);

      toast.success("Profile picture updated successfully");

      return {
        success: true,
        user: response.data.user,
      };
    } catch (error) {
      console.error("Profile picture upload error:", error);

      const message =
        error.response?.data?.message || "Failed to upload profile picture";

      toast.error(message);

      return {
        success: false,
        message,
      };
    }
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.put(
        `${API_URL}/auth/change-password`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(response.data.message);

      return {
        success: true,
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to change password";

      toast.error(message);

      return {
        success: false,
        message,
      };
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("expensepilot_user");

    localStorage.removeItem("expensepilot_token");

    toast.success("Logged out successfully");
  };

  // ==========================================
  // LOAD USER
  // ==========================================

  useEffect(() => {
    if (token) {
      getCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  // ==========================================
  // PROVIDER
  // ==========================================

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,

        register,
        login,
        logout,

        getCurrentUser,

        updateProfile,
        uploadProfilePicture,

        changePassword,

        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ==========================================
// HOOK
// ==========================================

export const useAuth = () => useContext(AuthContext);
