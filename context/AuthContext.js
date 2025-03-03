import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@clerk/clerk-expo";

// Create context
export const AuthContext = createContext(null);

// Admin emails from env
const ADMIN_EMAILS = process.env.EXPO_PUBLIC_ADMIN_EMAILS?.split(",") || [];

export const AuthProvider = ({ children }) => {
  const { isLoaded: userIsLoaded, isSignedIn, user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize admin status on app start or when user changes
  useEffect(() => {
    const initializeAuthState = async () => {
      try {
        setIsLoading(true);
        
        // First check if user is signed in through Clerk
        if (!userIsLoaded) {
          return; // Wait for Clerk to load
        }
        
        if (!isSignedIn) {
          setIsAdmin(false);
          setIsInitialized(true);
          return;
        }
        
        // Next read from AsyncStorage
        const storedAdminStatus = await AsyncStorage.getItem("isAdmin");
        console.log("🔵 AsyncStorage isAdmin value:", storedAdminStatus);
        
        // If we have stored admin state, use it initially
        if (storedAdminStatus === "true") {
          setIsAdmin(true);
        }
        
        // Now verify against user email to keep admin status updated
        if (user?.primaryEmailAddress) {
          const userEmail = user.primaryEmailAddress.emailAddress.toLowerCase().trim();
          const userIsAdmin = ADMIN_EMAILS.includes(userEmail);
          
          // Save to state and storage
          setIsAdmin(userIsAdmin);
          await AsyncStorage.setItem("isAdmin", userIsAdmin ? "true" : "false");
          
          console.log(`👤 User (${userEmail}) admin status: ${userIsAdmin}`);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error("❌ Error initializing auth state:", error);
        // Default to non-admin in case of errors
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuthState();
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