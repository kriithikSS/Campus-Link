import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';
import { doc, getDoc, updateDoc, increment, setDoc } from "firebase/firestore";
import { db } from '../../config/FirebaseConfig';
import { useUser } from "@clerk/clerk-expo";
import { Linking } from "react-native";
import SRMinfo from '../../components/SRMdetails/SRMinfo';
import SRMsubinfo from '../../components/SRMdetails/SRMsubinfo';
import About from '../../components/SRMdetails/About';
import Ownerinfo from '../../components/SRMdetails/Ownerinfo';
import Colors from '../../constants/Colors';
import { useTheme } from '../../context/ThemeContext';

export default function SRMdetails() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams();  
  const router = useRouter(); 
  const { user } = useUser(); 
  const [SRM, setSRM] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPostDetails(id);
      incrementViews(id);
    }
  }, [id]);

  useEffect(() => {
    if (user && SRM) {
      checkIfApplied();
    }
  }, [user, SRM]);

  // 🔥 Fetch post details including WhatsApp number and price
  const fetchPostDetails = async (postId) => {
    setIsLoading(true);
    try {
      const postRef = doc(db, "Works", postId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        setSRM({ id: postSnap.id, ...postSnap.data() });
      } else {
        alert("Post not found!");
        router.back();
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
      await updateDoc(postRef, { views: increment(1) });
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

  const ApplyToEvent = async () => {
    if (!user) {
        alert("Please log in to apply.");
        return;
    }

    const userEmail = user.primaryEmailAddress.emailAddress;
    const eventName = SRM.name;
    
    try {
        // Get the event document to check for formUrl (optional)
        const eventRef = doc(db, "Works", SRM.id);
        const eventDoc = await getDoc(eventRef);
        
        if (!eventDoc.exists()) {
            alert("Event not found in database.");
            return;
        }
        
        const eventData = eventDoc.data();
        const eventFormURL = eventData.formUrl || null; // formUrl is optional now
        
        // Check if user has already applied
        const applicationRef = doc(db, "Applications", `${userEmail}_${eventName}`);
        const applicationSnap = await getDoc(applicationRef);

        if (applicationSnap.exists()) {
            alert("You have already applied for this event.");
            
            // If there's a form URL and they've already applied, still offer to open the form
            if (eventFormURL) {
                try {
                    const supported = await Linking.canOpenURL(eventFormURL);
                    if (supported) {
                        await Linking.openURL(eventFormURL);
                    }
                } catch (error) {
                    console.error("Error opening URL:", error);
                }
            }
        } else {
            // Create application document
            await setDoc(applicationRef, {
                userEmail,
                eventName,
                formUrl: eventFormURL,
                status: "Pending",
                appliedAt: new Date().toISOString()
            });
            
            setIsApplied(true);
            
            if (eventFormURL) {
                alert("Successfully applied! Redirecting to Google Form...");
                try {
                    const supported = await Linking.canOpenURL(eventFormURL);
                    if (supported) {
                        await Linking.openURL(eventFormURL);
                    } else {
                        alert("Successfully applied!");
                    }
                } catch (error) {
                    console.error("Error opening URL:", error);
                    alert("Successfully applied! (Form couldn't be opened)");
                }
            } else {
                alert("Successfully applied!");
            }
        }
    } catch (error) {
        console.error("❌ Error applying to event:", error);
        alert("Failed to apply. Try again later.");
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
          onPress={ApplyToEvent}
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
