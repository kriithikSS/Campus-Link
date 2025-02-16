import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';

const tokenCache = {
  async getToken(key) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log('No values stored under key: ' + key);
      }
      return item;
    } catch (error) {
      console.error('SecureStore get item error: ', error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error('SecureStore save item error: ', err);
    }
  },
};

function AuthWrapper({ children }) {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Handle redirection or sign-in logic here if needed
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return children;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'outfit-reg':require('./../assets/fonts/Outfit-Regular.ttf'),
    'outfit-med':require('./../assets/fonts/Outfit-Medium.ttf'),
    'outfit-bold':require('./../assets/fonts/Outfit-Bold.ttf'),
    'Roboto-reg': require('./../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-med': require('./../assets/fonts/Roboto-Medium.ttf'),
    'Roboto-bold': require('./../assets/fonts/Roboto-Bold.ttf'),
  });

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!fontsLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <AuthWrapper>
          <Stack>
            <Stack.Screen name="index" />
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="login/index"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
        </AuthWrapper>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
