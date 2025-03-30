import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';
import { doc, getDoc, updateDoc, increment } from "firebase/firestore"; // 🔥 Firestore
import { db } from '../../config/FirebaseConfig';
import { useUser } from "@clerk/clerk-expo"; // 🔥 Clerk Auth
import { Linking } from "react-native";
import SRMinfo from '../../components/SRMdetails/SRMinfo';
import SRMsubinfo from '../../components/SRMdetails/SRMsubinfo';
import About from '../../components/SRMdetails/About';
import Ownerinfo from '../../components/SRMdetails/Ownerinfo';
import Colors from '../../constants/Colors';
import { useTheme } from '../../context/ThemeContext';

export default function SRMdetails() {
  const { colors, isDarkMode } = useTheme();
  const { id } = useLocalSearchParams();  // 🔥 Get post ID from URL
  const router = useRouter(); 
  const { user } = useUser(); // 🔥 Get logged-in user info
  const [SRM, setSRM] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPostDetails(id);
      incrementViews(id);
    }
    if (user) {
      checkIfApplied();
    }
  }, [id, user]);

  // 🔥 Fetch full post details from Firestore
  const fetchPostDetails = async (postId) => {
    setIsLoading(true);
    try {
      const postRef = doc(db, "Works", postId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        setSRM({ id: postSnap.id, ...postSnap.data() });
      } else {
        alert("Post not found!");
        router.back(); // Go back if post is missing
      }
    } catch (error) {
      console.error("❌ Error fetching post:", error);
      alert("Failed to load post.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 Function to increment views
  const incrementViews = async (postId) => {
    try {
      const postRef = doc(db, "Works", postId);
      await updateDoc(postRef, {
        views: increment(1)
      });
      console.log("✅ Views updated for post:", postId);
    } catch (error) {
      console.error("❌ Error updating views:", error);
    }
  };

  // 🔥 Function to check if user has already applied
  const checkIfApplied = async () => {
    if (!user || !SRM) return;
    const userEmail = user.primaryEmailAddress.emailAddress;
    const applicationRef = doc(db, "Applications", `${userEmail}_${SRM.name}`);
    const applicationSnap = await getDoc(applicationRef);
    if (applicationSnap.exists()) {
      setIsApplied(true);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
        <Text style={{ color: colors.text, marginTop: 10 }}>Loading details...</Text>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: colors.background, flex: 1 }}>
      <ScrollView>
        <SRMinfo SRM={SRM} />
        <SRMsubinfo SRM={SRM} />
        <About SRM={SRM} />
        <Ownerinfo SRM={SRM} />

        <View style={{ height: 70 }} />
      </ScrollView>

      {/* Apply Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[styles.applybtn, isApplied && { backgroundColor: 'gray' }]} 
          onPress={() => alert("Apply logic here")}
          disabled={isApplied}
        >
          <Text style={styles.applyText}>
            {isApplied ? "✅ Applied" : "Apply"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applybtn: {
    padding: 15,
    backgroundColor: Colors.PRIMARY,
  },
  applyText: {
    textAlign: 'center',
    fontFamily: 'outfit-med',
    fontSize: 20,
  },
  bottomContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },
});