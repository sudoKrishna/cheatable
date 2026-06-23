import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { getToken } from "@/api/tokenStorage";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = await getToken();
      const inAuthGroup = segments[0] === "(auth)";

      if (!token && !inAuthGroup) {
        router.replace("/(auth)/login");
      }

      setIsCheckingAuth(false);
    }

    checkAuth();
  }, [segments]);

  if (isCheckingAuth) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack initialRouteName="index">
          <Stack.Screen name="index" options={{ title: "Projects" }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="chat/[projectId]" />
          <Stack.Screen
            name="preview/[projectId]"
            options={{ title: "Preview" }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}