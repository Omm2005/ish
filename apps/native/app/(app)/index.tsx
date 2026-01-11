import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlassView, GlassContainer } from "expo-glass-effect";
import * as Haptics from "expo-haptics";
import { useCSSVariable } from "uniwind";

export default function AppScreen() {
  const router = useRouter();
  const centerScale = useRef(new Animated.Value(1)).current;
  const leftScale = useRef(new Animated.Value(1)).current;
  const rightScale = useRef(new Animated.Value(1)).current;
  const MutedForeground = useCSSVariable("--color-muted-foreground");
  const { selectedDate } = useLocalSearchParams<{ selectedDate?: string }>();

  const headerDate = useMemo(() => {
    const parsed = selectedDate ? new Date(selectedDate) : new Date();
    const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    return {
      dayNumber: date.getDate().toString(),
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

  return (
    <View className="relative flex-1 bg-background-primary p-6 pt-8">
      <View className="mt-8 w-full flex-row items-end justify-between">
        <View className="flex-row items-end">
          <Text className="text-6xl font-bold text-foreground">
            {headerDate.dayNumber}
          </Text>
          <View className="ml-3 mb-2 h-6 w-6 rounded-full bg-red-500" />
        </View>
        <View className="items-end">
          <Text className="text-2xl font-semibold text-muted-foreground">
            {headerDate.weekday}
          </Text>
          <Text className="text-2xl font-semibold text-muted-foreground">
            {headerDate.monthDay}
          </Text>
        </View>
      </View>
      <View className="absolute bottom-8 left-0 right-0">
        <View className="flex-row items-center justify-between px-8">
          <GlassContainer>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/(app)/dash");
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
                  <Ionicons
                    name="stats-chart"
                    size={22}
                    color={MutedForeground as string}
                  />
                </GlassView>
              </Animated.View>
            </Pressable>
          </GlassContainer>

          <GlassContainer>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push({
                  pathname: "/(app)/calendar",
                  params: selectedDate ? { selectedDate } : undefined,
                });
              }}
              onPressIn={() => handlePressIn(rightScale)}
              onPressOut={() => handlePressOut(rightScale)}
            >
              <Animated.View style={{ transform: [{ scale: rightScale }] }}>
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
                  <Ionicons
                    name="calendar"
                    size={22}
                    color={MutedForeground as string}
                  />
                </GlassView>
              </Animated.View>
            </Pressable>
          </GlassContainer>
        </View>

        <View className="absolute left-0 right-0 items-center">
          <GlassContainer>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/(app)/dash");
              }}
              onPressIn={() => handlePressIn(centerScale)}
              onPressOut={() => handlePressOut(centerScale)}
            >
              <Animated.View style={{ transform: [{ scale: centerScale }] }}>
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
