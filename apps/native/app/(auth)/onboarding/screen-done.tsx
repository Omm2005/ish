import React from "react";
import { View, Text, Pressable } from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { withUniwind } from "uniwind";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useThemeColor } from "heroui-native";
import { authClient } from "@/lib/auth-client";

const StyledAntDesign = withUniwind(AntDesign);
const AnimatedView = withUniwind(Animated.View);
const StyledIonicons = withUniwind(Ionicons);

type OnboardingDonePageProps = {
  onBack: () => void;
  onGoogleAuth: () => void;
};

export default function OnboardingDonePage({
  onBack,
  onGoogleAuth,
}: OnboardingDonePageProps) {
  const backScale = useSharedValue(1);
  const googleScale = useSharedValue(1);
  const foregroundColor = useThemeColor("foreground");
  const accentForegroundColor = useThemeColor("accent-foreground");

  const backAnimatedStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: backScale.value }] };
  });

  const googleAnimatedStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: googleScale.value }] };
  });

  return (
    <View className="flex-1 justify-between">
      <View>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onBack();
          }}
          onPressIn={() => {
            backScale.value = withSpring(0.94);
          }}
          onPressOut={() => {
            backScale.value = withSpring(1);
          }}
          className="self-start mb-6 flex-row items-center justify-center"
        >
          <AnimatedView
            style={backAnimatedStyle}
            className="items-center justify-center rounded-full bg-card p-1"
          >
            <StyledIonicons name="chevron-back" size={15} color={foregroundColor} />
          </AnimatedView>
            <Text className="text-muted-foreground font-semibold text-base ml-1">Back</Text>
        </Pressable>

        <Text className="text-foreground text-3xl font-bold">All done</Text>
        <Text className="text-muted-foreground text-base mt-2">
          Connect Google to sync your reminders and progress.
        </Text>
      </View>

      <Pressable
        onPress={async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              try{
              await authClient.signIn.social({
                provider: "google",
                callbackURL: "/(app)",
              });
              } catch (error) {
                console.log(error);
              }
        }}
        onPressIn={() => {
          googleScale.value = withSpring(0.96);
        }}
        onPressOut={() => {
          googleScale.value = withSpring(1);
        }}
      >
        <AnimatedView
          style={googleAnimatedStyle}
          className="bg-foreground py-5 rounded-[22px] flex-row items-center justify-center"
        >
          <StyledAntDesign name="google" size={20} color={accentForegroundColor} />
          <Text className="text-background font-bold text-lg ml-3">Google</Text>
        </AnimatedView>
      </Pressable>
    </View>
  );
}
