import "@/polyfills";
import "@/global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { AppThemeProvider } from "@/contexts/app-theme-context";
import { SelectedDateProvider } from "@/contexts/selected-date-context";

export const unstable_settings = {
  initialRouteName: "(app)",
};

import { authClient } from "@/lib/auth-client";
import { View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";

export default function Layout() {
    const { data: session, isPending } = authClient.useSession();

    const router = useRouter();
    const segments = useSegments();
    
    // Track if we've handled the initial navigation
    const [isNavigationReady, setIsNavigationReady] = useState(false);

    useEffect(() => {
      SplashScreen.preventAutoHideAsync();
    }, []);

    useEffect(() => {
    if (isPending) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    if (!session) {
      if (!inAuthGroup) {
        router.replace('/(auth)');
      }
    } else {
        if (!inAppGroup) {
            router.replace('/(app)');
        }
    }
    
    setIsNavigationReady(true);
  }, [session, isPending, segments]);
  
  useEffect(() => {
    if (!isPending && isNavigationReady) {
      SplashScreen.hideAsync();
    }
  }, [isPending, isNavigationReady]);

  // Keep native splash screen visible while checking session
  if (isPending || !isNavigationReady) {
      return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <AppThemeProvider>
          <SelectedDateProvider>
            <HeroUINativeProvider>
          <Stack 
          screenOptions={{ headerShown: false,
            contentStyle: { backgroundColor: 'transparent' }
           }}
          >
            <Stack.Screen name="(auth)" />
            {/* <Stack.Screen name="(onboarding)" /> */}
            <Stack.Screen name="(app)" />
          </Stack>
            </HeroUINativeProvider>
          </SelectedDateProvider>
        </AppThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
