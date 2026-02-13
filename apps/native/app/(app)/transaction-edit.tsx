import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCSSVariable } from "uniwind";
import * as Haptics from "expo-haptics";
import { GlassContainer, GlassView } from "expo-glass-effect";
import {
  encodeTxParam,
  parseTxParam,
  subscribeTxUpdates,
  TransactionPayload,
} from "./transaction-edit-shared";

export default function TransactionEditSheet() {
  const router = useRouter();
  const { data } = useLocalSearchParams<{ data?: string }>();
  const foreground = useCSSVariable("--color-foreground");

  const parsedTx = useMemo<TransactionPayload | null>(
    () => parseTxParam(data),
    [data]
  );
  const [tx, setTx] = useState<TransactionPayload | null>(parsedTx);

  useEffect(() => {
    setTx(parsedTx);
  }, [parsedTx]);

  useEffect(() => {
    const unsubscribe = subscribeTxUpdates((nextTx) => {
      setTx((current) => {
        if (!current || current.id !== nextTx.id) return current;
        return nextTx;
      });
    });
    return unsubscribe;
  }, []);

  if (!tx) {
    return (
      <View className="px-6 pt-6" style={{ backgroundColor: "transparent" }}>
        <Text className="text-base text-muted-foreground">
          Transaction not found.
        </Text>
      </View>
    );
  }

  const openField = (screen: string) => {
    if (!tx) return;
    router.push({
      //@ts-ignore
      pathname: `/(app)/${screen}`,
      params: {
        data: encodeTxParam(tx),
      },
    });
  };

  return (
    <View className={'flex-1 px-6 pt-5'}>
            <View className="flex-row items-center justify-between">
              <Text className="text-3xl font-semibold text-foreground">Edit</Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.back();
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                className="rounded-full p-2"
              >
                <Ionicons name="close" size={20} color={foreground as string} />
              </Pressable>
            </View>
                      <Text className="mt-3 text-xs text-muted-foreground">
                Tap any field to edit details.
              </Text>
              <Text className="mt-1 text-[11px] text-muted-foreground">
                Changes save when you finish each section.
              </Text>

              <View className="mt-6 rounded-2xl overflow-hidden">
                <Pressable
                  onPress={() => openField("transaction-edit-title")}
                  className="flex-row items-center px-4 py-4"
                >
                  <Text className="text-sm text-muted-foreground">Title</Text>
                  <Text
                    className={`ml-4 flex-1 text-right text-base ${
                      tx.title ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {tx.title || "Add"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => openField("transaction-edit-amount")}
                  className="flex-row items-center px-4 py-4"
                >
                  <Text className="text-sm text-muted-foreground">Amount</Text>
                  <Text className="ml-4 flex-1 text-right text-base text-foreground">
                    {tx.amount || "0.00"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => openField("transaction-edit-type")}
                  className="flex-row items-center px-4 py-4"
                >
                  <Text className="text-sm text-muted-foreground">Type</Text>
                  <Text className="ml-4 flex-1 text-right text-base text-foreground">
                    {tx.type === "income" ? "Income" : "Expense"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => openField("transaction-edit-category")}
                  className="flex-row items-center px-4 py-4"
                >
                  <Text className="text-sm text-muted-foreground">Category</Text>
                  <Text
                    className={`ml-4 flex-1 text-right text-base ${
                      tx.category ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {tx.category || "Select"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => openField("transaction-edit-date")}
                  className="flex-row items-center px-4 py-4"
                >
                  <Text className="text-sm text-muted-foreground">Date</Text>
                  <Text
                    className={`ml-4 flex-1 text-right text-base ${
                      tx.occurredAt ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {tx.occurredAt ? tx.occurredAt.slice(0, 10) : "Select"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => openField("transaction-edit-note")}
                  className="flex-row items-center px-4 py-4"
                >
                  <Text className="text-sm text-muted-foreground">Note</Text>
                  <Text
                    className={`ml-4 flex-1 text-right text-base ${
                      tx.note ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {tx.note || "Add"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => openField("transaction-edit-currency")}
                  className="flex-row items-center px-4 py-4"
                >
                  <Text className="text-sm text-muted-foreground">Currency</Text>
                  <Text className="ml-4 flex-1 text-right text-base text-foreground">
                    {tx.currency === "USD" ? "USD ($)" : tx.currency}
                  </Text>
                </Pressable>
              </View>
    </View>
  );
}
