import React, { createContext, useState, useContext, useEffect } from "react";
import { useUser } from "@clerk/clerk-expo";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/FirebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create context
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { isLoaded: userIsLoaded, isSignedIn, user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        setIsLoading(true);

        // Check AsyncStorage first
        const storedRole = await AsyncStorage.getItem("userRole");
        if (storedRole) {
          setIsAdmin(storedRole === "admin");
          setIsManager(storedRole === "manager");
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }

        // If no stored role, fetch from Firestore
        if (!userIsLoaded || !isSignedIn || !user?.id) {
          setIsAdmin(false);
          setIsManager(false);
          setIsInitialized(true);
          return;
        }

        const userId = user.id;
        const userDoc = await getDoc(doc(db, "users", userId));

        if (userDoc.exists()) {
          const role = userDoc.data().role;
          setIsAdmin(role === "admin");
          setIsManager(role === "manager");

          // Store role in AsyncStorage for persistence
          await AsyncStorage.setItem("userRole", role);
        } else {
          setIsAdmin(false);
          setIsManager(false);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("❌ Error checking user role:", error);
        setIsAdmin(false);
        setIsManager(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserRole();
  }, [userIsLoaded, isSignedIn, user]);

  const value = {
    isAdmin,
    isManager,
    isInitialized,
    isLoading,
    userIsLoaded,
    isSignedIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
