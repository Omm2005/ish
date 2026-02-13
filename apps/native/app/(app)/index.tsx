import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { GlassView, GlassContainer } from "expo-glass-effect";
import * as Haptics from "expo-haptics";
import { useCSSVariable, withUniwind } from "uniwind";
import { useSelectedDate } from "@/contexts/selected-date-context";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { env } from "@/lib/env";
import { authClient } from "@/lib/auth-client";

const StyledSafeAreaView = withUniwind(SafeAreaView);

export default function AppScreen() {
  const router = useRouter();
  const leftScale = useRef(new Animated.Value(1)).current;
  const rightScale = useRef(new Animated.Value(1)).current;
  const submitScale = useRef(new Animated.Value(1)).current;
  const MutedForeground = useCSSVariable("--color-muted-foreground");
  const CardColor = useCSSVariable("--color-card");
  const BorderColor = useCSSVariable("--color-border");
  const { selectedDate } = useSelectedDate();
  const isOpeningCalendar = useRef(false);
  const [quickText, setQuickText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isOpeningTransaction = useRef(false);
  const rowAnimations = useRef(new Map<string, Animated.Value>());
  const deletingRows = useRef(new Set<string>());
  const [user, setUser] = useState<{
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null>(null);
  const [transactions, setTransactions] = useState<
    Array<{
      id: string;
      title: string;
      amount: string;
      currency: string;
      type: "income" | "expense";
      category?: string | null;
      occurredAt?: string | null;
    }>
  >([]);

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

  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    return {
      income,
      expense,
      net: income - expense,
    };
  }, [transactions]);

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

  const fetchTransactions = useCallback(async () => {
    try {
      const cookie = authClient.getCookie?.() ?? "";
      const dateParam = selectedDate
        ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
        : "";
      const tzOffset = new Date().getTimezoneOffset();
      const res = await fetch(
        `${env.EXPO_PUBLIC_SERVER_URL}/transactions?date=${dateParam}&tzOffset=${tzOffset}`,
        {
          method: "GET",
          headers: {
            cookie,
          },
        }
      );
      if (!res.ok) {
        throw new Error(`Transactions request failed: ${res.status}`);
      }
      const data = await res.json();
      setTransactions(data.transactions ?? []);
    } catch (error) {
      console.log("Failed to load transactions", error);
      setErrorMessage("Couldn't load transactions. Please try again.");
    }
  }, [selectedDate]);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const cookie = authClient.getCookie?.() ?? "";
      const res = await fetch(`${env.EXPO_PUBLIC_SERVER_URL}/transactions/${id}`, {
        method: "DELETE",
        headers: {
          cookie,
        },
      });
      if (!res.ok) {
        throw new Error(`Delete request failed: ${res.status}`);
      }
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    } catch (error) {
      console.log("Failed to delete transaction", error);
    }
  }, []);

  const getRowAnimation = (id: string) => {
    const existing = rowAnimations.current.get(id);
    if (existing) return existing;
    const next = new Animated.Value(1);
    rowAnimations.current.set(id, next);
    return next;
  };

  const animateDelete = (id: string) => {
    if (deletingRows.current.has(id)) return;
    deletingRows.current.add(id);
    const anim = getRowAnimation(id);
    Animated.timing(anim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      deleteTransaction(id);
      deletingRows.current.delete(id);
      rowAnimations.current.delete(id);
    });
  };

  const openTransaction = (tx: {
    id: string;
    title: string;
    amount: string;
    currency: string;
    type: "income" | "expense";
    category?: string | null;
    occurredAt?: string | null;
  }) => {
    if (isOpeningTransaction.current) return;
    isOpeningTransaction.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.navigate({
      pathname: "/(app)/transaction",
      params: {
        data: encodeURIComponent(JSON.stringify(tx)),
      },
    });
    setTimeout(() => {
      isOpeningTransaction.current = false;
    }, 400);
  };

  useFocusEffect(
    useCallback(() => {
      isOpeningCalendar.current = false;
      fetchTransactions();
    }, [fetchTransactions]),
  );


  const submitQuickText = async () => {
    const text = quickText.trim();
    if (!text || isSubmitting) return;
    setIsSubmitting(true);
    try {
      Animated.sequence([
        Animated.spring(submitScale, {
          toValue: 0.94,
          useNativeDriver: true,
          speed: 30,
          bounciness: 6,
        }),
        Animated.spring(submitScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 22,
          bounciness: 6,
        }),
      ]).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const currency =
        (await AsyncStorage.getItem("settings:currency")) ?? "USD";
      const cookie = authClient.getCookie?.() ?? "";
      const res = await fetch(`${env.EXPO_PUBLIC_SERVER_URL}/ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie,
        },
        body: JSON.stringify({ text, currency }),
      });
      if (!res.ok) {
        throw new Error(`AI request failed: ${res.status}`);
      }
      await res.json();
      setQuickText("");
      setErrorMessage(null);
      fetchTransactions();
    } catch (error) {
      console.log("Failed to submit transaction", error);
      setErrorMessage("Couldn't process that entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
      className="flex-1 bg-background-primary"
    >
      <StyledSafeAreaView className="relative flex-1 bg-background-primary px-6">
        <View className="w-full flex-row items-center justify-between">
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
                  {user?.image ? (
                    <Image
                      source={{ uri: user.image }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons
                      name="person"
                      size={22}
                      color={MutedForeground as string}
                    />
                  )}
                </GlassView>
              </Animated.View>
            </Pressable>
          </GlassContainer>
        </View>
        <View className="mt-6 rounded-2xl border border-border/40 px-4 py-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-muted-foreground">
              Overview
            </Text>
            <Text className="text-xs text-muted-foreground">
              {headerDate.monthDay}
            </Text>
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-muted-foreground">Income</Text>
              <Text className="text-base font-semibold text-green-500">
                ${totals.income.toFixed(2)}
              </Text>
            </View>
            <View>
              <Text className="text-xs text-muted-foreground">Expense</Text>
              <Text className="text-base font-semibold text-red-500">
                ${totals.expense.toFixed(2)}
              </Text>
            </View>
            <View>
              <Text className="text-xs text-muted-foreground">Net</Text>
              <Text className="text-base font-semibold text-foreground">
                ${totals.net.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
        <View className="mt-8 flex-1">
          {transactions.length === 0 ? (
            <Text className="text-muted-foreground">No transactions yet.</Text>
          ) : (
            <View className="gap-3">
              {transactions.map((tx) => {
                const isExpense = tx.type === "expense";
                const amount = Number(tx.amount);
                const amountLabel = Number.isFinite(amount)
                  ? amount.toFixed(2)
                  : tx.amount;
                const currencyLabel =
                  tx.currency === "USD" ? "$" : tx.currency;
                const dateLabel = tx.occurredAt
                  ? new Date(tx.occurredAt).toLocaleDateString()
                  : "";
                const rowAnim = getRowAnimation(tx.id);
                return (
                  <Swipeable
                    key={tx.id}
                    friction={1.1}
                    rightThreshold={40}
                    overshootRight
                    overshootFriction={6}
                    onSwipeableOpen={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    renderRightActions={(_progress, dragX) => {
                      const translateX = dragX.interpolate({
                        inputRange: [-80, 0],
                        outputRange: [0, 12],
                        extrapolate: "clamp",
                      });
                      const opacity = dragX.interpolate({
                        inputRange: [-40, 0],
                        outputRange: [1, 0],
                        extrapolate: "clamp",
                      });
                      return (
                        <Animated.View
                          style={{
                            opacity,
                            transform: [{ translateX }],
                          }}
                        >
                          <View className="ml-2 h-full flex-row items-center gap-2">
                            <Pressable
                              onPress={() =>
                                router.push({
                                  pathname: "/(app)/transaction-edit",
                                  params: {
                                    data: encodeURIComponent(JSON.stringify(tx)),
                                  },
                                })
                              }
                              className="h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-card"
                            >
                              <Ionicons
                                name="pencil"
                                size={16}
                                color={MutedForeground as string}
                              />
                            </Pressable>
                            <Pressable
                              onPress={() => animateDelete(tx.id)}
                              className="h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-card"
                            >
                              <Ionicons name="trash" size={16} color="#ef4444" />
                            </Pressable>
                          </View>
                        </Animated.View>
                      );
                    }}
                  >
                    <Animated.View
                      style={{
                        opacity: rowAnim,
                        transform: [
                          {
                            translateX: rowAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-120, 0],
                            }),
                          },
                        ],
                      }}
                    >
                      <Pressable
                        onPress={() => openTransaction(tx)}
                        className="rounded-2xl border border-border/40 bg-card px-4 py-3"
                        style={{
                          shadowColor: "#000",
                          shadowOpacity: 0.08,
                          shadowRadius: 8,
                          shadowOffset: { width: 0, height: 4 },
                          elevation: 3,
                        }}
                      >
                        <View className="flex-row items-center justify-between">
                          <Text className="text-base font-semibold text-foreground">
                            {tx.title}
                          </Text>
                          <Text
                            className={`text-base font-semibold ${
                              isExpense ? "text-red-500" : "text-green-500"
                            }`}
                          >
                        {currencyLabel} {amountLabel}
                          </Text>
                        </View>
                        <View className="mt-1 flex-row items-center justify-between">
                          <Text className="text-sm text-muted-foreground">
                            {tx.category ?? "Uncategorized"}
                          </Text>
                          {dateLabel ? (
                            <Text className="text-sm text-muted-foreground">
                              {dateLabel}
                            </Text>
                          ) : null}
                        </View>
                      </Pressable>
                    </Animated.View>
                  </Swipeable>
                );
              })}
            </View>
          )}
        </View>

        <View className="mt-auto pb-2">
          {errorMessage ? (
            <View className="mb-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2">
              <Text className="text-sm text-red-500">{errorMessage}</Text>
            </View>
          ) : null}
          <GlassContainer>
            <GlassView
              style={{
                width: "100%",
                height: 56,
                borderRadius: 28,
                overflow: "hidden",
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                gap: 12,
              }}
            >
              <TextInput
                placeholder="Add a note..."
                placeholderTextColor={MutedForeground as string}
                value={quickText}
                onChangeText={setQuickText}
                className="flex-1 text-base items-center justify-center text-foreground"
                style={{ textAlignVertical: "center", paddingVertical: 0 }}
                returnKeyType="send"
                onSubmitEditing={submitQuickText}
                editable={!isSubmitting}
              />
              <Pressable
                onPress={submitQuickText}
                onPressIn={() => handlePressIn(rightScale)}
                onPressOut={() => handlePressOut(rightScale)}
                disabled={isSubmitting}
              >
                <Animated.View
                  style={{
                    transform: [
                      { scale: Animated.multiply(rightScale, submitScale) },
                    ],
                  }}
                >
                  <View className="h-9 w-9 items-center justify-center">
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color={MutedForeground as string} />
                    ) : (
                      <Ionicons name="send" size={20} color={MutedForeground as string} />
                    )}
                  </View>
                </Animated.View>
              </Pressable>
            </GlassView>
          </GlassContainer>
        </View>
      </StyledSafeAreaView>
    </KeyboardAvoidingView>
  );
}
