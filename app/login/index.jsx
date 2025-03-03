import { View, Text, Image, Pressable } from "react-native";
import React, { useCallback, useState } from "react";
import Colors from "../../constants/Colors";
import * as WebBrowser from "expo-web-browser";
import { useOAuth } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router"; // ✅ Import router

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
  const router = useRouter(); // ✅ Router for navigation
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const [loading, setLoading] = useState(false);

  const onPress = useCallback(async () => {
    if (loading) return;

    try {
      setLoading(true);
      console.log("🔄 Starting OAuth login...");

      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL("/redirect-handler"), // ✅ Ensure this matches your route
      });

      if (createdSessionId) {
        console.log("✅ OAuth successful. Session ID:", createdSessionId);

        // Set the active session
        await setActive({ session: createdSessionId });

        console.log("🔄 Manually navigating to /redirect-handler...");
        setTimeout(() => router.replace("/redirect-handler"), 1000); // ✅ Small delay for smooth transition
      } else {
        console.log("⚠️ Session creation failed.");
      }
    } catch (err) {
      console.error("❌ OAuth error:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, startOAuthFlow, router]);

  return (
    <View style={{ backgroundColor: Colors.WHITE, height: "100%" }}>
      {/* Logo Image */}
      <Image
        source={require("./../../assets/images/CampusLink1.png")}
        style={{ width: "auto", height: 200, marginTop: 200 }}
      />

      {/* Content Section */}
      <View style={{ padding: 20, display: "flex", alignItems: "center" }}>
        <Text style={{ fontFamily: "Roboto-bold", fontSize: 25, textAlign: "center" }}>
          SRM Connect: Where Ideas Take Flight.
        </Text>
        <Text style={{ fontFamily: "Roboto-reg", fontSize: 16, textAlign: "center", color: Colors.GRAY }}>
          A one-stop platform to connect, collaborate, and engage in campus events, workshops, and clubs.
        </Text>

        {/* Sign In Button */}
        <Pressable
          onPress={onPress}
          disabled={loading}
          style={{
            padding: 14,
            marginTop: 30,
            backgroundColor: loading ? Colors.GRAY : Colors.PRIMARY,
            width: "100%",
            borderRadius: 14,
          }}
        >
          <Text style={{ fontFamily: "Roboto-med", fontSize: 18, textAlign: "center", color: Colors.WHITE }}>
            {loading ? "Signing In..." : "Get started"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
