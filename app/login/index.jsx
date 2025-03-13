import { View, Text, Image, Pressable, Animated, Dimensions, StatusBar } from "react-native";
import React, { useCallback, useState, useEffect, useRef } from "react";
import Colors from "../../constants/Colors";
import * as WebBrowser from "expo-web-browser";
import { useOAuth, useUser } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";

export const useWarmUpBrowser = () => {
  React.useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  useWarmUpBrowser();
  const router = useRouter();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { user, isSignedIn } = useUser();
  const [loading, setLoading] = useState(false);
  const screenHeight = Dimensions.get("window").height;
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Animate elements in on load
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const checkAdminAndRedirect = async () => {
      if (isSignedIn && user?.id) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.id));
          const isAdmin = userDoc.exists() && userDoc.data().role === "admin";

          router.replace(isAdmin ? "/admin" : "/(tabs)/home");
        } catch (error) {
          console.error("❌ Error checking admin role:", error);
          router.replace("/(tabs)/home"); // Default to home if error
        }
      }
    };

    checkAdminAndRedirect();
  }, [isSignedIn, user]);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const onPress = useCallback(async () => {
    if (loading) return;

    try {
      setLoading(true);
      console.log("🔄 Starting OAuth login...");

      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL("/redirect-handler"),
      });

      if (createdSessionId) {
        console.log("✅ OAuth successful. Session ID:", createdSessionId);
        await setActive({ session: createdSessionId });
      } else {
        console.log("⚠️ Session creation failed.");
      }
    } catch (err) {
      console.error("❌ OAuth error:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, startOAuthFlow]);

  // Floating circles background elements
  const renderBackgroundCircles = () => {
    return (
      <>
        <Animated.View 
          style={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            top: screenHeight * 0.05,
            right: -50,
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.7]
            }),
          }}
        />
        <Animated.View 
          style={{
            position: 'absolute',
            width: 150,
            height: 150,
            borderRadius: 75,
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            bottom: screenHeight * 0.1,
            left: -30,
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.5]
            }),
          }}
        />
      </>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.WHITE} />
      {renderBackgroundCircles()}
      
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.8)', 'rgba(240, 249, 255, 0.9)']}
        style={{ flex: 1, paddingHorizontal: 20 }}
      >
        <Animated.View 
          style={{ 
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <Image
            source={require("./../../assets/images/CampusLink1.png")}
            style={{ 
              width: '100%', 
              height: 320, // Significantly increased height
              resizeMode: 'contain',
              marginBottom: 10,
            }}
          />
          
          <Animated.View 
            style={{ 
              width: '100%',
              alignItems: 'center',
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              marginTop: 8, // Reduced top margin
            }}
          >
            <Text 
              style={{ 
                fontFamily: "Roboto-bold", 
                fontSize: 26, // Slightly smaller to fit with bigger image
                color: '#1e40af',
                textAlign: "center",
                marginBottom: 10 // Reduced bottom margin
              }}
            >
              Welcome to CampusLink
            </Text>
            
            <Text 
              style={{ 
                fontFamily: "Roboto-reg", 
                fontSize: 15, // Slightly smaller to fit with bigger image
                textAlign: "center", 
                color: Colors.GRAY,
                marginBottom: 8, // Reduced bottom margin
                lineHeight: 22,
                paddingHorizontal: 10
              }}
            >
              Where Ideas Take Flight. Connect, collaborate, and engage in campus events, workshops, and clubs.
            </Text>
            
            <Animated.View 
              style={{
                width: '100%',
                marginTop: 24, // Reduced top margin
                transform: [{ scale: buttonScale }]
              }}
            >
              <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={loading}
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  backgroundColor: loading ? '#94a3b8' : '#FACC15', // Yellow color
                  width: "100%",
                  borderRadius: 16,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 10,
                  elevation: 5,
                }}
              >
                {loading ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ 
                      fontFamily: "Roboto-med", 
                      fontSize: 18, 
                      color: '#1F2937', // Darker text for better contrast on yellow
                      marginRight: 10
                    }}>
                      Signing In...
                    </Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FontAwesome name="google" size={20} color="#1F2937" style={{ marginRight: 12 }} />
                    <Text style={{ 
                      fontFamily: "Roboto-med", 
                      fontSize: 18, 
                      color: '#1F2937' // Darker text for better contrast on yellow
                    }}>
                      Continue with Google
                    </Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>
            
            <Animated.Text 
              style={{
                fontFamily: "Roboto-reg",
                fontSize: 12, // Smaller font size
                color: '#64748b',
                marginTop: 20, // Reduced top margin
                textAlign: 'center',
                opacity: fadeAnim
              }}
            >
              Please wait before clicking again{"\n"}
              By continuing, you're stepping into a world of student collaboration! 🚀
            </Animated.Text>
          </Animated.View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}