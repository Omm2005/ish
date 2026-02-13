import { useCallback, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";
import { GlassContainer, GlassView } from "expo-glass-effect";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCSSVariable } from "uniwind";

import { ThemeToggle } from "@/components/theme-toggle";
import { authClient } from "@/lib/auth-client";

export default function ProfileScreen() {
  const router = useRouter();
  const foreground = useCSSVariable("--color-foreground");
  const [user, setUser] = useState<{
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadUser = async () => {
        try {
          const raw = await AsyncStorage.getItem("auth:user");
          if (!isActive) return;
          setUser(raw ? JSON.parse(raw) : null);
        } catch (error) {
          console.log("Failed to load user from AsyncStorage", error);
          if (isActive) setUser(null);
        }
      };

      loadUser();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const initials = useMemo(() => {
    const name = user?.name?.trim();
    if (!name) return "?";
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await authClient.signOut();
      await AsyncStorage.removeItem("auth:user");
    } catch (error) {
      console.log("Failed to sign out", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <View className="flex-1 bg-background-primary px-6 pt-10 pb-8">
      <View className="flex-row items-center justify-between">
        <Text className="text-xl font-semibold text-foreground">Profile</Text>
        <View className="flex-row items-center">
          <ThemeToggle />
          <GlassContainer>
            <Pressable
              className="ml-2"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
            >
              <GlassView
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <Ionicons name="close" size={18} color={foreground as string} />
              </GlassView>
            </Pressable>
          </GlassContainer>
        </View>
      </View>

      <View className="items-center">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-card overflow-hidden">
          {user?.image ? (
            <Image
              source={{ uri: user.image }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-3xl font-semibold text-foreground">
              {initials}
            </Text>
          )}
        </View>
        <Text className="mt-4 text-2xl font-semibold text-foreground">
          {user?.name ?? "Unknown User"}
        </Text>
        <Text className="mt-1 text-base text-muted-foreground">
          {user?.email ?? "No email"}
        </Text>
      </View>

      <View className="flex-1" />

      <Pressable
        onPress={handleSignOut}
        disabled={isSigningOut}
        className="h-12 items-center justify-center rounded-full bg-foreground"
      >
        <Text className="text-base font-semibold text-background-primary">
          {isSigningOut ? "Signing out..." : "Sign out"}
        </Text>
      </Pressable>
    </View>
  );
}
