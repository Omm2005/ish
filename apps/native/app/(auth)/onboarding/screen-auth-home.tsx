import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { withUniwind } from "uniwind";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const StyledIonicons = withUniwind(Ionicons);
const AnimatedView = withUniwind(Animated.View);

type OnboardingAuthHomePageProps = {
  onStart: () => void;
};

export default function OnboardingAuthHomePage({ onStart }: OnboardingAuthHomePageProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: scale.value }] };
  });

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStart();
  };

  return (
    <View className="flex-1 justify-end">
      <View className="mb-10">
        <View className="flex-col">
          <Text className="text-foreground text-[100px] font-bold tracking-tight -mb-9" >every</Text>
          <Text className="text-primary text-[100px] font-bold tracking-tight -mb-7">penny</Text>
          <Text className="text-foreground text-[100px] font-bold tracking-tight">counts</Text>
        </View>

        <Text className="text-muted-foreground text-lg font-medium ml-1.5 -mt-3">towards better you</Text>
      </View>

      <Pressable
        onPress={handleStart}
        onPressIn={() => { scale.value = withSpring(0.96); }}
        onPressOut={() => { scale.value = withSpring(1); }}
      >
        <AnimatedView
          style={animatedStyle}
          className="bg-foreground py-5 rounded-2xl flex-row items-center justify-center"
        >
          <Text className="text-background/75 font-semibold text-2xl ml-3">Get started</Text>
        </AnimatedView>
      </Pressable>
    </View>
  );
}
