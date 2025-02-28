import { View, Text, Image, Pressable } from "react-native";
import React, { useCallback, useState, useEffect } from "react";
import Colors from "../../constants/Colors";
import * as WebBrowser from "expo-web-browser";
import { useOAuth } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { Platform } from "react-native"; // Import Platform for OS check

// ✅ Warm Up Browser only on Native Platforms (Fixes Web Error)
export const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== "web") {
      WebBrowser.warmUpAsync();
      return () => {
        WebBrowser.coolDownAsync();
      };
    }
  }, []);
};

// ✅ Ensure `maybeCompleteAuthSession()` runs only once (Fix for Clerk)
if (Platform.OS !== "web") {
  WebBrowser.maybeCompleteAuthSession();
}

export default function LoginScreen() {
  useWarmUpBrowser();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const [loading, setLoading] = useState(false);

  const onPress = useCallback(async () => {
    if (loading) return;

    try {
      setLoading(true);
      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow({
        redirectUrl: Platform.OS === "web" 
          ? window.location.origin 
          : Linking.createURL("/(tabs)/home", { scheme: "myapp" }),
      });

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
      } else {
        console.log("OAuth Sign-In/Sign-Up flow incomplete.");
      }
    } catch (err) {
      console.error("OAuth Error:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, startOAuthFlow]);

  return (
    <View style={{ backgroundColor: Colors.WHITE, height: "100%", alignItems: "center" }}>
      <Image 
        source={require("./../../assets/images/CampusLink1.png")}
        style={{ width: "auto", height: 200, marginTop: 200 }}
      />
      <View style={{ padding: 20, alignItems: "center" }}>
        <Text style={{ fontFamily: "Roboto-bold", fontSize: 25, textAlign: "center" }}>
          SRM Connect: Where Ideas Take Flight.
        </Text>
        <Text style={{ fontFamily: "Roboto-reg", fontSize: 16, textAlign: "center", color: Colors.GRAY, marginTop: 10 }}>
          A one-stop platform to connect, collaborate, and engage in campus events, workshops, and clubs.
        </Text>

        <Pressable
          onPress={onPress}
          disabled={loading}
          style={{
            padding: 14,
            marginTop: 30,
            backgroundColor: loading ? Colors.GRAY : Colors.PRIMARY,
            width: "100%",
            borderRadius: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ fontFamily: "Roboto-med", fontSize: 18, color: Colors.WHITE }}>
            {loading ? "Signing In..." : "Get started"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
