import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  FlatList,
} from "react-native";
import Animated from "react-native-reanimated";
import { useRouter } from "expo-router";
import OnboardingAuthHomePage from "./screen-auth-home";
import OnboardingNamePage from "./screen-name";
import OnboardingDonePage from "./screen-done";
import { SafeAreaView } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authClient } from "@/lib/auth-client";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const StyledSafeAreaView = withUniwind(SafeAreaView);

type OnboardingPage = {
  key: "auth-home" | "name" | "done";
};

const STORAGE_KEYS = {
  name: "@ish/onboarding/name",
  completed: "@ish/onboarding/completed",
};

export default function OnboardingScreen() {
  const router = useRouter();
  const listRef = useRef<FlatList<OnboardingPage>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameShakeSignal, setNameShakeSignal] = useState(0);
  const dragStartX = useRef(0);

  const pages = useMemo<OnboardingPage[]>(
    () => [
      { key: "auth-home" },
      { key: "name" },
      { key: "done" },
    ],
    []
  );

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setIsKeyboardVisible(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setIsKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const handleBack = () => {
    if (currentIndex === 0) {
      router.replace("/(auth)");
      return;
    }
    listRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
  };

  const handleNext = async () => {
    const currentKey = pages[currentIndex]?.key;
    if (currentKey === "name") {
      if (!name.trim()) {
        setNameError("Please enter your name.");
        setNameShakeSignal((v) => v + 1);
        return;
      }
      setNameError(null);
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.name, name.trim());
      } catch {}
    }

    listRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
  };

  const handleFinish = async () => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.name, name.trim()],
        [STORAGE_KEYS.completed, "true"],
      ]);
    } catch {}
    try{
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/(app)",
    });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <StyledSafeAreaView className="flex-1 bg-background">
        <Animated.FlatList
          ref={listRef}
          data={pages}
          horizontal
          pagingEnabled
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const nextIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            if (currentIndex === 1 && nextIndex > currentIndex && !name.trim()) {
              setNameError("Please enter your name.");
              setNameShakeSignal((v) => v + 1);
              listRef.current?.scrollToIndex({ index: currentIndex, animated: true });
              return;
            }
            setCurrentIndex(nextIndex);
          }}
          onScrollBeginDrag={(event) => {
            dragStartX.current = event.nativeEvent.contentOffset.x;
          }}
          onScrollEndDrag={(event) => {
            const endX = event.nativeEvent.contentOffset.x;
            const isForwardDrag = endX - dragStartX.current > 10;
            if (currentIndex === 1 && isForwardDrag && !name.trim()) {
              setNameError("Please enter your name.");
              setNameShakeSignal((v) => v + 1);
              listRef.current?.scrollToIndex({ index: currentIndex, animated: true });
            }
          }}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          // Horizontal FlatList + inputs: keep taps working while keyboard is open.
          // UX: disable horizontal swipes while typing to avoid accidental page changes.
          scrollEnabled={!(isKeyboardVisible && currentIndex === 0)}
          renderItem={({ item }) => {
            return (
              <View className="flex-1 px-6 p-6" style={{ width: SCREEN_WIDTH }}>
                {item.key === "auth-home" && (
                  <OnboardingAuthHomePage onStart={handleNext} />
                )}
                {item.key === "name" && (
                  <OnboardingNamePage
                    name={name}
                    onChangeName={(value) => {
                      if (nameError) setNameError(null);
                      setName(value);
                    }}
                    error={nameError}
                    shakeSignal={nameShakeSignal}
                    onNext={handleNext}
                    onBack={handleBack}
                  />
                )}
                {item.key === "done" && (
                  <OnboardingDonePage onBack={handleBack} onGoogleAuth={handleFinish} />
                )}
              </View>
            );
          }}
        />
      </StyledSafeAreaView>
    </KeyboardAvoidingView>
  );
}
