import { Ionicons } from "@expo/vector-icons";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useCSSVariable, withUniwind } from "uniwind";
import { authClient } from "@/lib/auth-client";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import * as Haptics from 'expo-haptics';
import { useState } from "react";

const StyledIonicons = withUniwind(Ionicons);
// Use Animated.View for the visual part of the button to support Reanimated styles
const AnimatedView = withUniwind(Animated.View);

export default function AuthScreen() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const scale = useSharedValue(1);
  const foregroundColor = useCSSVariable("--color-foreground");

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try{
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/(app)",
    });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <View className="flex-1 bg-background-primary justify-end p-8 pb-10 relative">
      
      <View className="mb-10">
        <View className="flex-col">
          <Text className="text-foreground text-8xl font-bold tracking-tight leading-[85px] -mb-2">every</Text>
          <Text className="text-primary text-8xl font-bold tracking-tight leading-[85px]">penny</Text>
          <Text className="text-foreground text-8xl font-bold tracking-tight leading-[85px]">counts</Text>
        </View>

        <Text className="text-muted-foreground text-xl font-medium ml-1.5 -mt-4">towards better you</Text>
      </View>

      <Pressable 
        onPress={handleGoogleLogin}
        onPressIn={() => { scale.value = withSpring(0.96); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        disabled={isLoggingIn}
      >
        <AnimatedView 
          style={animatedStyle}
          className="bg-card py-5 rounded-[22px] border border-border flex-row items-center justify-center"
        >
          {isLoggingIn ? <ActivityIndicator size="small" color={foregroundColor ? (foregroundColor as string) : "#F97316"} /> : <StyledIonicons name="logo-google" size={24} className="text-foreground" />}
          <Text className="text-foreground font-bold text-lg ml-4">
            {isLoggingIn ? "Logging in..." : "Login with google"}
          </Text>
        </AnimatedView>
      </Pressable>
    </View>
  );
}
