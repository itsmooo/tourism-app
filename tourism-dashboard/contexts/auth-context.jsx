"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { apiService } from "@/lib/api-service";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const existingToken = localStorage.getItem("authToken");
    if (existingToken) {
      setToken(existingToken);
      verifyToken(existingToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await fetch("http://localhost:9000/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${tokenToVerify}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Token is valid, but we need to get user info
        // For now, we'll assume the token is valid
        setUser({ role: "admin" }); // You can enhance this by storing more user info
      } else {
        // Token is invalid, remove it
        localStorage.removeItem("authToken");
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("authToken");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // Ensure we send both username and email for the backend to handle
      const loginData = {
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
      };
      
      console.log('🔐 Sending login data:', loginData);
      
      const response = await fetch("http://localhost:9000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Login failed:', response.status, errorData);
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      
      // Store token
      localStorage.setItem("authToken", data.token);
      setToken(data.token);
      setUser({
        _id: data._id,
        username: data.username,
        email: data.email,
        role: data.role,
      });

      return { success: true, user: data };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAdmin,
    isAuthenticated,
    verifyToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
