import { View, Text, Image, Pressable } from "react-native";
import React, { useCallback, useState } from "react";
import Colors from "../../constants/Colors";
import * as WebBrowser from 'expo-web-browser';
import { useOAuth } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';

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
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const [loading, setLoading] = useState(false);

  const onPress = useCallback(async () => {
    if (loading) return;

    try {
      setLoading(true);
      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/(tabs)/home', { scheme: 'myapp' }),
      });

      if (createdSessionId) {
        // Session creation was successful, set the session as active
        await setActive({ session: createdSessionId });
      } else {
        // Handle signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error('OAuth error', err);
    } finally {
      setLoading(false);
    }
  }, [loading, startOAuthFlow]);

  return (
    <View
      style={{
        backgroundColor: Colors.WHITE,
        height: "100%",
      }}
    >
      <Image 
        source={require("./../../assets/images/CampusLink1.png")}
        style={{
          width: "auto",
          height: 200,
          marginTop: 200,
        }}
      />
      <View
        style={{
          padding: 20,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontFamily: "Roboto-bold",
            fontSize: 25,
            textAlign: "center",
          }}
        >
          SRM Connect: Where Ideas Take Flight.
        </Text>
        <Text
          style={{
            fontFamily: "Roboto-reg",
            fontSize: 16,
            textAlign: "center",
            color: Colors.GRAY,
          }}
        >
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
          <Text
            style={{
              fontFamily: "Roboto-med",
              fontSize: 18,
              textAlign: "center",
              color: Colors.WHITE,
            }}
          >
            {loading ? 'Signing In...' : 'Get started'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
