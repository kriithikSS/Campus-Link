import { View, Text, Image, Pressable } from "react-native";
import React, { useCallback, useState, useEffect } from "react";
import Colors from "../../constants/Colors";
import * as WebBrowser from "expo-web-browser";
import { useOAuth, useUser } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";

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

  return (
    <View style={{ backgroundColor: Colors.WHITE, height: "100%" }}>
      <Image
        source={require("./../../assets/images/CampusLink1.png")}
        style={{ width: "auto", height: 200, marginTop: 200 }}
      />
      <View style={{ padding: 20, display: "flex", alignItems: "center" }}>
        <Text style={{ fontFamily: "Roboto-bold", fontSize: 25, textAlign: "center" }}>
          SRM Connect: Where Ideas Take Flight.
        </Text>
        <Text style={{ fontFamily: "Roboto-reg", fontSize: 16, textAlign: "center", color: Colors.GRAY }}>
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