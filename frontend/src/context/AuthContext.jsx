import { createContext, useEffect, useState, useContext } from "react";
import authService from "../services/authServices";
import { normalizeUser } from "../utils/profilePicture";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [User, SetUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUserData = async () => {
    const userData = await authService.getMe();
    const normalizedUser = normalizeUser(userData);
    SetUser(normalizedUser);
    return normalizedUser;
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await refreshUserData();
      } catch (error) {
        SetUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log("AuthContext: Starting login with email:", email);
      const response = await authService.login(email, password);
      console.log("AuthContext: Login response received:", response);
      const { user } = response;
      console.log("AuthContext: Setting user:", user);
      SetUser(normalizeUser(user));
      console.log("AuthContext: User set successfully");
    } catch (error) {
      console.error("AuthContext: Login failed:", error);
      throw error;
    }
  };
  const register = async (name, email, password) => {
    const { user } = await authService.register(name, email, password);
    SetUser(normalizeUser(user));
  };
  const logout = async () => {
    await authService.logout();
    SetUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user: User, loading, login, logout, register, refreshUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
