import { createContext, useEffect, useState, useContext } from "react";
import authService from "../services/authServices";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [User, SetUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authService.getMe();
        SetUser(userData);
      } catch (error) {
        SetUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const refreshUser = async () => {
    try {
      const userData = await authService.getMe();
      SetUser(userData);
    } catch {}
  };

  const login = async (email, password) => {
    try {
      console.log("AuthContext: Starting login with email:", email);
      const response = await authService.login(email, password);
      console.log("AuthContext: Login response received:", response);
      const { user } = response;
      console.log("AuthContext: Setting user:", user);
      SetUser(user);
      console.log("AuthContext: User set successfully");
    } catch (error) {
      console.error("AuthContext: Login failed:", error);
      throw error;
    }
  };
  const register = async (formData) => {
    try {
      const response = await authService.register(formData);
      // response is the user object from backend
      SetUser(response);
      return response;
    } catch (error) {
      console.error("AuthContext: Registration failed:", error);
      throw error;
    }
  };
  const logout = async () => {
    await authService.logout();
    SetUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user: User, loading, login, logout, register, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
