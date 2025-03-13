import React, { createContext, useState, useContext, useEffect } from "react";
import { useUser } from "@clerk/clerk-expo";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/FirebaseConfig";

// Create context
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { isLoaded: userIsLoaded, isSignedIn, user } = useUser(); // Get Clerk user
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsLoading(true);

        if (!userIsLoaded || !isSignedIn || !user?.id) {
          setIsAdmin(false);
          setIsInitialized(true);
          return;
        }

        // Get the user's Clerk ID
        const userId = user.id;

        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, "users", userId));

        if (userDoc.exists()) {
          setIsAdmin(userDoc.data().role === "admin");
        } else {
          setIsAdmin(false);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("❌ Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [userIsLoaded, isSignedIn, user]);

  // Value object to be provided to consumers
  const value = {
    isAdmin,
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
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
