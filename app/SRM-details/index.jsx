import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { doc, updateDoc, increment, setDoc, getDoc } from "firebase/firestore"; // 🔥 Import Firestore
import { db } from '../../config/FirebaseConfig';
import { useUser } from "@clerk/clerk-expo"; // 🔥 Import Clerk for authentication
import { Linking } from "react-native"; // 🔥 For opening Google Form links
import SRMinfo from '../../components/SRMdetails/SRMinfo';
import SRMsubinfo from '../../components/SRMdetails/SRMsubinfo';
import About from '../../components/SRMdetails/About';
import Ownerinfo from '../../components/SRMdetails/Ownerinfo';
import Colors from '../../constants/Colors';
import { useTheme } from '../../context/ThemeContext';


export default function SRMdetails() {
  const { colors, isDarkMode } = useTheme();
  const SRM = useLocalSearchParams();  // 🔥 Get SRM details
  const navigation = useNavigation();
  const { user } = useUser(); // 🔥 Get logged-in user info
  const [isApplied, setIsApplied] = useState(false); // 🔥 Check if user has applied

  useEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle: ''
    });

    if (SRM.id) {
      incrementViews(SRM.id);  // 🔥 Increment views when the post is opened
    }

    if (user) {
      checkIfApplied(); // 🔥 Check if the user has already applied
    }
  }, [user]);

  // 🔥 Function to increment views in Firestore
  const incrementViews = async (postId) => {
    try {
      const postRef = doc(db, "Works", postId);
      await updateDoc(postRef, {
        views: increment(1) // 🔥 Increase view count
      });
      console.log("✅ Views updated for post:", postId);
    } catch (error) {
      console.error("❌ Error updating views:", error);
    }
  };

  // 🔥 Function to check if user has already applied
  const checkIfApplied = async () => {
    if (!user) return;

    const userEmail = user.primaryEmailAddress.emailAddress;
    const eventName = SRM.name;
    const applicationRef = doc(db, "Applications", `${userEmail}_${eventName}`);
    const applicationSnap = await getDoc(applicationRef);

    if (applicationSnap.exists()) {
      setIsApplied(true);
    }
  };

  // 🔥 Function to apply for the event
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
            // Create application document without requiring formUrl
            await setDoc(applicationRef, {
                userEmail,
                eventName,
                formUrl: eventFormURL, // Can be null
                status: "Pending",
                appliedAt: new Date().toISOString() // Add timestamp for when they applied
            });
            
            setIsApplied(true);
            
            // If there's a form URL, open it, otherwise just confirm application
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

  return (
    <View style={{ backgroundColor: colors.background, flex: 1 }}>

      <ScrollView>
        {/* SRM Info */}
        <SRMinfo SRM={SRM}/>
        {/* SRM subinfo */}
        <SRMsubinfo SRM={SRM}/>
        {/* About */}
        <About SRM={SRM}/>
        {/* Owner Details */}
        <Ownerinfo SRM={SRM}/>

        <View style={{height:70}} />
      </ScrollView>

      {/* Apply Button */}
      <View style={styles?.bottomContainer}>
        <TouchableOpacity 
          style={[styles.applybtn, isApplied && { backgroundColor: 'gray' }]} 
          onPress={ApplyToEvent}
          disabled={isApplied} // Disable button if already applied
        >
          <Text style={{
            textAlign: 'center',
            fontFamily: 'outfit-med',
            fontSize: 20
          }}>
            {isApplied ? "✅ Applied" : "Apply"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  applybtn: {
    padding: 15,
    backgroundColor: Colors.PRIMARY
  },
  bottomContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 0 
  }
});