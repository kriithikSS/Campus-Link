import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { doc, updateDoc, increment } from "firebase/firestore"; // 🔥 Import Firestore
import { db } from '../../config/FirebaseConfig';
import SRMinfo from '../../components/SRMdetails/SRMinfo';
import SRMsubinfo from '../../components/SRMdetails/SRMsubinfo';
import About from '../../components/SRMdetails/About';
import Ownerinfo from '../../components/SRMdetails/Ownerinfo';
import Colors from '../../constants/Colors';

export default function SRMdetails() {
  const SRM = useLocalSearchParams();  // 🔥 Get SRM details
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle: ''
    });

    if (SRM.id) {
      incrementViews(SRM.id);  // 🔥 Increment views when the post is opened
    }
  }, []);

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

  return (
    <View>
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

      {/* Contact/Join us button */}
      <View style={styles?.bottomContainer}>
        <TouchableOpacity style={styles.applybtn}>
          <Text style={{
            textAlign: 'center',
            fontFamily: 'outfit-med',
            fontSize: 20
          }}>Apply</Text>
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
