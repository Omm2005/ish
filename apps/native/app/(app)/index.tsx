import { useRouter } from "expo-router";
import { useMemo, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlassView, GlassContainer } from "expo-glass-effect";
import * as Haptics from "expo-haptics";
import { useCSSVariable } from "uniwind";
import { useSelectedDate } from "@/contexts/selected-date-context";
import { useFocusEffect } from "@react-navigation/native";

export default function AppScreen() {
  const router = useRouter();
  const leftScale = useRef(new Animated.Value(1)).current;
  const rightScale = useRef(new Animated.Value(1)).current;
  const MutedForeground = useCSSVariable("--color-muted-foreground");
  const CardColor = useCSSVariable("--color-card");
  const BorderColor = useCSSVariable("--color-border");
  const { selectedDate } = useSelectedDate();
  const isOpeningCalendar = useRef(false);

  const headerDate = useMemo(() => {
    const date = Number.isNaN(selectedDate.getTime()) ? new Date() : selectedDate;
    return {
      monthDay: date.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
      }),
      weekday: date.toLocaleDateString(undefined, {
        weekday: "long",
      }),
    };
  }, [selectedDate]);

  const handlePressIn = (scale: Animated.Value) => {
    Animated.spring(scale, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = (scale: Animated.Value) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 22,
      bounciness: 6,
    }).start();
  };

  useFocusEffect(() => {
    isOpeningCalendar.current = false;
  });

  return (
    <View className="relative flex-1 bg-background-primary p-6 pt-8">
      <View className="mt-4 w-full flex-row items-center justify-between">
        <Pressable
          onPress={() => {
            if (isOpeningCalendar.current) return;
            isOpeningCalendar.current = true;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push({
              pathname: "/(app)/calendar",
            });
          }}
        >
          <View className="justify-center">
            <Text className="text-xl font-semibold text-foreground">
              {headerDate.weekday}
            </Text>
            <Text className="text-base font-semibold text-muted-foreground">
              {headerDate.monthDay}
            </Text>
          </View>
        </Pressable>

        <View />
      </View>
      <View className="absolute bottom-8 left-0 right-0 px-6">
        <View className="flex-row items-center justify-between">
          <GlassContainer>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/(app)/profile");
              }}
              onPressIn={() => handlePressIn(leftScale)}
              onPressOut={() => handlePressOut(leftScale)}
            >
              <Animated.View style={{ transform: [{ scale: leftScale }] }}>
                <GlassView
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    overflow: "hidden",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="person" size={22} color={MutedForeground as string} />
                </GlassView>
              </Animated.View>
            </Pressable>
          </GlassContainer>

          <GlassContainer>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/(app)/dash");
              }}
              onPressIn={() => handlePressIn(rightScale)}
              onPressOut={() => handlePressOut(rightScale)}
            >
              <Animated.View style={{ transform: [{ scale: rightScale }] }}>
                <GlassView
                  style={{
                    width: 100,
                    height: 56,
                    borderRadius: 28,
                    overflow: "hidden",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="add" size={30} color={MutedForeground as string} />
                </GlassView>
              </Animated.View>
            </Pressable>
          </GlassContainer>
        </View>
      </View>
    </View>
  );
}
