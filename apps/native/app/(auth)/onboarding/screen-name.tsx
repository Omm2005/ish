import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { withUniwind } from "uniwind";
import { useThemeColor } from "heroui-native";

const StyledTextInput = withUniwind(TextInput);
const AnimatedView = withUniwind(Animated.View);
const StyledIonicons = withUniwind(Ionicons);

type OnboardingNamePageProps = {
  name: string;
  onChangeName: (value: string) => void;
  error: string | null;
  shakeSignal: number;
  onNext: () => void;
  onBack: () => void;
};

export default function OnboardingNamePage({
  name,
  onChangeName,
  error,
  shakeSignal,
  onNext,
  onBack,
}: OnboardingNamePageProps) {
  const [localError, setLocalError] = useState<string | null>(null);
  const scale = useSharedValue(1);
  const backScale = useSharedValue(1);
  const inputShakeX = useSharedValue(0);
  //@ts-ignore
  const foregroundColor = useThemeColor("muted-foreground");

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  const backAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: backScale.value }],
    };
  });
  const inputAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: inputShakeX.value }],
    };
  });

  useEffect(() => {
    if (!shakeSignal) return;
    inputShakeX.value = withSequence(
      withTiming(-6, { duration: 40 }),
      withTiming(6, { duration: 80 }),
      withTiming(-4, { duration: 80 }),
      withTiming(4, { duration: 80 }),
      withTiming(0, { duration: 40 })
    );
  }, [shakeSignal, inputShakeX]);

  const handleNext = () => {
    if (!name.trim()) {
      if (!localError) setLocalError("Please enter your name.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      inputShakeX.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 100 }),
        withTiming(-6, { duration: 100 }),
        withTiming(6, { duration: 100 }),
        withTiming(0, { duration: 50 })
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (localError) setLocalError(null);
    onNext();
  };

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

        <Text className="text-foreground text-3xl font-bold">What should we call you?</Text>

        <AnimatedView style={inputAnimatedStyle}>
          <StyledTextInput
            value={name}
            onChangeText={(value) => {
              if (localError) setLocalError(null);
              onChangeName(value);
            }}
            placeholder="Your Name"
            placeholderTextColor="#7D8292"
            className={`mt-7 bg-card rounded-2xl h-14 px-5 py-0 text-foreground text-base ${
              error || localError ? "border border-destructive" : ""
            }`}
            style={{ textAlignVertical: "center", paddingVertical: 0, lineHeight: 20 }}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
            accessibilityLabel="Name input"
          />
        </AnimatedView>

        {(error || localError) && (
          <Text className="text-destructive text-xs mt-2">{error || localError}</Text>
        )}
      </View>

      <Pressable
        onPress={handleNext}
        onPressIn={() => {
          scale.value = withSpring(0.96);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
      >
        <AnimatedView
          style={animatedStyle}
          className={`py-5 rounded-2xl flex-row items-center justify-center ${name ? "bg-foreground" : "bg-card"}`}
        >
          <Text className={`font-semibold text-2xl ml-3 ${name ? "text-background/75" : "opacity-50 text-foreground"}`}>
            Next
          </Text>
        </AnimatedView>
      </Pressable>
    </View>
  );
}
